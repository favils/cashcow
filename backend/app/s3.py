import uuid

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, UploadFile, status

from app.config import settings

ALLOWED_CONTENT_TYPES = {"image/png", "image/jpeg", "text/plain", "application/pdf"}
PRESIGN_EXPIRES_SECONDS = 3600

def extract_s3_key(file_url: str) -> str:
    without_scheme = file_url.removeprefix("s3://")
    _, _, key = without_scheme.partition("/")
    return key

def _client():
    if not settings.s3_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="S3 is not configured"
        )
    # An explicit regional endpoint is required so presigned URLs are signed
    # against the same host they'll actually be requested from - without it,
    # boto3 builds the URL against the legacy global s3.amazonaws.com host,
    # which 307-redirects to the regional host for any non-us-east-1 bucket
    # and invalidates the signature.
    region = boto3.Session().region_name
    return boto3.client("s3", endpoint_url=f"https://s3.{region}.amazonaws.com" if region else None)

async def upload_diagnostic_file(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {file.content_type}"
        )

    key = f"diagnostics/{uuid.uuid4()}-{file.filename}"

    try:
        _client().upload_fileobj(file.file, settings.s3_bucket_name, key)
    except (BotoCoreError, ClientError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload file to S3"
        ) from exc

    return f"s3://{settings.s3_bucket_name}/{key}"

def presign_url(file_url: str) -> str:
    return _client().generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.s3_bucket_name, "Key": extract_s3_key(file_url)},
        ExpiresIn=PRESIGN_EXPIRES_SECONDS,
    )
