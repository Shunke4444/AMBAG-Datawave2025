from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from uuid import uuid4
from .mongo import users_collection, member_requests_collection
from .verify_token import verify_token
from .goal import notify_manager_of_request, notify_member_of_request_response
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])

# User Models
class UserRole(BaseModel):
    role_type: Optional[str] = None  # "manager", "contributor"
    permissions: Optional[List[str]] = None
    group_id: Optional[str] = None

class UserProfile(BaseModel):
    first_name: str
    last_name: str
    contact_number: str
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_number: Optional[str] = None

class UserCreate(BaseModel):
    profile: UserProfile
    role: UserRole

class User(BaseModel):
    firebase_uid: str
    profile: UserProfile
    role: UserRole
    created_at: str
    last_login: Optional[str] = None

class UserResponse(BaseModel):
    firebase_uid: str
    profile: UserProfile
    role: UserRole
    created_at: str
    last_login: Optional[str]

class UserUpdate(BaseModel):
    profile: Optional[UserProfile] = None
    role: Optional[UserRole] = None

class SessionResponse(BaseModel):
    user_id: str
    user: UserResponse

# Member Request Models
class RequestType(str):
    ADD_GOAL = "Add A Goal"
    CONCERN = "Concern"
    UNABLE_TO_PAY = "Unable to Pay"
    EXTEND_DEADLINE = "Extend Deadline"
    OTHER = "Other"

class MemberRequest(BaseModel):
    id: str
    from_user_id: str
    from_user_name: str
    to_manager_id: str
    subject: str  # RequestType value
    message: str
    status: str = "pending"
    created_at: str
    manager_response: Optional[str] = None


class CreateMemberRequest(BaseModel):
    to_manager_id: str
    subject: str  # Must be one of RequestType values
    message: str

# Authentication Endpoints
@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    """
    Register a new user. No authentication required.
    """
    try:
        # In production, you should validate the Firebase token and extract uid/email
        # For now, generate a dummy firebase_uid and email for test users
        firebase_uid = str(uuid4())
        email = f"{user_data.profile.first_name.lower()}.{user_data.profile.last_name.lower()}@ambag.com"

        # Check for duplicate email
        if await users_collection.find_one({"profile.first_name": user_data.profile.first_name, "profile.last_name": user_data.profile.last_name}):
            raise HTTPException(status_code=400, detail="User with this name already registered")

        new_user = User(
            firebase_uid=firebase_uid,
            profile=user_data.profile,
            role=user_data.role,
            created_at=datetime.now().isoformat(),
        )

        await users_collection.insert_one(new_user.model_dump())

        logger.info(f"New user registered: {email} as {user_data.role.role_type}")

        return UserResponse(**new_user.model_dump())

    except Exception as e:
        logger.error(f"User registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=SessionResponse)
async def login_user(user=Depends(verify_token)):
    try:
        firebase_uid = user["uid"]
        email = user["email"]

        user_data = await users_collection.find_one({"firebase_uid": firebase_uid})
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found in database")

        await users_collection.update_one(
            {"firebase_uid": firebase_uid},
            {"$set": {"last_login": datetime.now().isoformat()}}
        )

        logger.info(f"User logged in: {email}")

        user_response = UserResponse(**user_data)
        return SessionResponse(
            user_id=firebase_uid,
            user=user_response
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

# User Management Endpoints
@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_user_profile(user_id: str, user=Depends(verify_token)):
    user_data = await users_collection.find_one({"firebase_uid": user_id})
    if not user_data or not isinstance(user_data, dict):
        raise HTTPException(status_code=404, detail="User not found in database")

    # Ensure all required fields are present
    required_fields = ["firebase_uid", "profile", "role", "created_at", "last_login"]
    for field in required_fields:
        if field not in user_data:
            user_data[field] = None  # or set a sensible default if needed

    return UserResponse(**user_data)

@router.get("/", response_model=List[UserResponse])
async def get_all_users(user=Depends(verify_token)):
    users = await users_collection.find().to_list(length=None)
    return [UserResponse(**user) for user in users]

@router.put("/profile/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: str, update_data: UserUpdate, user=Depends(verify_token)):
    update_fields = {}

    if update_data.profile:
        update_fields["profile"] = update_data.profile.model_dump(exclude_unset=True)

    if update_data.role:
        update_fields["role"] = update_data.role.model_dump(exclude_unset=True)

    if not update_fields:
        raise HTTPException(status_code=400, detail="No update fields provided")

    result = await users_collection.update_one(
        {"firebase_uid": user_id},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await users_collection.find_one({"firebase_uid": user_id})
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found after update")

    logger.info(f"User profile updated: {user_id}")
    return UserResponse(**updated_user)

@router.delete("/profile/{user_id}")
async def delete_user(user_id: str, user=Depends(verify_token)):
    result = await users_collection.delete_one({"firebase_uid": user_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    logger.info(f"User deleted: {user_id}")
    return {"message": "User deleted successfully"}

@router.get("/by-role/{role_type}", response_model=List[UserResponse])
async def get_users_by_role(role_type: str, user=Depends(verify_token)):
    users = await users_collection.find({"role.role_type": role_type}).to_list(length=None)
    return [UserResponse(**user) for user in users]

# Member Request Endpoints
@router.post("/requests")
async def create_member_request(request_data: CreateMemberRequest, user=Depends(verify_token)):
    try:
        firebase_uid = user["uid"]

        sender = await users_collection.find_one({"firebase_uid": firebase_uid})
        manager = await users_collection.find_one({"firebase_uid": request_data.to_manager_id})

        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")

        if manager.get('role', {}).get('role_type') != "manager":
            raise HTTPException(status_code=400, detail="Target user is not a manager")

        valid_subjects = [
            RequestType.ADD_GOAL,
            RequestType.CONCERN,
            RequestType.UNABLE_TO_PAY,
            RequestType.EXTEND_DEADLINE,
            RequestType.OTHER
        ]

        if request_data.subject not in valid_subjects:
            raise HTTPException(status_code=400, detail=f"Invalid subject. Must be one of: {', '.join(valid_subjects)}")
        
    except:
        raise HTTPException(status_code= 500)
        

# Defensive: Ensure sender is not None
        if not sender:
            raise HTTPException(status_code=404, detail="Sender user not found")

        # Defensive: Ensure request_data fields exist
        to_manager_id = getattr(request_data, "to_manager_id", None)
        subject = getattr(request_data, "subject", None)
        message = getattr(request_data, "message", None)
        if not all([to_manager_id, subject, message]):
            raise HTTPException(status_code=400, detail="Missing required request fields")

        request_id = str(uuid4())
        profile = sender.get("profile", {})
        from_user_name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip()

        new_request = MemberRequest(
            id=request_id,
            from_user_id=firebase_uid,
            from_user_name=from_user_name,
            to_manager_id=to_manager_id,
            subject=subject,
            message=message,
            status="pending",
            created_at=datetime.now().isoformat()
        )

