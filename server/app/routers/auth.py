from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models import UserCreate, User, UserInDB, Token, UserInfo
from app.auth import authenticate_user, create_access_token, get_current_user, get_password_hash
from app.config import ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from app.database import get_db
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
import os
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()
load_dotenv()


@router.post("/ops/login", response_model=Token)
async def login_ops_user(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password, "ops")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_type": user.user_type}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/client/login", response_model=Token)
async def login_client_user(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password, "client")
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_type": user.user_type}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/client/signup", response_model=User)
async def signup_client_user(user: UserCreate):
    db = get_db()
    existing_user = db.users.find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    verification_token = secrets.token_urlsafe(32)
    new_user = UserInDB(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        user_type="client",
        is_verified=False,
        verification_token=verification_token
    )
    result = db.users.insert_one(new_user.dict())
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to create user")
    
    send_verification_email(user.email, verification_token, user.username)
    
    return User(**new_user.dict())

@router.get("/client/verify/{token}")
async def verify_email(token: str):
    db = get_db()
    user = db.users.find_one({"verification_token": token})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    db.users.update_one({"_id": user["_id"]}, {"$set": {"is_verified": True}, "$unset": {"verification_token": ""}})
    return {"message": "Email verified successfully"}

@router.get("/client/verify", response_model=UserInfo)
async def verify_client_token(current_user: UserInDB = Depends(get_current_user)):
    if current_user.user_type != "client":
        raise HTTPException(status_code=403, detail="Not a client user")
    return UserInfo(
        username=current_user.username,
        email=current_user.email,
        user_type=current_user.user_type,
        is_verified=current_user.is_verified
    )

@router.get("/ops/verify", response_model=UserInfo)
async def verify_ops_token(current_user: UserInDB = Depends(get_current_user)):
    if current_user.user_type != "ops":
        raise HTTPException(status_code=403, detail="Not an ops user")
    return UserInfo(
        username=current_user.username,
        email=current_user.email,
        user_type=current_user.user_type
    )

def send_verification_email(email: str, token: str, username: str):
    smtp_server = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("EMAIL_PORT"))
    sender_email = os.getenv("EMAIL_FROM")
    sender_password = os.getenv("EMAIL_PASS")
    email_secure = os.getenv("EMAIL_SECURE").lower() == "true"
    domain = os.getenv("DOMAIN", "localhost:8000")

    message = MIMEMultipart("alternative")
    message["Subject"] = "Welcome to SafeXchange - Verify Your Email"
    message["From"] = sender_email
    message["To"] = email

    text = f"""
    Hi {username},

    Welcome to the SafeXchange platform!

    We're excited to have you on board. To ensure the security of your account and enable all features, we need to verify your email address.

    Please click on the link below to verify your email:
    http://{domain}/verify/{token}

    If you didn't create an account on SafeXchange, please ignore this email.

    Thank you for choosing SafeXchange for your secure exchange needs.

    Best regards,
    The SafeXchange Team
    """

    html = f"""
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>Welcome to SafeXchange!</h2>
        <p>Hi {username},</p>
        <p>We're excited to have you on board. To ensure the security of your account and enable all features, we need to verify your email address.</p>
        <p>Please click on the button below to verify your email:</p>
        <p>
          <a href="http://{domain}/verify/{token}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </p>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p>http://{domain}/verify/{token}</p>
        <p>If you didn't create an account on SafeXchange, please ignore this email.</p>
        <p>Thank you for choosing SafeXchange for your secure exchange needs.</p>
        <p>Best regards,<br>The SafeXchange Team</p>
      </body>
    </html>
    """

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    message.attach(part1)
    message.attach(part2)

    if email_secure:
        smtp_class = smtplib.SMTP_SSL
    else:
        smtp_class = smtplib.SMTP

    with smtp_class(smtp_server, smtp_port) as server:
        if not email_secure:
            server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, email, message.as_string())
