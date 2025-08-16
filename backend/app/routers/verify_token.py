from firebase_admin import credentials, auth, initialize_app
from fastapi import HTTPException, Request, Depends
import firebase_admin
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

cred_path = os.getenv("FIREBASE_CRED_PATH")
if cred_path:
    # Convert relative path to absolute path based on the current file's directory
    if not os.path.isabs(cred_path):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        app_dir = os.path.dirname(current_dir)  # Go up one level from routers to app
        cred_path = os.path.join(app_dir, cred_path)
    
    # Check if Firebase admin is already initialized to prevent duplicate initialization
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        initialize_app(cred)
else:
    raise RuntimeError("Firebase credentials not found")

async def verify_token(request: Request):
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    id_token = auth_header.split("Bearer ")[1]
    
    try:
        # Try to verify the token normally first
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        # Suppress error details
        raise HTTPException(status_code=401, detail="Invalid Firebase token")