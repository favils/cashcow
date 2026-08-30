from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import ATMStatus

class ATMBase(BaseModel):
    serial_number: str = Field(min_length=1, max_length=150)
    status: ATMStatus = ATMStatus.OPERATIONAL
    model: str = Field(min_length=1, max_length=150)
    cash_level: Decimal = Field(le=100, ge=0)
    branch_id: int

class ATMRead(ATMBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ATMCreate(ATMBase):
    """
    shape of atm create
    """