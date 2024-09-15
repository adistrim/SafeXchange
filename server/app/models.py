from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    user_type: str

class UserInDB(User):
    hashed_password: str
    is_verified: bool = False
    verification_token: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    user_type: Optional[str] = None

class UserInfo(BaseModel):
    username: str
    email: str
    user_type: str
    is_verified: bool