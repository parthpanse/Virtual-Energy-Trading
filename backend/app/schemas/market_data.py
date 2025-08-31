from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal
from ..models.market_data import MarketDataType

class MarketDataResponse(BaseModel):
    """Schema for market data responses"""
    id: str
    date: datetime
    hour: int
    data_type: MarketDataType
    price: Decimal
    timestamp: datetime
    source: str
    
    class Config:
        """Pydantic configuration"""
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat()
        }
