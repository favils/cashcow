from fastapi import APIRouter, Depends

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.service import DiscrepencyRead
from app.models import ServiceCall, Technician, ATM
from app.models.enums import ServicePriority

router = APIRouter(prefix="/service", tags=["service"])

@router.get("/discrepencies", response_model=list[DiscrepencyRead])
async def list_discrepencies(
        db: AsyncSession = Depends(get_db),
        priority: ServicePriority | None = None
    ):
    statement = (
        select(ServiceCall.id.label("service_id"), ServiceCall.title, ATM.branch_id.label("atm_branch_id"), Technician.branch_id.label("technician_branch_id"))
        .join(ATM, ServiceCall.atm_id == ATM.id)
        .join(Technician, ServiceCall.technician_id == Technician.id)
        .where(ATM.branch_id != Technician.branch_id)
    )

    if priority is not None:
        statement = statement.where(ServiceCall.priority == priority)

    result = await db.execute(statement)
    return list(result.mappings().all())

