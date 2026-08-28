from .base import Base

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
class User (Base):
    __tablename__: "users"

    id: Mapped[int] = mapped_column(primary_key = True)
    