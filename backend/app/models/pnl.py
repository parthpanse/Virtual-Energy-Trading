from sqlmodel import SQLModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional
import uuid

class PnLRecord(SQLModel, table=True):
    """Profit and Loss record for energy trading"""
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(..., description="User ID for the PnL record")
    contract_id: str = Field(..., description="Reference to the contract")
    date: datetime = Field(..., description="Date of the PnL calculation")
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    day_ahead_price: Decimal = Field(..., description="Day-ahead contract price")
    real_time_price: Decimal = Field(..., description="Real-time market price")
    quantity: Decimal = Field(..., gt=0, description="Quantity in MWh")
    pnl_amount: Decimal = Field(..., description="Profit/Loss amount")
    pnl_type: str = Field(..., description="Type of PnL (REALIZED/UNREALIZED)")
    calculation_time: datetime = Field(default_factory=datetime.utcnow, description="Calculation timestamp")
    
    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat()
        }
    
    def __str__(self):
        """String representation of the PnL record"""
        return f"PnLRecord(id={self.id}, date={self.date}, hour={self.hour}, pnl={self.pnl_amount}, type={self.pnl_type})"
    
    def __repr__(self):
        """Detailed representation of the PnL record"""
        return self.__str__()
