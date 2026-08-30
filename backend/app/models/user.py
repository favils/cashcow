from app.models.enums import UserRole

from .base import Base

from sqlalchemy import Integer, String, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column

class User (Base):
    __tablename__: "users"

    id: Mapped[int] = mapped_column(primary_key = True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(150))
    user_role: Mapped[UserRole] = mapped_column(
        SqlEnum(
            UserRole,
            name="user_role",
            values_callable = lambda enums_cls: [member.value for member in enums_cls],
        )
    )