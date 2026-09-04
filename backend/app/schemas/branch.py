from pydantic import BaseModel, ConfigDict

class MaintenanceFlagRead(BaseModel):
    branch_id: int
    name: str
    total_atms: int
    maintenance_atms: int

    model_config = ConfigDict(from_attributes=True)
