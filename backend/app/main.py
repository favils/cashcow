from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import atms, services, auth, branches

app = FastAPI (
    title= "Cash Cow Management",
    description= "Management",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(atms.router)
app.include_router(auth.router)
app.include_router(services.router)
app.include_router(branches.router)