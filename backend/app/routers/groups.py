from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from uuid import uuid4 #generate unique IDs
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/groups",
    tags=["groups"]
)

group_db: Dict[str, "Group"] = {} 

class GroupBase(BaseModel):
    name: str
    description: str = ""

class GroupCreate(GroupBase):
    name: str
    manager_id: str  # User ID of the manager
    description: str = ""

class GroupMember(BaseModel):
    user_id: str
    role: str  # "manager" or "contributor"
    joined_at: str
    contribution_total: float = 0.0
    is_active: bool = True

class Group(GroupBase):
    id: str
    manager_id: str
    members: List[GroupMember] = []
    created_at: str
    is_active: bool = True
    total_goals: int = 0
    total_contributions: float = 0.0

class AddMemberRequest(BaseModel):
    user_id: str
    role: str = "contributor"  # Default to contributor

class GroupResponse(BaseModel):
    id: str
    name: str
    description: str
    manager_id: str
    members: List[GroupMember]
    created_at: str
    is_active: bool
    total_goals: int
    total_contributions: float
    member_count: int

@router.post("/", response_model=GroupResponse)
def create_group(group: GroupCreate):
    """Create a new group with manager"""
    try:
        group_id = str(uuid4())
        
        # Create manager member entry
        manager_member = GroupMember(
            user_id=group.manager_id,
            role="manager",
            joined_at=datetime.now().isoformat(),
            contribution_total=0.0,
            is_active=True
        )
        
        new_group = Group(
            id=group_id,
            name=group.name,
            description=group.description,
            manager_id=group.manager_id,
            members=[manager_member],
            created_at=datetime.now().isoformat(),
            is_active=True,
            total_goals=0,
            total_contributions=0.0
        )
        
        # Store in database
        group_db[group_id] = new_group
        
        logger.info(f"New group created: {group.name} by manager {group.manager_id}")
        
        return GroupResponse(
            **new_group.model_dump(),
            member_count=len(new_group.members)
        )
        
    except Exception as e:
        logger.error(f"Group creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Group creation failed: {str(e)}")

@router.get("/", response_model=List[GroupResponse])
def get_all_groups():
    """Get all groups"""
    return [
        GroupResponse(**group.model_dump(), member_count=len(group.members))
        for group in group_db.values()
        if group.is_active
    ]

@router.get("/{group_id}", response_model=GroupResponse)
def get_group(group_id: str):
    """Get specific group by ID"""
    group = group_db.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return GroupResponse(
        **group.model_dump(),
        member_count=len(group.members)
    )

@router.post("/{group_id}/members", response_model=GroupResponse)
def add_member_to_group(group_id: str, member_request: AddMemberRequest):
    """Add a member to group"""
    group = group_db.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if user is already a member
    for member in group.members:
        if member.user_id == member_request.user_id:
            raise HTTPException(status_code=400, detail="User is already a member of this group")
    
    # Add new member
    new_member = GroupMember(
        user_id=member_request.user_id,
        role=member_request.role,
        joined_at=datetime.now().isoformat(),
        contribution_total=0.0,
        is_active=True
    )
    
    group.members.append(new_member)
    group_db[group_id] = group
    
    logger.info(f"User {member_request.user_id} added to group {group_id} as {member_request.role}")
    
    return GroupResponse(
        **group.model_dump(),
        member_count=len(group.members)
    )

@router.delete("/{group_id}/members/{user_id}")
def remove_member_from_group(group_id: str, user_id: str):
    """Remove a member from group"""
    group = group_db.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Cannot remove the manager
    if user_id == group.manager_id:
        raise HTTPException(status_code=400, detail="Cannot remove group manager")
    
    # Find and remove member
    group.members = [member for member in group.members if member.user_id != user_id]
    group_db[group_id] = group
    
    logger.info(f"User {user_id} removed from group {group_id}")
    
    return {"message": f"User {user_id} removed from group successfully"}

@router.get("/{group_id}/members", response_model=List[GroupMember])
def get_group_members(group_id: str):
    """Get all members of a group"""
    group = group_db.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return group.members

@router.put("/{group_id}/members/{user_id}/role")
def update_member_role(group_id: str, user_id: str, new_role: str):
    """Update member role in group"""
    group = group_db.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Cannot change manager role
    if user_id == group.manager_id:
        raise HTTPException(status_code=400, detail="Cannot change manager role")
    
    # Find and update member
    for member in group.members:
        if member.user_id == user_id:
            member.role = new_role
            group_db[group_id] = group
            logger.info(f"User {user_id} role updated to {new_role} in group {group_id}")
            return {"message": f"Member role updated to {new_role}"}
    
    raise HTTPException(status_code=404, detail="Member not found in group")

@router.get("/user/{user_id}", response_model=List[GroupResponse])
def get_user_groups(user_id: str):
    """Get all groups where user is a member"""
    user_groups = []
    
    for group in group_db.values():
        for member in group.members:
            if member.user_id == user_id and member.is_active:
                user_groups.append(GroupResponse(
                    **group.model_dump(),
                    member_count=len(group.members)
                ))
                break
    
    return user_groups

@router.put("/{group_id}")
def update_group(group_id: str, group_update: GroupBase):
    """Update group information"""
    group = group_db.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    group.name = group_update.name
    group.description = group_update.description
    group_db[group_id] = group
    
    logger.info(f"Group {group_id} updated")
    
    return GroupResponse(
        **group.model_dump(),
        member_count=len(group.members)
    )

@router.delete("/{group_id}")
def delete_group(group_id: str):
    """Delete/deactivate a group"""
    group = group_db.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    group.is_active = False
    group_db[group_id] = group
    
    logger.info(f"Group {group_id} deactivated")
    
    return {"message": "Group deactivated successfully"}

@router.get("/{group_id}/stats")
def get_group_statistics(group_id: str):
    """Get group statistics"""
    group = group_db.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    active_members = len([m for m in group.members if m.is_active])
    managers = len([m for m in group.members if m.role == "manager"])
    contributors = len([m for m in group.members if m.role == "contributor"])
    
    return {
        "group_id": group_id,
        "group_name": group.name,
        "total_members": len(group.members),
        "active_members": active_members,
        "managers": managers,
        "contributors": contributors,
        "total_goals": group.total_goals,
        "total_contributions": group.total_contributions,
        "average_contribution": group.total_contributions / active_members if active_members > 0 else 0,
        "created_at": group.created_at
    }

@router.post("/create-test-group")
def create_test_group():
    """Create a test group for development"""
    # This would typically use actual user IDs from the users system
    test_group_data = GroupCreate(
        name="Family Savings Circle",
        manager_id="test_manager_123",  # This should be a real user ID
        description="Family group for vacation and emergency savings"
    )
    
    return create_group(test_group_data)