from pydantic import BaseModel, ConfigDict, Field

class DiscrepencyRead(BaseModel):
    service_id: int
    title: str = Field(min_length=1, max_length=150)
    atm_branch_id: int
    technician_branch_id: int

    model_config = ConfigDict(from_attributes=True)

class CompletionRead(BaseModel):
    model: str
    completed: int
    failed: int

    model_config = ConfigDict(from_attributes=True)

class SupervisorActiveTechniciansRead(BaseModel):
    supervisor_id: int
    active_technician_count: int

    model_config = ConfigDict(from_attributes=True)