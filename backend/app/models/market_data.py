from sqlmodel import SQLModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional
from enum import Enum
import uuid

class MarketDataType(str, Enum):
    """Market data type enumeration"""
    DAY_AHEAD = "DAY_AHEAD"
    REAL_TIME = "REAL_TIME"

class MarketData(SQLModel, table=True):
    """Market data model for energy prices"""
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    date: datetime = Field(..., description="Date of the market data")
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    data_type: MarketDataType = Field(..., description="Type of market data")
    price: Decimal = Field(..., gt=0, description="Price per MWh")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Data timestamp")
    source: str = Field(default="mock", description="Data source (mock/grid_status)")
    
    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat()
        }
    
    def __str__(self):
        """String representation of the market data"""
        return f"MarketData(date={self.date}, hour={self.hour}, type={self.data_type}, price={self.price})"
    
    def __repr__(self):
        """Detailed representation of the market data"""
        return self.__str__()
