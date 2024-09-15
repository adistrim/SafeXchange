from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse, StreamingResponse
from app.auth import get_current_user
from app.models import UserInDB
from typing import List
import boto3
from botocore.exceptions import ClientError
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime, timedelta

router = APIRouter()
load_dotenv()

s3 = boto3.client('s3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION')
)

ALLOWED_EXTENSIONS = {'.pptx', '.docx', '.xlsx'}
BUCKET_NAME = os.getenv('S3_BUCKET_NAME')

# In-memory store for download tokens
download_tokens = {}

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
        return JSONResponse(content={
            "message": "File uploaded successfully",
            "filename": file.filename,
        }, status_code=200)
    except ClientError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to upload file")

@router.get("/files")
async def list_files():
    try:
        response = s3.list_objects_v2(Bucket=BUCKET_NAME)
        files = [obj['Key'] for obj in response.get('Contents', [])]
        return files
    except ClientError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to list files")

@router.get("/download-file/{filename}")
async def get_download_url(filename: str, current_user: UserInDB = Depends(get_current_user)):

    try:
        # Generate a unique token
        token = str(uuid.uuid4())
        
        # Store the token with user information and expiration time
        download_tokens[token] = {
            "username": current_user.username,
            "filename": filename,
            "expires_at": datetime.utcnow() + timedelta(minutes=5)
        }

        # Generate the secure download link
        download_link = f"/api/secure-download/{token}"

        return JSONResponse(content={
            "download_link": download_link,
            "message": "success"
        }, status_code=200)

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to generate download URL")

@router.get("/secure-download/{token}")
async def secure_download(token: str, current_user: UserInDB = Depends(get_current_user)):
    if token not in download_tokens:
        raise HTTPException(status_code=400, detail="Invalid or expired download token")

    token_data = download_tokens[token]

    if token_data["username"] != current_user.username:
        raise HTTPException(status_code=403, detail="Access denied")

    if datetime.utcnow() > token_data["expires_at"]:
        del download_tokens[token]
        raise HTTPException(status_code=400, detail="Download token has expired")

    filename = token_data["filename"]

    try:
        file_obj = s3.get_object(Bucket=BUCKET_NAME, Key=filename)
        return StreamingResponse(
            file_obj['Body'].iter_chunks(),
            media_type='application/octet-stream',
            headers={
                'Content-Disposition': f'attachment; filename="{filename}"'
            }
        )
    except ClientError as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to download file")
    finally:
        del download_tokens[token]

@router.delete("/delete-file/{filename}")
async def delete_file(filename: str, current_user: UserInDB = Depends(get_current_user)):
    if current_user.user_type != "ops":
        raise HTTPException(status_code=403, detail="Only ops users can delete files")

    try:
        s3.head_object(Bucket=BUCKET_NAME, Key=filename)
        
        s3.delete_object(Bucket=BUCKET_NAME, Key=filename)
        
        return JSONResponse(content={
            "message": f"File {filename} deleted successfully",
        }, status_code=200)
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            raise HTTPException(status_code=404, detail="File not found")
        else:
            print(e)
            raise HTTPException(status_code=500, detail="Failed to delete file")
