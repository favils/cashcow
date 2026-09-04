from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.schemas.atm import ATMRead, ATMCreate
from app.models import ATM, User, UserRole
from app.models.enums import ATMStatus

router = APIRouter(prefix="/atm", tags=["atm"])

@router.get("", response_model= list[ATMRead])
async def list_atms(
    max_cash: Decimal | None = Query(
        default = None,
        ge = 0,
        le = 100,
        description = "Only returns atms strictly below this cash level"
    ),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
) -> list[ATM]:
    statement = select(ATM).where(ATM.status != ATMStatus.OFFLINE)
    if max_cash is not None:
        statement = statement.where(ATM.cash_level < max_cash)
    statement = statement.order_by(ATM.id)

    result = await db.execute(statement)

    return list(result.scalars().all())

@router.get("/{atm_id}", response_model=ATMRead)
async def get_atm(
    atm_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user)
) -> ATM:
    atm = await db.get(ATM, atm_id)
    if atm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No ATM with id {atm_id}")
    return atm

@router.post("", response_model=ATMRead, status_code=status.HTTP_201_CREATED)
async def create_atm(
    payload: ATMCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN))
) -> ATM:
    atm = ATM(**payload.model_dump())
    db.add(atm)
    await db.commit()
    await db.refresh(atm)
    return atm

@router.put("/{atm_id}", response_model=ATMRead)
async def update_atm(
    atm_id: int,
    payload: ATMCreate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN))
) -> ATM:
    atm = await db.get(ATM, atm_id)
    if atm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No ATM with id {atm_id}")
    for field, value in payload.model_dump().items():
        setattr(atm, field, value)
    await db.commit()
    await db.refresh(atm)
    return atm

@router.delete("/{atm_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_atm(
    atm_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN))
) -> None:
    atm = await db.get(ATM, atm_id)
    if atm is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No ATM with id {atm_id}")
    await db.delete(atm)
    await db.commit()
