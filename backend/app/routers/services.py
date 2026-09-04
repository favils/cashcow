from fastapi import APIRouter, Depends, Query

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.service import ServiceCallRead, DiscrepencyRead, CompletionRead, SupervisorActiveTechniciansRead
from app.models import ServiceCall, Technician, ATM, Branch
from app.models.enums import ServiceStatus

ACTIVE_SERVICE_STATUSES = (ServiceStatus.PENDING, ServiceStatus.IN_PROGRESS)

router = APIRouter(prefix="/service", tags=["service"])

@router.get("", response_model=list[ServiceCallRead])
async def list_service_calls(
        db: AsyncSession = Depends(get_db)
    ):
    statement = select(ServiceCall).order_by(ServiceCall.id)

    result = await db.execute(statement)
    return list(result.scalars().all())

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

@router.get("/supervisor-active-technicians", response_model=SupervisorActiveTechniciansRead)
async def get_supervisor_active_technicians(
        supervisor_id: int = Query(description="Supervisor id"),
        db: AsyncSession = Depends(get_db)
    ):
    statement = (
        select(func.count(func.distinct(Technician.id)))
        .join(Branch, Technician.branch_id == Branch.id)
        .join(ServiceCall, ServiceCall.technician_id == Technician.id)
        .where(Branch.supervisor_id == supervisor_id)
        .where(ServiceCall.status.in_(ACTIVE_SERVICE_STATUSES))
    )

    result = await db.execute(statement)
    count = result.scalar_one()

    return {"supervisor_id": supervisor_id, "active_technician_count": count}

