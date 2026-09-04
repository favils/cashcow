from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.schemas.branch import BranchRead, BranchCreate, MaintenanceFlagRead
from app.models import Branch, ATM, User, UserRole
from app.models.enums import ATMStatus

router = APIRouter(prefix="/branch", tags=["branch"])

@router.get("", response_model=list[BranchRead])
async def list_branches(
        db: AsyncSession = Depends(get_db),
        _: User = Depends(get_current_user)
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
        db: AsyncSession = Depends(get_db),
        _: User = Depends(get_current_user)
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

@router.get("/{branch_id}", response_model=BranchRead)
async def get_branch(
        branch_id: int,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(get_current_user)
    ):
    branch = await db.get(Branch, branch_id)
    if branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No branch with id {branch_id}")
    return branch

@router.post("", response_model=BranchRead, status_code=status.HTTP_201_CREATED)
async def create_branch(
        payload: BranchCreate,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN))
    ):
    branch = Branch(**payload.model_dump())
    db.add(branch)
    await db.commit()
    await db.refresh(branch)
    return branch

@router.put("/{branch_id}", response_model=BranchRead)
async def update_branch(
        branch_id: int,
        payload: BranchCreate,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN))
    ):
    branch = await db.get(Branch, branch_id)
    if branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No branch with id {branch_id}")
    for field, value in payload.model_dump().items():
        setattr(branch, field, value)
    await db.commit()
    await db.refresh(branch)
    return branch

@router.delete("/{branch_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_branch(
        branch_id: int,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN))
    ):
    branch = await db.get(Branch, branch_id)
    if branch is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No branch with id {branch_id}")
    await db.delete(branch)
    await db.commit()
