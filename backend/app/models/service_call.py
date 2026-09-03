from .base import Base
from .enums import ServicePriority, ServiceStatus

from sqlalchemy import Integer, String, ForeignKey
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column

from .atm import ATM

class ServiceCall(Base):

    __tablename__ = "service_calls"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(150))
    priority: Mapped[ServicePriority] = mapped_column(
        SqlEnum(
            ServicePriority,
            name="service_priority",
            values_callable = lambda enum_cls: [member.value for member in enum_cls]
        )
    )
    status: Mapped[ServiceStatus] = mapped_column(
        SqlEnum (
            ServiceStatus,
            name="service_status",
            values_callable = lambda enum_cls: [member.value for member in enum_cls]
        )
    )
    atm_id: Mapped[int] = mapped_column(Integer, ForeignKey("atms.id"))
    technician_id: Mapped[int] = mapped_column(Integer, ForeignKey("technicians.id"))