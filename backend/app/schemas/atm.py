from pydantic import BaseModel, ConfigDict, Field

class DiscrepencyRead(BaseModel):
    atm_id: int

class ATMRead(BaseModel):
    """
    """