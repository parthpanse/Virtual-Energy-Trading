from sqlmodel import Session, select
from datetime import datetime, timezone, date
from decimal import Decimal
from typing import List, Dict, Tuple
from fastapi import HTTPException

from ..models.bid import Bid, BidStatus, BidType
from ..models.contract import Contract, ContractStatus
from ..models.market_data import MarketData, MarketDataType

class ClearingService:
    """Service for market clearing operations"""

    def __init__(self, db: Session):
        self.db = db

    def clear_market(self, target_date: date) -> Dict[str, int]:
        """Clear the market for a specific date"""
        # Get all pending bids for the target date
        pending_bids = self.db.exec(
            select(Bid).where(
                Bid.bid_date == target_date,
                Bid.status == BidStatus.PENDING
            )
        ).all()

        da_price = self.db.exec(
            select(MarketData).where(
                MarketData.trade_date == target_date,
                MarketData.hour == Bid.hour,
                MarketData.data_type == MarketDataType.DAY_AHEAD
            )
        ).first()

        if not pending_bids:
            return {"message": "No pending bids to clear", "contracts_created": 0}

        # Separate buy and sell bids
        buy_bids = [bid for bid in pending_bids if bid.bid_type == BidType.BUY]
        sell_bids = [bid for bid in pending_bids if bid.bid_type == BidType.SELL]

        # Sort bids by price (buy bids descending, sell bids ascending)
        buy_bids.sort(key=lambda x: x.price, reverse=True)
        sell_bids.sort(key=lambda x: x.price)

        contracts_created = 0

        # Match bids and create contracts
        for buy_bid in buy_bids:
            if buy_bid.status != BidStatus.PENDING:
                continue

            for sell_bid in sell_bids:
                if sell_bid.status != BidStatus.PENDING:
                    continue

                # Check if prices match (buy price >= sell price)
                if buy_bid.price >= sell_bid.price:
                    execution_price = da_price.price

                    # Determine quantity to trade
                    trade_quantity = min(buy_bid.quantity, sell_bid.quantity)

                    # Create contracts for both parties
                    buy_contract = Contract(
                        bid_id=buy_bid.id,
                        user_id=buy_bid.user_id,
                        hour=buy_bid.hour,
                        contract_type="BUY",
                        quantity=trade_quantity,
                        execution_price=execution_price,
                        execution_date=datetime.combine(target_date, datetime.min.time()),
                        status=ContractStatus.ACTIVE
                    )

                    sell_contract = Contract(
                        bid_id=sell_bid.id,
                        user_id=sell_bid.user_id,
                        hour=sell_bid.hour,
                        contract_type="SELL",
                        quantity=trade_quantity,
                        execution_price=execution_price,
                        execution_date=datetime.combine(target_date, datetime.min.time()),
                        status=ContractStatus.ACTIVE
                    )

                    # Update bid statuses
                    buy_bid.status = BidStatus.EXECUTED
                    buy_bid.execution_price = execution_price
                    buy_bid.execution_time = datetime.now(timezone.utc)

                    sell_bid.status = BidStatus.EXECUTED
                    sell_bid.execution_price = execution_price
                    sell_bid.execution_time = datetime.now(timezone.utc)

                    # Add contracts and update bids
                    self.db.add(buy_contract)
                    self.db.add(sell_contract)
                    self.db.add(buy_bid)
                    self.db.add(sell_bid)

                    contracts_created += 2

                    # Update remaining quantities
                    buy_bid.quantity -= trade_quantity
                    sell_bid.quantity -= trade_quantity

                    # If quantities are exhausted, mark as fully executed
                    if buy_bid.quantity <= 0:
                        buy_bid.status = BidStatus.EXECUTED
                    if sell_bid.quantity <= 0:
                        sell_bid.status = BidStatus.EXECUTED

                    break

        # Commit all changes
        self.db.commit()

        return {
            "message": f"Market cleared for {target_date}",
            "contracts_created": contracts_created,
            "total_bids_processed": len(pending_bids)
        }

    def get_clearing_summary(self, target_date: date) -> Dict:
        """Get a summary of market clearing results"""
        # Convert date to datetime for comparison
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())

        contracts = self.db.exec(
            select(Contract).where(
                Contract.execution_date >= start_datetime,
                Contract.execution_date <= end_datetime
            )
        ).all()

        if not contracts:
            return {"message": "No contracts found for the specified date"}

        # Calculate summary statistics
        total_volume = sum(contract.quantity for contract in contracts)
        avg_price = sum(contract.execution_price * contract.quantity for contract in contracts) / total_volume if total_volume > 0 else 0

        buy_contracts = [c for c in contracts if c.contract_type == "BUY"]
        sell_contracts = [c for c in contracts if c.contract_type == "SELL"]

        return {
            "date": target_date,
            "total_contracts": len(contracts),
            "buy_contracts": len(buy_contracts),
            "sell_contracts": len(sell_contracts),
            "total_volume_mwh": float(total_volume),
            "average_price": float(avg_price),
            "contracts": contracts
        }
