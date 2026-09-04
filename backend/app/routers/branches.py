from decimal import Decimal

from fastapi import APIRouter, Depends, Query

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.branch import BranchRead, MaintenanceFlagRead
from app.models import Branch, ATM
from app.models.enums import ATMStatus

router = APIRouter(prefix="/branch", tags=["branch"])

@router.get("", response_model=list[BranchRead])
async def list_branches(
        db: AsyncSession = Depends(get_db)
    ):
    statement = select(Branch).order_by(Branch.id)

    result = await db.execute(statement)
    return list(result.scalars().all())

@router.get("/maintenance-flags", response_model=list[MaintenanceFlagRead])
async def list_maintenance_flags(
        min_percentage: Decimal = Query(
            default=Decimal(30),
            ge=0,
            le=100,
            description="Only returns branches with more than this percentage of ATMs flagged for maintenance"
        ),
        db: AsyncSession = Depends(get_db)
    ):
    total_atms = func.count(ATM.id)
    maintenance_atms = func.count(case((ATM.status == ATMStatus.MAINTENANCE, 1)))

    statement = (
        select(
            Branch.id.label("branch_id"),
            Branch.name,
            total_atms.label("total_atms"),
            maintenance_atms.label("maintenance_atms"),
        )
        .join(ATM, ATM.branch_id == Branch.id)
        .group_by(Branch.id, Branch.name)
        .having(maintenance_atms * 100 > total_atms * min_percentage)
    )

    result = await db.execute(statement)
    return list(result.mappings().all())
