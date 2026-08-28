from fastapi import APIRouter, Depends, HTTPException, Query, status

router = APIRouter(prefix="/atm", tags=["atm"])