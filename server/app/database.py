from pymongo import MongoClient
from app.config import MONGODB_URI

client = None
db = None

def init_db():
    global client, db
    
    client = MongoClient(MONGODB_URI)
    db = client["file_sharing_system"]

def get_db():
    return db