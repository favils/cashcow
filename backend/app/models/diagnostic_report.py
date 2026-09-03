from .base import Base

from sqlalchemy import Integer, String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from datetime import datetime

class DiagnosticReport(Base):

    __tablename__ = "diagnostic_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    service_call_id: Mapped[int] = mapped_column(Integer, ForeignKey("service_calls.id"))
    file_url: Mapped[str] = mapped_column(Text)
    notes: Mapped[str] = mapped_column(Text, nullable= True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now()
    )