from datetime import datetime, timedelta, timezone
import bcrypt
import jwt

from app.config import settings

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(plain_password: str) -> str:
    hash = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt())
    return hash.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode["exp"] = expire
    return jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])

