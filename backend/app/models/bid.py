from sqlmodel import SQLModel, Field
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
from typing import Optional
import uuid

class BidType(str, Enum):
    """Bid type enumeration"""
    BUY = "BUY"
    SELL = "SELL"

class BidStatus(str, Enum):
    """Bid status enumeration"""
    PENDING = "PENDING"
    EXECUTED = "EXECUTED"
    REJECTED = "REJECTED"

class Bid(SQLModel, table=True):
    """Bid model for energy trading"""
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    bid_type: BidType = Field(..., description="Type of bid (BUY/SELL)")
    quantity: Decimal = Field(..., gt=0, description="Quantity in MWh")
    price: Decimal = Field(..., gt=0, description="Price per MWh")
    user_id: str = Field(..., description="User ID who placed the bid")
    bid_date: date = Field(default_factory=lambda: datetime.now().date(), description="Bid date")
    status: BidStatus = Field(default=BidStatus.PENDING, description="Current bid status")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Bid timestamp")
    execution_price: Optional[Decimal] = Field(default=None, description="Execution price if executed")
    execution_time: Optional[datetime] = Field(default=None, description="Execution timestamp")
    
    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat()
        }
    
    def __init__(self, **data):
        """Custom initialization with validation"""
        super().__init__(**data)
        self._validate_bid()
    
    def _validate_bid(self):
        """Validate bid data"""
        if self.hour < 0 or self.hour > 23:
            raise ValueError("Hour must be between 0 and 23")
        
        if self.quantity <= 0:
            raise ValueError("Quantity must be positive")
        
        if self.price <= 0:
            raise ValueError("Price must be positive")
    
    def __str__(self):
        """String representation of the bid"""
        return f"Bid(id={self.id}, hour={self.hour}, bid_type={self.bid_type}, quantity={self.quantity}, price={self.price}, status={self.status})"
    
    def __repr__(self):
        """Detailed representation of the bid"""
        return self.__str__()

