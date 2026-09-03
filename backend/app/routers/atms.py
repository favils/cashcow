from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.schemas.atm import ATMRead
from app.models import ATM
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
    db: AsyncSession = Depends(get_db)
) -> list[ATM]:
    statement = select(ATM).where(ATM.status != ATMStatus.OFFLINE)
    if max_cash is not None:
        statement = statement.where(ATM.cash_level < max_cash)
    statement = statement.order_by(ATM.id)

    result = await db.execute(statement)

    return list(result.scalars().all())
