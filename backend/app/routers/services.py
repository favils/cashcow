from fastapi import APIRouter, Depends, HTTPException, Query, status

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.schemas.service import ServiceCallRead, ServiceCallCreate, ServiceCallStatusUpdate, DiscrepencyRead, CompletionRead, SupervisorActiveTechniciansRead
from app.models import ServiceCall, Technician, ATM, Branch, User, UserRole
from app.models.enums import ServiceStatus

ACTIVE_SERVICE_STATUSES = (ServiceStatus.PENDING, ServiceStatus.IN_PROGRESS)

router = APIRouter(prefix="/service", tags=["service"])

@router.get("", response_model=list[ServiceCallRead])
async def list_service_calls(
        db: AsyncSession = Depends(get_db),
        _: User = Depends(get_current_user)
    ):
    statement = select(ServiceCall).order_by(ServiceCall.id)

    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/discrepencies", response_model=list[DiscrepencyRead])
async def list_discrepancies(
        db: AsyncSession = Depends(get_db),
        _: User = Depends(get_current_user)
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
        db: AsyncSession = Depends(get_db),
        _: User = Depends(get_current_user)
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
        db: AsyncSession = Depends(get_db),
        _: User = Depends(get_current_user)
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

@router.get("/{service_id}", response_model=ServiceCallRead)
async def get_service_call(
        service_id: int,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(get_current_user)
    ):
    service_call = await db.get(ServiceCall, service_id)
    if service_call is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No service call with id {service_id}")
    return service_call

@router.post("", response_model=ServiceCallRead, status_code=status.HTTP_201_CREATED)
async def create_service_call(
        payload: ServiceCallCreate,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN))
    ):
    service_call = ServiceCall(**payload.model_dump())
    db.add(service_call)
    await db.commit()
    await db.refresh(service_call)
    return service_call

@router.put("/{service_id}", response_model=ServiceCallRead)
async def update_service_call(
        service_id: int,
        payload: ServiceCallCreate,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN))
    ):
    service_call = await db.get(ServiceCall, service_id)
    if service_call is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No service call with id {service_id}")
    for field, value in payload.model_dump().items():
        setattr(service_call, field, value)
    await db.commit()
    await db.refresh(service_call)
    return service_call

@router.patch("/{service_id}/status", response_model=ServiceCallRead)
async def update_service_call_status(
        service_id: int,
        payload: ServiceCallStatusUpdate,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN, UserRole.FIELD_TECHNICIAN))
    ):
    service_call = await db.get(ServiceCall, service_id)
    if service_call is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No service call with id {service_id}")
    service_call.status = payload.status
    await db.commit()
    await db.refresh(service_call)
    return service_call

@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service_call(
        service_id: int,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN))
    ):
    service_call = await db.get(ServiceCall, service_id)
    if service_call is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No service call with id {service_id}")
    await db.delete(service_call)
    await db.commit()
