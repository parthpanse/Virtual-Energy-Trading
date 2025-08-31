from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from datetime import datetime

from ..database import get_session
from ..services.bid_service import BidService
from ..schemas.bid import BidCreate, BidResponse, BidUpdate

router = APIRouter(prefix="/api/bids", tags=["bidding"])

@router.post("/", response_model=BidResponse, status_code=201)
async def create_bid(
    bid_data: BidCreate,
    db: Session = Depends(get_session)
):
    """Create a new energy trading bid"""
    bid_service = BidService(db)
    
    try:
        bid = bid_service.create_bid(bid_data)
        return bid
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{bid_id}", response_model=BidResponse)
async def get_bid(
    bid_id: str,
    db: Session = Depends(get_session)
):
    """Get a specific bid by ID"""
    bid_service = BidService(db)
    bid = bid_service.get_bid(bid_id)
    
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
    
    return bid

@router.get("/", response_model=List[BidResponse])
async def get_user_bids(
    user_id: str = Query(..., description="User ID to get bids for"),
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Get all bids for a specific user"""
    bid_service = BidService(db)
    
    # Parse date if provided
    target_date = None
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    bids = bid_service.get_user_bids(user_id, target_date)
    return bids

@router.put("/{bid_id}", response_model=BidResponse)
async def update_bid(
    bid_id: str,
    bid_update: BidUpdate,
    db: Session = Depends(get_session)
):
    """Update an existing bid"""
    bid_service = BidService(db)
    
    try:
        bid = bid_service.update_bid(bid_id, bid_update)
        if not bid:
            raise HTTPException(status_code=404, detail="Bid not found")
        return bid
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{bid_id}", status_code=204)
async def delete_bid(
    bid_id: str,
    db: Session = Depends(get_session)
):
    """Delete a bid"""
    bid_service = BidService(db)
    
    try:
        success = bid_service.delete_bid(bid_id)
        if not success:
            raise HTTPException(status_code=404, detail="Bid not found")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pending/", response_model=List[BidResponse])
async def get_pending_bids(
    hour: Optional[int] = Query(None, ge=0, le=23, description="Filter by hour (0-23)"),
    db: Session = Depends(get_session)
):
    """Get all pending bids, optionally filtered by hour"""
    bid_service = BidService(db)
    bids = bid_service.get_pending_bids(hour)
    return bids
