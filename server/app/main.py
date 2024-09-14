from fastapi import FastAPI
from app.routers import auth
from app.database import init_db

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    init_db()

app.include_router(auth.router, prefix="/api")
