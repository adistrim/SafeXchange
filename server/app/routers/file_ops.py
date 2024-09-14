from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from app.auth import get_current_user
from app.models import UserInDB
import boto3
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv

router = APIRouter()
load_dotenv()

s3 = boto3.client('s3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

ALLOWED_EXTENSIONS = {'.pptx', '.docx', '.xlsx'}
BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
CLOUDFRONT_DOMAIN = os.getenv('CLOUDFRONT_DOMAIN')

def allowed_file(filename):
    return os.path.splitext(filename)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: UserInDB = Depends(get_current_user)):
    if current_user.user_type != "ops":
        raise HTTPException(status_code=403, detail="Only ops users can upload files")

    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="File type not allowed")

    try:
        s3.upload_fileobj(file.file, BUCKET_NAME, file.filename)

        cloudfront_url = f"{CLOUDFRONT_DOMAIN}/{file.filename}"

        return JSONResponse(content={
            "message": "File uploaded successfully",
            "filename": file.filename,
            "url": cloudfront_url
        }, status_code=200)

    except ClientError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to upload file")

@router.get("/files")
async def list_files(current_user: UserInDB = Depends(get_current_user)):
    if current_user.user_type != "ops":
        raise HTTPException(status_code=403, detail="Only ops users can list files")

    try:
        response = s3.list_objects_v2(Bucket=BUCKET_NAME)
        files = []
        for obj in response.get('Contents', []):
            files.append({
                "filename": obj['Key'],
                "url": f"{CLOUDFRONT_DOMAIN}/{obj['Key']}"
            })
        return files
    except ClientError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to list files")

