from .base import Base

from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Enum as SqlEnum

from .enums import ATMStatus

class ATM(Base):
    __tablename__ = "atms"

    id: Mapped[int] = mapped_column(primary_key = True)
    serial_number: Mapped[str] = mapped_column(String(50), unique = True)
    status: Mapped[ATMStatus] = mapped_column(
        SqlEnum(
            ATMStatus,
            name= "atm_status",
            values_callable = lambda enum_cls: [member.value for member in enum_cls]
        )
    )
    model: Mapped[str] = mapped_column(String(150))
    cash_level: Mapped[int] = mapped_column(Integer)
    facility_id: Mapped[int] = mapped_column(Integer)
     