from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import atms, branches, auth

app = FastAPI (
    title= "Cash Cow Management",
    description= "Management",
    version="0.1.0"
)

"""
connection to frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[]
    allow_methods=
    allow_headers=
)
"""

app.include_router(atms.router)
app.include_router(branches.router)
app.include_router(auth.router)