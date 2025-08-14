from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
from uuid import uuid4
import hashlib
import logging
from .firebase_admin_setup import verify_firebase_token

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])

# replace with Firebase/MongoDB
users_db: Dict[str, "User"] = {}
user_sessions: Dict[str, str] = {}  # session_token -> user_id
member_requests_db: Dict[str, "MemberRequest"] = {}  # request_id -> MemberRequest

# User Models
class UserRole(BaseModel):
    role_type: str  # "manager", "contributor"
    permissions: List[str] = []
    group_id: Optional[str] = None

class UserProfile(BaseModel):
    first_name: str
    last_name: str

class UserCreate(BaseModel):
    email: str  # Will be validated by Firebase/MongoDB
    password: str
    profile: UserProfile

class UserLogin(BaseModel):
    email: str  # Will be validated by Firebase/MongoDB
    password: str

class User(BaseModel):
    id: str
    email: str  # Will be validated by Firebase/MongoDB
    profile: UserProfile
    role: UserRole
    is_active: bool = True
    created_at: str
    last_login: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str  # Will be validated by Firebase/MongoDB
    profile: UserProfile
    role: UserRole
    is_active: bool
    created_at: str
    last_login: Optional[str]

class UserUpdate(BaseModel):
    profile: Optional[UserProfile] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class SessionResponse(BaseModel):
    user_id: str
    session_token: str
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


# Utility Functions
def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

def create_session_token() -> str:
    """Generate session token"""
    return str(uuid4())

def validate_email_format(email: str) -> bool:
    """Basic email format validation"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def get_current_user(session_token: str) -> Optional[User]:
    """Get current user from session token"""
    user_id = user_sessions.get(session_token)
    if not user_id:
        return None
    return users_db.get(user_id)

# Authentication Endpoints
@router.post("/register", response_model=UserResponse)
async def register_user(user_data: UserCreate):
    try:
        # Basic email format validation
        if not validate_email_format(user_data.email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        for existing_user in users_db.values():
            if existing_user.email == user_data.email:
                raise HTTPException(status_code=400, detail="Email already registered")
        # Create new user
        user_id = str(uuid4())
        hashed_password = hash_password(user_data.password)
        # For testing, create minimal user
        new_user = User(
            id=user_id,
            email=user_data.email,
            profile=UserProfile(
                first_name=user_data.profile.first_name,
                last_name=user_data.profile.last_name
            ),
            role=UserRole(
                role_type="contributor",
                permissions=[],
            ),
            created_at=datetime.now().isoformat(),
            is_active=True
        )
        users_db[user_id] = new_user
        # Store password hash separately 
        user_passwords = getattr(register_user, '_passwords', {})
        user_passwords[user_id] = hashed_password
        register_user._passwords = user_passwords
        logger.info(f"New user registered: {user_data.email}")
        return UserResponse(**new_user.dict())
        
    except Exception as e:
        logger.error(f"User registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=SessionResponse)
async def login_user(request: Request):
    try:
        # Get Firebase token from Authorization header
        auth_header = request.headers.get('authorization')
        logger.info(f"Login request headers: {request.headers}")
        if not auth_header or not auth_header.startswith('Bearer '):
            logger.error("Missing or invalid Authorization header")
            raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
        id_token = auth_header.split(' ')[1]
        decoded_token = verify_firebase_token(id_token)
        logger.info(f"Decoded Firebase token: {decoded_token}")
        if not decoded_token:
            logger.error("Invalid Firebase token")
            raise HTTPException(status_code=401, detail="Invalid Firebase token")
        email = decoded_token.get('email')
        logger.info(f"Email from token: {email}")
        user = None
        user_id = None
        for uid, u in users_db.items():
            logger.info(f"Checking user: {u.email} (id: {uid})")
            if u.email == email:
                user = u
                user_id = uid
                break
        if not user or not user_id:
            logger.error("User not found in users_db")
            raise HTTPException(status_code=401, detail="User not found")
        if not user.is_active:
            logger.error("Account is deactivated")
            raise HTTPException(status_code=401, detail="Account is deactivated")
        # Create session token
        session_token = create_session_token()
        user_sessions[session_token] = user_id
        user.last_login = datetime.now().isoformat()
        users_db[user_id] = user
        logger.info(f"User logged in: {email}")
        return SessionResponse(
            user_id=user_id,
            session_token=session_token,
            user=UserResponse(**user.dict())
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

@router.post("/logout")
async def logout_user(session_token: str):
    if session_token in user_sessions:
        user_id = user_sessions[session_token]
        del user_sessions[session_token]
        logger.info(f"User logged out: {user_id}")
        return {"message": "Logged out successfully"}
    
    raise HTTPException(status_code=401, detail="Invalid session token")

# User Management Endpoints
@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_user_profile(user_id: str):
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**user.dict())

@router.get("/", response_model=List[UserResponse])
async def get_all_users():
    return [UserResponse(**user.dict()) for user in users_db.values()]

@router.put("/profile/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: str, update_data: UserUpdate):
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update fields
    if update_data.profile:
        user.profile = update_data.profile
    if update_data.role:
        user.role = update_data.role
    if update_data.is_active is not None:
        user.is_active = update_data.is_active
    
    users_db[user_id] = user
    logger.info(f"User profile updated: {user_id}")
    
    return UserResponse(**user.dict())

@router.delete("/profile/{user_id}")
async def delete_user(user_id: str):
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove from sessions
    user = users_db[user_id]
    for session_token, session_user_id in list(user_sessions.items()):
        if session_user_id == user_id:
            del user_sessions[session_token]
    
    # Delete user
    del users_db[user_id]
    
    # Remove password
    user_passwords = getattr(register_user, '_passwords', {})
    if user_id in user_passwords:
        del user_passwords[user_id]
    
    logger.info(f"User deleted: {user_id}")
    return {"message": "User deleted successfully"}

@router.get("/by-role/{role_type}", response_model=List[UserResponse])
async def get_users_by_role(role_type: str):
    filtered_users = [
        UserResponse(**user.dict()) 
        for user in users_db.values() 
        if user.role.role_type == role_type
    ]
    
    return filtered_users

@router.get("/managers", response_model=List[UserResponse])
async def get_managers():
    return await get_users_by_role("manager")

@router.get("/contributors", response_model=List[UserResponse])
async def get_contributors():
    return await get_users_by_role("contributor")

# Member Request Endpoints
@router.post("/requests")
async def create_member_request(request_data: CreateMemberRequest, session_token: str):
    try:
        user = get_current_user(session_token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid session token")
        
        manager = users_db.get(request_data.to_manager_id)
        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")
        
        if manager.role.role_type != "manager":
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
            from_user_id=user.id,
            from_user_name=f"{user.profile.first_name} {user.profile.last_name}",
            to_manager_id=request_data.to_manager_id,
            subject=request_data.subject,
            message=request_data.message,
            status="pending",
            created_at=datetime.now().isoformat()
        )
        
        # Store request
        member_requests_db[request_id] = new_request
        
        # Send notification to manager about new request
        from .goal import notify_manager_of_request
        await notify_manager_of_request(request_id, {
            "to_manager_id": request_data.to_manager_id,
            "from_user_name": f"{user.profile.first_name} {user.profile.last_name}",
            "subject": request_data.subject,
            "message": request_data.message,
            "group_id": None  
        })
        
        logger.info(f"📧 New request: {request_data.subject} from {user.profile.first_name} to manager")
        
        return {"message": "Request sent successfully", "request_id": request_id}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Request creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Request creation failed: {str(e)}")

@router.get("/requests/sent/{user_id}")
async def get_sent_requests(user_id: str):
    """Get all requests sent by a user"""
    user_requests = [
        req.dict() 
        for req in member_requests_db.values() 
        if req.from_user_id == user_id
    ]
    
    # Sort by creation date (newest first)
    user_requests.sort(key=lambda x: x['created_at'], reverse=True)
    
    return {"requests": user_requests}

@router.get("/requests/received/{manager_id}")
async def get_received_requests(manager_id: str):
    """Get all requests received by a manager"""
    manager_requests = [
        req.dict()
        for req in member_requests_db.values()
        if req.to_manager_id == manager_id
    ]
    
    # Sort by creation date (newest first)
    manager_requests.sort(key=lambda x: x['created_at'], reverse=True)
    
    return {"requests": manager_requests}

@router.get("/requests/{request_id}")
async def get_request_details(request_id: str):
    """Get specific request details"""
    request = member_requests_db.get(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    return request.dict()

class ManagerResponse(BaseModel):
    response_message: bool

@router.post("/requests/{request_id}/respond")
async def respond_to_request(request_id: str, response: ManagerResponse, manager_id: str):
    request = member_requests_db.get(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.to_manager_id != manager_id:
        raise HTTPException(status_code=403, detail="Not authorized to respond to this request")
    
    # Update request with manager response
    request.status = "responded"
    request.manager_response = "Approved" if response.response_message else "Rejected"
    
    member_requests_db[request_id] = request
    
    # Send notification to member about manager response
    from .goal import notify_member_of_request_response
    await notify_member_of_request_response(request_id, {
        "from_user_id": request.from_user_id,
        "subject": request.subject,
        "status": "responded",
        "manager_response": "Approved" if response.response_message else "Rejected",
        "group_id": None 
    })
    
    logger.info(f"💬 Manager responded to request {request_id}")
    
    return {"message": "Response sent successfully", "request": request.dict()}
 

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
@router.get("/session/{session_token}", response_model=UserResponse)
async def get_user_by_session(session_token: str):
    """Get current user by session token"""
    user = get_current_user(session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session token")
    
    return UserResponse(**user.dict())

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
