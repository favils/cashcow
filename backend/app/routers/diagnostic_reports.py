from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_current_user, require_role
from app.schemas.diagnostic_report import DiagnosticReportRead
from app.models import DiagnosticReport, User, UserRole
from app.s3 import upload_diagnostic_file, presign_url

router = APIRouter(prefix="/diagnostic-report", tags=["diagnostic-report"])

def _to_read(report: DiagnosticReport) -> DiagnosticReportRead:
    return DiagnosticReportRead(
        id=report.id,
        service_call_id=report.service_call_id,
        file_url=presign_url(report.file_url),
        notes=report.notes,
        created_at=report.created_at,
    )

@router.get("", response_model=list[DiagnosticReportRead])
async def list_diagnostic_reports(
        db: AsyncSession = Depends(get_db),
        _: User = Depends(get_current_user)
    ):
    result = await db.execute(select(DiagnosticReport).order_by(DiagnosticReport.id))
    return [_to_read(report) for report in result.scalars().all()]

@router.post("", response_model=DiagnosticReportRead, status_code=status.HTTP_201_CREATED)
async def create_diagnostic_report(
        service_call_id: int = Form(...),
        notes: str | None = Form(None),
        file: UploadFile = File(...),
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN, UserRole.FIELD_TECHNICIAN))
    ):
    key = await upload_diagnostic_file(file)

    report = DiagnosticReport(service_call_id=service_call_id, file_url=key, notes=notes)
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return _to_read(report)

@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_diagnostic_report(
        report_id: int,
        db: AsyncSession = Depends(get_db),
        _: User = Depends(require_role(UserRole.OPERATIONS_ADMIN))
    ):
    report = await db.get(DiagnosticReport, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No diagnostic report with id {report_id}")
    await db.delete(report)
    await db.commit()
