from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from app.routers import auth
from app.database import init_db
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

origins = [
    os.getenv("ORIGIN_URL")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    init_db()

app.include_router(auth.router, prefix="/api")
