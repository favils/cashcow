from .base import Base

from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

class Branch(Base):
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150))
    location_region: Mapped[str] = mapped_column(String(150))
    capacity: Mapped[int] = mapped_column(Integer)
    supervisor_id: Mapped[int] = mapped_column(Integer)

