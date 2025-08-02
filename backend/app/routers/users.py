from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
from uuid import uuid4
import hashlib
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["users"])

# In-memory user database (replace with Firebase/MongoDB in production)
users_db: Dict[str, "User"] = {}
user_sessions: Dict[str, str] = {}  # session_token -> user_id

# User Models
class UserRole(BaseModel):
    role_type: str  # "manager", "contributor", "admin"
    permissions: List[str] = []
    group_id: Optional[str] = None

class UserProfile(BaseModel):
    first_name: str
    last_name: str
    contact_number: str
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_contact_number: Optional[str] = None

class UserCreate(BaseModel):
    email: str  # Will be validated by Firebase/MongoDB
    password: str
    profile: UserProfile
    role: UserRole

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
    groups: List[str] = []  # List of group IDs user belongs to

class UserResponse(BaseModel):
    id: str
    email: str  # Will be validated by Firebase/MongoDB
    profile: UserProfile
    role: UserRole
    is_active: bool
    created_at: str
    last_login: Optional[str]
    groups: List[str]

class UserUpdate(BaseModel):
    profile: Optional[UserProfile] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class SessionResponse(BaseModel):
    user_id: str
    session_token: str
    user: UserResponse

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
    """Basic email format validation (Firebase/MongoDB will handle proper validation)"""
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
    """Register a new user"""
    try:
        # Basic email format validation (Firebase/MongoDB will handle proper validation)
        if not validate_email_format(user_data.email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Check if email already exists
        for existing_user in users_db.values():
            if existing_user.email == user_data.email:
                raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create new user
        user_id = str(uuid4())
        hashed_password = hash_password(user_data.password)
        
        new_user = User(
            id=user_id,
            email=user_data.email,
            profile=user_data.profile,
            role=user_data.role,
            created_at=datetime.now().isoformat(),
            is_active=True,
            groups=[]
        )
        
        # Store user (password stored separately for security)
        users_db[user_id] = new_user
        
        # Store password hash separately (in production, use Firebase/MongoDB authentication)
        user_passwords = getattr(register_user, '_passwords', {})
        user_passwords[user_id] = hashed_password
        register_user._passwords = user_passwords
        
        logger.info(f"New user registered: {user_data.email} as {user_data.role.role_type}")
        
        return UserResponse(**new_user.dict())
        
    except Exception as e:
        logger.error(f"User registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/login", response_model=SessionResponse)
async def login_user(login_data: UserLogin):
    """Login user and create session"""
    try:
        # Find user by email
        user = None
        user_id = None
        for uid, u in users_db.items():
            if u.email == login_data.email:
                user = u
                user_id = uid
                break
        
        if not user or not user_id:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        if not user.is_active:
            raise HTTPException(status_code=401, detail="Account is deactivated")
        
        # Verify password
        user_passwords = getattr(register_user, '_passwords', {})
        stored_password = user_passwords.get(user_id)
        
        if not stored_password or not verify_password(login_data.password, stored_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create session
        session_token = create_session_token()
        user_sessions[session_token] = user_id
        
        # Update last login
        user.last_login = datetime.now().isoformat()
        users_db[user_id] = user
        
        logger.info(f"User logged in: {login_data.email}")
        
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
    """Logout user and invalidate session"""
    if session_token in user_sessions:
        user_id = user_sessions[session_token]
        del user_sessions[session_token]
        logger.info(f"User logged out: {user_id}")
        return {"message": "Logged out successfully"}
    
    raise HTTPException(status_code=401, detail="Invalid session token")

# User Management Endpoints
@router.get("/profile/{user_id}", response_model=UserResponse)
async def get_user_profile(user_id: str):
    """Get user profile by ID"""
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(**user.dict())

@router.get("/", response_model=List[UserResponse])
async def get_all_users():
    """Get all users (admin only in production)"""
    return [UserResponse(**user.dict()) for user in users_db.values()]

@router.put("/profile/{user_id}", response_model=UserResponse)
async def update_user_profile(user_id: str, update_data: UserUpdate):
    """Update user profile"""
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
    """Delete user account"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove from groups and sessions
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

# Group Integration Endpoints
@router.post("/join-group")
async def join_group(user_id: str, group_id: str):
    """Add user to a group"""
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if group_id not in user.groups:
        user.groups.append(group_id)
        users_db[user_id] = user
        logger.info(f"User {user_id} joined group {group_id}")
    
    return {"message": f"User added to group {group_id}"}

@router.post("/leave-group")
async def leave_group(user_id: str, group_id: str):
    """Remove user from a group"""
    user = users_db.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if group_id in user.groups:
        user.groups.remove(group_id)
        users_db[user_id] = user
        logger.info(f"User {user_id} left group {group_id}")
    
    return {"message": f"User removed from group {group_id}"}

@router.get("/by-role/{role_type}", response_model=List[UserResponse])
async def get_users_by_role(role_type: str):
    """Get all users with specific role"""
    filtered_users = [
        UserResponse(**user.dict()) 
        for user in users_db.values() 
        if user.role.role_type == role_type
    ]
    
    return filtered_users

@router.get("/managers", response_model=List[UserResponse])
async def get_managers():
    """Get all managers"""
    return await get_users_by_role("manager")

@router.get("/contributors", response_model=List[UserResponse])
async def get_contributors():
    """Get all contributors"""
    return await get_users_by_role("contributor")

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
