from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from typing import Optional
from ..models.contract import ContractStatus

class ContractResponse(BaseModel):
    """Schema for contract responses"""
    id: str
    bid_id: str
    user_id: str
    hour: int
    contract_type: str
    quantity: Decimal
    execution_price: Decimal
    execution_date: datetime
    execution_time: datetime
    status: ContractStatus
    
    class Config:
        """Pydantic configuration"""
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat()
        }
