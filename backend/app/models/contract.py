from sqlmodel import SQLModel, Field
from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Optional
import uuid

class ContractStatus(str, Enum):
    """Contract status enumeration"""
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Contract(SQLModel, table=True):
    """Contract model for executed energy trades"""
    
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    bid_id: str = Field(..., description="Reference to the original bid")
    user_id: str = Field(..., description="User ID who owns the contract")
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    contract_type: str = Field(..., description="Type of contract (BUY/SELL)")
    quantity: Decimal = Field(..., gt=0, description="Quantity in MWh")
    execution_price: Decimal = Field(..., gt=0, description="Execution price per MWh")
    execution_date: datetime = Field(..., description="Date when contract was executed")
    execution_time: datetime = Field(default_factory=datetime.utcnow, description="Execution timestamp")
    status: ContractStatus = Field(default=ContractStatus.ACTIVE, description="Current contract status")
    
    class Config:
        """Pydantic configuration"""
        arbitrary_types_allowed = True
        json_encoders = {
            Decimal: lambda v: float(v),
            datetime: lambda v: v.isoformat()
        }
    
    def __str__(self):
        """String representation of the contract"""
        return f"Contract(id={self.id}, hour={self.hour}, contract_type={self.contract_type}, quantity={self.quantity}, price={self.execution_price}, status={self.status})"
    
    def __repr__(self):
        """Detailed representation of the contract"""
        return self.__str__()
