from datetime import datetime

from pydantic import BaseModel, ConfigDict

class DiagnosticReportRead(BaseModel):
    id: int
    service_call_id: int
    file_url: str
    notes: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
