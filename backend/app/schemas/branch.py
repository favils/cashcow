from pydantic import BaseModel, ConfigDict

class BranchRead(BaseModel):
    id: int
    name: str
    location_region: str
    capacity: int
    supervisor_id: int

    model_config = ConfigDict(from_attributes=True)

class MaintenanceFlagRead(BaseModel):
    branch_id: int
    name: str
    total_atms: int
    maintenance_atms: int

    model_config = ConfigDict(from_attributes=True)
