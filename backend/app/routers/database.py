from fastapi import FastAPI, Request, HTTPException, Depends, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv
import os

router = APIRouter(
    prefix="/database",
    tags=["database"]
)

# Load env vars
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
FIREBASE_CRED_PATH = os.getenv("FIREBASE_CRED_PATH")

# Firebase setup
cred = credentials.Certificate(FIREBASE_CRED_PATH)
firebase_admin.initialize_app(cred)

# MongoDB setup
client = MongoClient(MONGO_URI)
db = client["sample_mflix"]
collection = db["users"]

app = FastAPI()

# Allow CORS (React on different port)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware to verify Firebase token
async def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    id_token = auth_header.split("Bearer ")[1]
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

# Your protected route
@router.get("/api/data")
async def get_data(user=Depends(verify_token)):
    try:
        user_id = user["uid"]
        data = list(collection.find({"userId": user_id}, {"_id": 0}))
        return {"data": data}
    except Exception as e:
        print("Error:", e)
        raise e
    
# Future write commands TBD


