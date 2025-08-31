from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal

class PnLResponse(BaseModel):
    """Schema for PnL responses"""
    id: str
    user_id: str
    contract_id: str
    date: datetime
    hour: int
    day_ahead_price: Decimal
    real_time_price: Decimal
    quantity: Decimal
    pnl_amount: Decimal
    pnl_type: str
    calculation_time: datetime
    
    class Config:
        """Pydantic configuration"""
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat()
        }
