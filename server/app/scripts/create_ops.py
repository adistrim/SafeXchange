from pymongo import MongoClient
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

client = MongoClient(MONGODB_URI)
db = client["file_sharing_system"]
users_collection = db["users"]

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_hased_password(password):
    return pwd_context.hash(password)

ops_user = {
    "username": "",
    "email": "",
    "hashed_password": get_hased_password(""), 
    "user_type": ""
}

result = users_collection.insert_one(ops_user)

if result.inserted_id:
    print("Ops user added successfully with id:", result.inserted_id)
else:
    print("Failed to add ops user")

client.close()

