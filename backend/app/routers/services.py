from fastapi import APIRouter, Depends

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.service import DiscrepencyRead
from app.models import ServiceCall, Technician, ATM

router = APIRouter(prefix="/service", tags=["service"])

@router.get("/discrepencies", response_model=list[DiscrepencyRead])
async def list_discrepencies(
    db: AsyncSession = Depends(get_db)
):
    statement = (
        select(ServiceCall.id.label("Service Call ID"), Technician.branch_id.label("Technician Branch ID"), ATM.branch_id("ATM Branch ID"))
        .join(Technician, Technician.id == ServiceCall.technician_id)
        .join(ATM, ATM.id == ServiceCall.atm_id)
        .where(Technician.branch_id != ATM.branch_id)
    )

    



