from fastapi import APIRouter, Depends, HTTPException, Query, status

router = APIRouter(prefix="/branches", tags=["branches"])