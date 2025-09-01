from sqlmodel import Session, select
from datetime import datetime, timezone, date
from decimal import Decimal
from typing import List, Dict, Optional
from fastapi import HTTPException

from ..models.contract import Contract, ContractStatus
from ..models.pnl import PnLRecord
from ..models.market_data import MarketData, MarketDataType

class PnLService:
    """Service for profit and loss calculations"""

    def __init__(self, db: Session):
        self.db = db

    def calculate_pnl(self, user_id: str, target_date: date) -> List[PnLRecord]:
        """Calculate PnL for a user on a specific date"""
        # Get all active contracts for the user on the target date
        # Convert date to datetime range for comparison
        start_datetime = datetime.combine(target_date, datetime.min.time())
        end_datetime = datetime.combine(target_date, datetime.max.time())

        contracts = self.db.exec(
            select(Contract).where(
                Contract.user_id == user_id,
                Contract.execution_date >= start_datetime,
                Contract.execution_date <= end_datetime,
                Contract.status.in_([ContractStatus.ACTIVE, ContractStatus.COMPLETED])
            )
        ).all()

        if not contracts:
            return []

        pnl_records = []

        for contract in contracts:
            # Get day-ahead price from market data
            day_ahead_data = self.db.exec(
                select(MarketData).where(
                    MarketData.trade_date == target_date,
                    MarketData.hour == contract.hour,
                    MarketData.data_type == MarketDataType.DAY_AHEAD
                )
            ).first()

            if not day_ahead_data:
                # If no day-ahead data, skip this contract
                continue

            day_ahead_price = day_ahead_data.price

            # Get real-time price for the same hour
            real_time_data = self.db.exec(
                select(MarketData).where(
                    MarketData.trade_date == target_date,
                    MarketData.hour == contract.hour,
                    MarketData.data_type == MarketDataType.REAL_TIME
                )
            ).first()

            if not real_time_data:
                # If no real-time data, skip this contract
                continue

            real_time_price = real_time_data.price

            # Calculate PnL based on contract type
            if contract.contract_type == "BUY":
                # For buy contracts: PnL = (Real-time price - Day-ahead price) * Quantity
                pnl_amount = (real_time_price - day_ahead_price) * contract.quantity
            else:  # SELL
                # For sell contracts: PnL = (Day-ahead price - Real-time price) * Quantity
                pnl_amount = (day_ahead_price - real_time_price) * contract.quantity

            # Create PnL record
            pnl_record = PnLRecord(
                user_id=user_id,
                contract_id=contract.id,
                date=target_date,
                hour=contract.hour,
                day_ahead_price=day_ahead_price,
                real_time_price=real_time_price,
                quantity=contract.quantity,
                pnl_amount=pnl_amount,
                pnl_type="REALIZED" if contract.status == ContractStatus.COMPLETED else "UNREALIZED"
            )

            pnl_records.append(pnl_record)

        # Save all PnL records
        for record in pnl_records:
            self.db.add(record)

        self.db.commit()

        return pnl_records

    def get_user_pnl(self, user_id: str, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[PnLRecord]:
        """Get PnL records for a user within a date range"""
        query = select(PnLRecord).where(PnLRecord.user_id == user_id)

        if start_date:
            # Convert date to datetime for comparison
            start_datetime = datetime.combine(start_date, datetime.min.time())
            query = query.where(PnLRecord.date >= start_datetime)
        if end_date:
            # Convert date to datetime for comparison
            end_datetime = datetime.combine(end_date, datetime.max.time())
            query = query.where(PnLRecord.date <= end_datetime)

        query = query.order_by(PnLRecord.date.desc(), PnLRecord.hour)

        return self.db.exec(query).all()

    def get_pnl_summary(self, user_id: str, target_date: date) -> Dict:
        """Get a summary of PnL for a user on a specific date"""
        pnl_records = self.get_user_pnl(user_id, target_date, target_date)

        if not pnl_records:
            return {
                "date": target_date,
                "total_pnl": 0.0,
                "realized_pnl": 0.0,
                "unrealized_pnl": 0.0,
                "total_volume": 0.0,
                "records_count": 0
            }

        total_pnl = sum(record.pnl_amount for record in pnl_records)
        realized_pnl = sum(record.pnl_amount for record in pnl_records if record.pnl_type == "REALIZED")
        unrealized_pnl = sum(record.pnl_amount for record in pnl_records if record.pnl_type == "UNREALIZED")
        total_volume = sum(record.quantity for record in pnl_records)

        return {
            "date": target_date,
            "total_pnl": float(total_pnl),
            "realized_pnl": float(realized_pnl),
            "unrealized_pnl": float(unrealized_pnl),
            "total_volume": float(total_volume),
            "records_count": len(pnl_records),
            "hourly_breakdown": [
                {
                    "hour": record.hour,
                    "pnl": float(record.pnl_amount),
                    "type": record.pnl_type,
                    "day_ahead_price": float(record.day_ahead_price),
                    "real_time_price": float(record.real_time_price)
                }
                for record in pnl_records
            ]
        }

    def get_portfolio_pnl(self, user_id: str) -> Dict:
        """Get overall portfolio PnL for a user"""
        # Get all PnL records for the user
        all_pnl = self.get_user_pnl(user_id)

        if not all_pnl:
            return {
                "total_pnl": 0.0,
                "realized_pnl": 0.0,
                "unrealized_pnl": 0.0,
                "total_volume": 0.0,
                "total_contracts": 0
            }

        total_pnl = sum(record.pnl_amount for record in all_pnl)
        realized_pnl = sum(record.pnl_amount for record in all_pnl if record.pnl_type == "REALIZED")
        unrealized_pnl = sum(record.pnl_amount for record in all_pnl if record.pnl_type == "UNREALIZED")
        total_volume = sum(record.quantity for record in all_pnl)

        # Count unique contracts
        unique_contracts = len(set(record.contract_id for record in all_pnl))

        return {
            "total_pnl": float(total_pnl),
            "realized_pnl": float(realized_pnl),
            "unrealized_pnl": float(unrealized_pnl),
            "total_volume": float(total_volume),
            "total_contracts": unique_contracts
        }
