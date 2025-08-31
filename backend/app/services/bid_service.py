from sqlmodel import Session, select
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException

from ..models.bid import Bid, BidStatus
from ..schemas.bid import BidCreate, BidUpdate

class BidService:
    """Service for managing energy trading bids"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_bid(self, bid_data: BidCreate) -> Bid:
        """Create a new bid with validation"""
        # Check if user has reached the 10 bid limit for this hour
        existing_bids = self.db.exec(
            select(Bid).where(
                Bid.user_id == bid_data.user_id,
                Bid.hour == bid_data.hour,
                Bid.bid_date == datetime.now(timezone.utc).date(),
                Bid.status == BidStatus.PENDING
            )
        ).all()
        
        if len(existing_bids) >= 10:
            raise HTTPException(
                status_code=400, 
                detail="Maximum 10 bids per hour exceeded"
            )
        
        # Check if market is still open (before 11:00 AM)
        current_time = datetime.now(timezone.utc)
        if current_time.hour >= 11:
            raise HTTPException(
                status_code=400,
                detail="Market is closed. Bidding closes at 11:00 AM"
            )
        
        # Create new bid
        bid = Bid(
            hour=bid_data.hour,
            bid_type=bid_data.type,
            quantity=bid_data.quantity,
            price=bid_data.price,
            user_id=bid_data.user_id
        )
        
        self.db.add(bid)
        self.db.commit()
        self.db.refresh(bid)
        
        return bid
    
    def get_bid(self, bid_id: str) -> Optional[Bid]:
        """Get a bid by ID"""
        return self.db.exec(select(Bid).where(Bid.id == bid_id)).first()
    
    def get_user_bids(self, user_id: str, date: Optional[datetime] = None) -> List[Bid]:
        """Get all bids for a user, optionally filtered by date"""
        query = select(Bid).where(Bid.user_id == user_id)
        
        if date:
            query = query.where(Bid.bid_date == date.date())
        
        return self.db.exec(query).all()
    
    def update_bid(self, bid_id: str, bid_update: BidUpdate) -> Optional[Bid]:
        """Update an existing bid"""
        bid = self.get_bid(bid_id)
        if not bid:
            return None
        
        # Only allow updates to pending bids
        if bid.status != BidStatus.PENDING:
            raise HTTPException(
                status_code=400,
                detail="Cannot update non-pending bid"
            )
        
        # Update fields
        if bid_update.quantity is not None:
            bid.quantity = bid_update.quantity
        if bid_update.price is not None:
            bid.price = bid_update.price
        
        self.db.add(bid)
        self.db.commit()
        self.db.refresh(bid)
        
        return bid
    
    def delete_bid(self, bid_id: str) -> bool:
        """Delete a bid"""
        bid = self.get_bid(bid_id)
        if not bid:
            return False
        
        # Only allow deletion of pending bids
        if bid.status != BidStatus.PENDING:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete non-pending bid"
            )
        
        self.db.delete(bid)
        self.db.commit()
        
        return True
    
    def get_pending_bids(self, hour: Optional[int] = None) -> List[Bid]:
        """Get all pending bids, optionally filtered by hour"""
        query = select(Bid).where(Bid.status == BidStatus.PENDING)
        
        if hour is not None:
            query = query.where(Bid.hour == hour)
        
        return self.db.exec(query).all()
