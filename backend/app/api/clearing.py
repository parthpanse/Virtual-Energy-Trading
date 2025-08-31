from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import Dict
from datetime import date

from ..database import get_session
from ..services.clearing_service import ClearingService

router = APIRouter(prefix="/api/clear", tags=["clearing"])

@router.post("/", status_code=200)
async def clear_market(
    target_date: str = Query(..., description="Date to clear market (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Clear the energy market for a specific date"""
    clearing_service = ClearingService(db)
    
    try:
        # Parse the date
        parsed_date = date.fromisoformat(target_date)
        
        # Perform market clearing
        result = clearing_service.clear_market(parsed_date)
        
        return result
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary/", status_code=200)
async def get_clearing_summary(
    target_date: str = Query(..., description="Date to get summary for (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Get a summary of market clearing results for a specific date"""
    clearing_service = ClearingService(db)
    
    try:
        # Parse the date
        parsed_date = date.fromisoformat(target_date)
        
        # Get clearing summary
        summary = clearing_service.get_clearing_summary(parsed_date)
        
        return summary
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/daily/", status_code=200)
async def trigger_daily_clearing(
    db: Session = Depends(get_session)
):
    """Trigger daily market clearing (typically called at 11:00 AM)"""
    clearing_service = ClearingService(db)
    
    try:
        # Use today's date
        today = date.today()
        
        # Perform market clearing
        result = clearing_service.clear_market(today)
        
        return {
            "message": "Daily market clearing completed",
            "date": today.isoformat(),
            "result": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
