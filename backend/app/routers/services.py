from fastapi import APIRouter, Depends

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.service import DiscrepencyRead, CompletionRead
from app.models import ServiceCall, Technician, ATM
from app.models.enums import ServiceStatus

router = APIRouter(prefix="/service", tags=["service"])

@router.get("/discrepencies", response_model=list[DiscrepencyRead])
async def list_discrepencies(
        db: AsyncSession = Depends(get_db)
    ):
    statement = (
        select(ServiceCall.id.label("service_id"), ServiceCall.title, ATM.branch_id.label("atm_branch_id"), Technician.branch_id.label("technician_branch_id"))
        .join(ATM, ServiceCall.atm_id == ATM.id)
        .join(Technician, ServiceCall.technician_id == Technician.id)
        .where(ATM.branch_id != Technician.branch_id)
    )

    result = await db.execute(statement)
    return list(result.mappings().all())

@router.get("/completion", response_model=list[CompletionRead])
async def get_completions(
        db: AsyncSession = Depends(get_db)
    ):
    statement = (
        select(
            ATM.model,
            func.count(case((ServiceCall.status == ServiceStatus.COMPLETED, 1))).label("completed"),
            func.count(case((ServiceCall.status == ServiceStatus.FAILED, 1))).label("failed"),
        )
        .join(ATM, ServiceCall.atm_id == ATM.id)
        .group_by(ATM.model)
    )

    result = await db.execute(statement)
    return list(result.mappings().all())

