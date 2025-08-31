from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Dict, Optional
from datetime import date

from ..database import get_session
from ..services.pnl_service import PnLService

router = APIRouter(prefix="/api/pnl", tags=["pnl"])

@router.post("/calculate/", status_code=200)
async def calculate_pnl(
    user_id: str = Query(..., description="User ID to calculate PnL for"),
    target_date: str = Query(..., description="Date to calculate PnL for (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Calculate PnL for a user on a specific date"""
    pnl_service = PnLService(db)
    
    try:
        # Parse the date
        parsed_date = date.fromisoformat(target_date)
        
        # Calculate PnL
        pnl_records = pnl_service.calculate_pnl(user_id, parsed_date)
        
        return {
            "message": f"PnL calculated for {target_date}",
            "user_id": user_id,
            "date": target_date,
            "records_created": len(pnl_records)
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", status_code=200)
async def get_user_pnl(
    user_id: str,
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Get PnL records for a user within a date range"""
    pnl_service = PnLService(db)
    
    try:
        # Parse dates if provided
        parsed_start_date = None
        parsed_end_date = None
        
        if start_date:
            parsed_start_date = date.fromisoformat(start_date)
        if end_date:
            parsed_end_date = date.fromisoformat(end_date)
        
        # Get PnL records
        pnl_records = pnl_service.get_user_pnl(user_id, parsed_start_date, parsed_end_date)
        
        return {
            "user_id": user_id,
            "start_date": start_date,
            "end_date": end_date,
            "records_count": len(pnl_records),
            "pnl_records": pnl_records
        }
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/{user_id}", status_code=200)
async def get_pnl_summary(
    user_id: str,
    target_date: str = Query(..., description="Date to get summary for (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Get a summary of PnL for a user on a specific date"""
    pnl_service = PnLService(db)
    
    try:
        # Parse the date
        parsed_date = date.fromisoformat(target_date)
        
        # Get PnL summary
        summary = pnl_service.get_pnl_summary(user_id, parsed_date)
        
        return summary
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/portfolio/{user_id}", status_code=200)
async def get_portfolio_pnl(
    user_id: str,
    db: Session = Depends(get_session)
):
    """Get overall portfolio PnL for a user"""
    pnl_service = PnLService(db)
    
    try:
        # Get portfolio PnL
        portfolio = pnl_service.get_portfolio_pnl(user_id)
        
        return portfolio
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
