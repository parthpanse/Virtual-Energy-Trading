from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional
from ..models.bid import BidType, BidStatus

class BidCreate(BaseModel):
    """Schema for creating a new bid"""
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    bid_type: BidType = Field(..., description="Type of bid (BUY/SELL)")
    quantity: Decimal = Field(..., gt=0, description="Quantity in MWh")
    price: Decimal = Field(..., gt=0, description="Price per MWh")
    user_id: str = Field(..., description="User ID who is placing the bid")

class BidUpdate(BaseModel):
    """Schema for updating an existing bid"""
    quantity: Optional[Decimal] = Field(None, gt=0, description="New quantity in MWh")
    price: Optional[Decimal] = Field(None, gt=0, description="New price per MWh")

class BidResponse(BaseModel):
    """Schema for bid responses"""
    id: str
    hour: int
    bid_type: BidType  # Changed from 'type' to 'bid_type' to match model
    quantity: Decimal
    price: Decimal
    user_id: str
    status: BidStatus
    timestamp: datetime
    execution_price: Optional[Decimal] = None
    execution_time: Optional[datetime] = None
    
    class Config:
        """Pydantic configuration"""
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat()
        }
