from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Dict
from datetime import date, datetime

from ..database import get_session
from ..models.contract import Contract, ContractStatus
from ..schemas.contract import ContractResponse

router = APIRouter(prefix="/api/contracts", tags=["contracts"])

@router.get("/", response_model=List[ContractResponse])
async def get_contracts(
    user_id: str = Query(None, description="Filter by user ID"),
    status: ContractStatus = Query(None, description="Filter by contract status"),
    target_date: str = Query(None, description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Get all contracts with optional filtering"""
    query = select(Contract)
    
    if user_id:
        query = query.where(Contract.user_id == user_id)
    
    if status:
        query = query.where(Contract.status == status)
    
    if target_date:
        try:
            parsed_date = date.fromisoformat(target_date)
            start_datetime = datetime.combine(parsed_date, datetime.min.time())
            end_datetime = datetime.combine(parsed_date, datetime.max.time())
            query = query.where(
                Contract.execution_date >= start_datetime,
                Contract.execution_date <= end_datetime
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    contracts = db.exec(query).all()
    return contracts

@router.put("/{contract_id}/status")
async def update_contract_status(
    contract_id: str,
    status: ContractStatus,
    db: Session = Depends(get_session)
):
    """Update contract status"""
    contract = db.exec(select(Contract).where(Contract.id == contract_id)).first()
    
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    contract.status = status
    db.add(contract)
    db.commit()
    db.refresh(contract)
    
    return {
        "message": f"Contract {contract_id} status updated to {status}",
        "contract": contract
    }

@router.post("/complete-all-active")
async def complete_all_active_contracts(
    target_date: str = Query(..., description="Date to complete contracts for (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Mark all active contracts for a specific date as completed"""
    try:
        parsed_date = date.fromisoformat(target_date)
        start_datetime = datetime.combine(parsed_date, datetime.min.time())
        end_datetime = datetime.combine(parsed_date, datetime.max.time())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    # Find all active contracts for the target date
    active_contracts = db.exec(
        select(Contract).where(
            Contract.status == ContractStatus.ACTIVE,
            Contract.execution_date >= start_datetime,
            Contract.execution_date <= end_datetime
        )
    ).all()
    
    if not active_contracts:
        return {
            "message": f"No active contracts found for {target_date}",
            "contracts_updated": 0
        }
    
    # Mark all contracts as completed
    for contract in active_contracts:
        contract.status = ContractStatus.COMPLETED
    
    db.commit()
    
    return {
        "message": f"All active contracts for {target_date} marked as completed",
        "contracts_updated": len(active_contracts),
        "date": target_date
    }

@router.get("/summary/", response_model=Dict)
async def get_contracts_summary(
    target_date: str = Query(..., description="Date to get summary for (YYYY-MM-DD)"),
    db: Session = Depends(get_session)
):
    """Get summary of contracts by status for a specific date"""
    try:
        parsed_date = date.fromisoformat(target_date)
        start_datetime = datetime.combine(parsed_date, datetime.min.time())
        end_datetime = datetime.combine(parsed_date, datetime.max.time())
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    
    contracts = db.exec(
        select(Contract).where(
            Contract.execution_date >= start_datetime,
            Contract.execution_date <= end_datetime
        )
    ).all()
    
    if not contracts:
        return {"message": "No contracts found for the specified date"}
    
    active_count = len([c for c in contracts if c.status == ContractStatus.ACTIVE])
    completed_count = len([c for c in contracts if c.status == ContractStatus.COMPLETED])
    cancelled_count = len([c for c in contracts if c.status == ContractStatus.CANCELLED])
    
    return {
        "date": target_date,
        "total_contracts": len(contracts),
        "active_contracts": active_count,
        "completed_contracts": completed_count,
        "cancelled_contracts": cancelled_count
    }
