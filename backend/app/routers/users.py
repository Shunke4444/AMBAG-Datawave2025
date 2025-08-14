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
    # contact_number: str
    # address: Optional[str] = None
    # emergency_contact: Optional[str] = None
    # emergency_contact_number: Optional[str] = None

class UserCreate(BaseModel):
    profile: UserProfile
    role: Optional[UserRole] = None

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
    status: str = "pending"  # "pending", "responded"
    created_at: str
    manager_response: Optional[str] = None

class CreateMemberRequest(BaseModel):
    to_manager_id: str
    subject: str  # Must be one of RequestType values
    message: str

# Authentication Endpoints
@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate, user=Depends(verify_token)):
    try:
        firebase_uid = user["uid"]
        email = user["email"]

        if await users_collection.find_one({"email": email}):
            raise HTTPException(status_code=400, detail="Email already registered")
        
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
async def get_user_profile(user=Depends(verify_token)):
    firebase_uid = user["uid"]
    user_data = await users_collection.find_one({"firebase_uid": firebase_uid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    return UserResponse(**user_data)

@router.get("/", response_model=List[UserResponse])
async def get_all_users(user=Depends(verify_token)):
    users = await users_collection.find().to_list(length=None)

    return [UserResponse(**user) for user in users]

@router.put("/profile/{user_id}", response_model=UserResponse)
async def update_user_profile(update_data: UserUpdate, user=Depends(verify_token)):
    firebase_uid = user["uid"]

    update_fields = {}

    if update_data.profile:
        update_fields["profile"] = update_data.profile.model_dump(exclude_unset=True)
    
    if update_data.role:
        update_fields["role"] = update_data.role.model_dump(exclude_unset=True)

    if not update_fields:
        raise HTTPException(status_code=400, detail="No update fields provided")

    result = await users_collection.update_one(
        {"firebase_uid": firebase_uid},
        {"$set": update_fields}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated_user = await users_collection.find_one({"firebase_uid": firebase_uid})
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found after update")

    logger.info(f"User profile updated: {user['email']}")
    return UserResponse(**updated_user)

@router.delete("/profile/{user_id}")
async def delete_user(user=Depends(verify_token)):
    firebase_uid = user["uid"]
    result = await users_collection.delete_one({"firebase_uid": firebase_uid})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    logger.info(f"User deleted: {user['email']}")
    return {"message": "User deleted successfully"}

@router.get("/by-role/{role_type}", response_model=List[UserResponse])
async def get_users_by_role(role_type: str, user=Depends(verify_token)):
    users = await users_collection.find({"role.role_type": role_type}).to_list(length=None)

    return [UserResponse(**user) for user in users]

# Redundant (unless this is needed for something else)
# @router.get("/managers", response_model=List[UserResponse])
# async def get_managers():
#     return await get_users_by_role("manager")

# @router.get("/contributors", response_model=List[UserResponse])
# async def get_contributors():
#     return await get_users_by_role("contributor")

# Member Request Endpoints
@router.post("/requests")
async def create_member_request(request_data: CreateMemberRequest, user=Depends(verify_token)):
    try:
        firebase_uid = user["uid"]

        sender = await users_collection.find_one({"firebase_uid": firebase_uid})
        manager = await users_collection.find_one({"firebase_uid": request_data.to_manager_id})
        
        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")

        if manager['role']['role_type'] != "manager":
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
        
        # Create request
        request_id = str(uuid4())
        new_request = MemberRequest(
            id=request_id,
            from_user_id=firebase_uid,
            from_user_name=f"{sender['profile']['first_name']} {sender['profile']['last_name']}",
            to_manager_id=request_data.to_manager_id,
            subject=request_data.subject,
            message=request_data.message,
            status="pending",
            created_at=datetime.now().isoformat()
        )
        
        # Store request
        await member_requests_collection.insert_one(new_request.model_dump())
        
        # Send notification to manager about new request
        await notify_manager_of_request(request_id, {
            "to_manager_id": request_data.to_manager_id,
            "from_user_name": f"{sender['profile']['first_name']} {sender['profile']['last_name']}",
            "subject": request_data.subject,
            "message": request_data.message,
            "group_id": manager['role']['group_id']
        })
        
        logger.info(f"📧 New request: {request_data.subject} from {sender['profile']['first_name']} to manager")
        
        return {"message": "Request sent successfully", "request_id": request_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Request creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Request creation failed: {str(e)}")

@router.get("/requests/sent/{user_id}")
async def get_sent_requests(user_id: str, user=Depends(verify_token)):
    """Get all requests sent by a user"""
    try:
        user_requests = await member_requests_collection.find({"from_user_id": user_id}).to_list(length=None)

        user_requests.sort(key=lambda x: x.get("created_at"), reverse=True)

        return {"requests": user_requests}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch sent requests: {str(e)}")

@router.get("/requests/received/{manager_id}")
async def get_received_requests(manager_id: str, user=Depends(verify_token)):
    """Get all requests received by a manager"""
    manager_requests = await member_requests_collection.find({"to_manager_id": manager_id}).to_list(length=None)
    
    manager_requests.sort(key=lambda x: x.get("created_at"), reverse=True)
    
    return {"requests": manager_requests}

@router.get("/requests/{request_id}")
async def get_request_details(request_id: str, user=Depends(verify_token)):
    """Get specific request details"""
    request = await member_requests_collection.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return request

class ManagerResponse(BaseModel):
    response_message: bool

@router.post("/requests/{request_id}/respond")
async def respond_to_request(request_id: str, response: ManagerResponse, manager_id: str, user=Depends(verify_token)):
    request = await member_requests_collection.find_one({"id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request['to_manager_id'] != manager_id:
        raise HTTPException(status_code=403, detail="Not authorized to respond to this request")
    
    # Update request with manager response
    manager_response = "Approved" if response.response_message else "Rejected"
    await member_requests_collection.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": "responded",
                "manager_response": manager_response
            }
        }
    )
    
    # Send notification to member about manager response
    await notify_member_of_request_response(request_id, {
        "from_user_id": request['from_user_id'],
        "subject": request['subject'],
        "status": "responded",
        "manager_response": "Approved" if response.response_message else "Rejected",
        "group_id": request['group_id']
    })
    
    logger.info(f"💬 Manager responded to request {request_id}")
    
    return {
        "message": "Response sent successfully",
        "request": {
            "id": request_id,
            "status": "responded",
            "manager_response": manager_response
        }
    }

 

@router.get("/requests/types")
async def get_request_types():
    """Get available request types for frontend"""
    return {
        "request_types": [
            {"value": RequestType.ADD_GOAL, "label": "Add A Goal"},
            {"value": RequestType.CONCERN, "label": "Concern"},
            {"value": RequestType.UNABLE_TO_PAY, "label": "Unable to Pay"},
            {"value": RequestType.EXTEND_DEADLINE, "label": "Extend Deadline"},
            {"value": RequestType.OTHER, "label": "Other"}
        ]
    }

# Utility Endpoints
# @router.get("/session/{session_token}", response_model=UserResponse)
# async def get_user_by_session(session_token: str):
#     """Get current user by session token"""
#     user = get_current_user(session_token)
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid session token")
    
#     return UserResponse(**user.model_dump())

@router.post("/create-test-users")
async def create_test_users():
    """Create test users for development"""
    test_users = [
        {
            "email": "manager@ambag.com",
            "password": "manager123",
            "profile": {
                "first_name": "Juan",
                "last_name": "Dela Cruz",
                "contact_number": "+63-917-123-4567",
                "address": "123 Makati Avenue, Makati City",
                "emergency_contact": "Maria Dela Cruz",
                "emergency_contact_number": "+63-917-123-4568"
            },
            "role": {
                "role_type": "manager",
                "permissions": ["create_goals", "approve_goals", "manage_group", "view_analytics"],
                "group_id": None
            }
        },
        {
            "email": "contributor1@ambag.com",
            "password": "contrib123",
            "profile": {
                "first_name": "Maria",
                "last_name": "Santos",
                "contact_number": "+63-917-234-5678",
                "address": "456 Quezon City",
                "emergency_contact": "Pedro Santos",
                "emergency_contact_number": "+63-917-234-5679"
            },
            "role": {
                "role_type": "contributor",
                "permissions": ["contribute_to_goals", "view_goals", "join_groups"],
                "group_id": None
            }
        },
        {
            "email": "contributor2@ambag.com",
            "password": "contrib123",
            "profile": {
                "first_name": "Pedro",
                "last_name": "Garcia",
                "contact_number": "+63-917-345-6789",
                "address": "789 Manila City",
                "emergency_contact": "Ana Garcia",
                "emergency_contact_number": "+63-917-345-6790"
            },
            "role": {
                "role_type": "contributor",
                "permissions": ["contribute_to_goals", "view_goals", "join_groups"],
                "group_id": None
            }
        }
    ]
    
    created_users = []
    for user_data in test_users:
        try:
            user_create = UserCreate(**user_data)
            created_user = await register_user(user_create)
            created_users.append(created_user)
        except Exception as e:
            logger.warning(f"Test user creation failed: {str(e)}")
    
    return {
        "message": f"Created {len(created_users)} test users",
        "users": created_users
    }