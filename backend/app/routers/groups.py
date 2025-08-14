from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
from .mongo import users_collection, groups_collection
from .verify_token import verify_token
import logging
import random, string

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/groups",
    tags=["groups"]
)

class GroupBase(BaseModel):
    name: str
    description: str = ""

class GroupCreate(GroupBase):
    name: str
    manager_id: str  # User ID of the manager
    description: str = ""

class GroupMember(BaseModel):
    firebase_uid: str
    role: str  # "manager" or "contributor"
    joined_at: str
    contribution_total: float = 0.0
    is_active: bool = True

class Group(GroupBase):
    group_id: str
    manager_id: str
    members: List[GroupMember] = []
    created_at: str
    is_active: bool = True
    total_goals: int = 0
    total_contributions: float = 0.0

class AddMemberRequest(BaseModel):
    firebase_uid: str
    role: str = "contributor"  # Default to contributor

class GroupResponse(BaseModel):
    group_id: str
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
async def create_group(group: GroupCreate, user=Depends(verify_token)):
    """Create a new group with manager"""
    try:
        group_id = ''.join(random.choices(string.ascii_letters + string.digits, k=6))
        firebase_id = user["uid"]
        await users_collection.update_one(
            {"firebase_uid": firebase_id},
            {
                "$set": {
                    "role.role_type": "manager",
                    "role.group_id": group_id
                }
            }
        )
        # Create manager member entry
        manager_member = GroupMember(
            firebase_uid=group.manager_id,
            role="manager",
            joined_at=datetime.now().isoformat(),
            contribution_total=0.0,
            is_active=True
        )
        new_group = Group(
            group_id=group_id,
            name=group.name,
            description=group.description,
            manager_id=group.manager_id,
            members=[manager_member],
            created_at=datetime.now().isoformat(),
            is_active=True,
            total_goals=0,
            total_contributions=0.0
        )
        await groups_collection.insert_one(new_group.model_dump())
        logger.info(f"New group created: {group.name} by manager {group.manager_id}")
        return GroupResponse(
            **new_group.model_dump(),
            member_count=len(new_group.members)
        )
    except Exception as e:
        logger.error(f"Group creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Group creation failed: {str(e)}")

@router.get("/", response_model=List[GroupResponse])
async def get_all_groups(user=Depends(verify_token)):
    """Get all groups"""
    groups = await groups_collection.find().to_list(length=None)

    return [GroupResponse(**group) for group in groups]

@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(group_id: str, user=Depends(verify_token)):
    """Get specific group by ID"""
    group = await groups_collection.find_one({"group_id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return GroupResponse(
        **group,
        member_count=len(group["members"])
    )

@router.post("/{group_id}/members", response_model=GroupResponse)
async def add_member_to_group(group_id: str, member_request: AddMemberRequest, user=Depends(verify_token)):
    """Add a member to group"""
    group = await groups_collection.find_one({"group_id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Check if user is already a member
    for member in group.get("members", []):
        if member.get("firebase_uid") == member_request.firebase_uid:
            raise HTTPException(status_code=400, detail="User is already a member of this group")
    
    # Add new member
    new_member = GroupMember(
        firebase_uid=member_request.firebase_uid,
        role=member_request.role,
        joined_at=datetime.now().isoformat(),
        contribution_total=0.0,
        is_active=True
    )
        
    await groups_collection.update_one(
        {"group_id": group_id},
        {"$push": {"members": new_member.model_dump()}}
    )

    updated_group = await groups_collection.find_one({"group_id": group_id})
    if not updated_group:
        raise HTTPException(status_code=500, detail="Failed to fetch updated group")
    
    logger.info(f"User {member_request.firebase_uid} added to group {group_id} as {member_request.role}")
    
    return GroupResponse(
        **updated_group,
        member_count=len(group.members)
    )

@router.delete("/{group_id}/members/{firebase_uid}")
async def remove_member_from_group(group_id: str, firebase_uid: str, user=Depends(verify_token)):
    """Remove a member from group"""
    # First check if group exists
    group = await groups_collection.find_one({"group_id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Check if the member exists
    members = group.get("members", [])
    if not any(member.get("firebase_uid") == firebase_uid for member in members):
        raise HTTPException(status_code=404, detail="Member not found in this group")

    # Remove the member using $pull
    await groups_collection.update_one(
        {"group_id": group_id},
        {"$pull": {"members": {"firebase_uid": firebase_uid}}}
    )

    logger.info(f"User {firebase_uid} removed from group {group_id}")
    return {"message": f"User {firebase_uid} removed from group successfully"}

@router.get("/{group_id}/members", response_model=List[GroupMember])
async def get_group_members(group_id: str, user=Depends(verify_token)):
    """Get all members of a group"""
    group = await groups_collection.find_one({"group_id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    members = group.get("members", [])
    return members

@router.put("/{group_id}/members/{firebase_uid}/role")
async def update_member_role(group_id: str, firebase_uid: str, new_role: str, user=Depends(verify_token)):
    """Update member role in group"""
    group = await groups_collection.find_one({"group_id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Cannot change manager role
    # if user_id == group.manager_id:
    #     raise HTTPException(status_code=400, detail="Cannot change manager role")
    
    # Find and update member
    await groups_collection.update_one(
        {
            "group_id": group_id,
            "members.firebase_uid": firebase_uid
        },
        {
            "$set": {
                "members.$.role": new_role
            }
        }
    )
    return {"message": f"Member role updated to {new_role}"}

# We settle on one group per person so i dont think we need this route
@router.get("/user/{user_id}", response_model=List[GroupResponse])
def get_user_groups(user_id: str):
    """Get all groups where user is a member"""
    # We settle on one group per person so i dont think we need this route

    user_groups = []
    
    # for group in group_db.values():
    #     for member in group.members:
    #         if member.user_id == user_id and member.is_active:
    #             user_groups.append(GroupResponse(
    #                 **group.model_dump(),
    #                 member_count=len(group.members)
    #             ))
    #             break
    
    return user_groups

@router.put("/{group_id}")
async def update_group(group_id: str, group_update: GroupBase):
    """Update group information"""
    group = await groups_collection.find_one({"group_id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    await groups_collection.update_one(
        {"group_id": group_id},
        {
            "$set": {
                "name": group_update.name,
                "description": group_update.description
            }
        }
    )
    
    logger.info(f"Group {group_id} updated")
    
    return {"message": f"Group {group_id} information updated"}

    # return GroupResponse(
    #     **group,
    #     member_count=len(group.members)
    # )

@router.delete("/{group_id}")
async def delete_group(group_id: str):
    """Delete/deactivate a group"""
    group = await groups_collection.find_one({"group_id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    await groups_collection.update_one(
        {"group_id": group_id},
        {
            "$set": {
                "is_active": False
            }
        }
    )
    
    logger.info(f"Group {group_id} deactivated")
    
    return {"message": "Group deactivated successfully"}

@router.get("/{group_id}/stats")
async def get_group_statistics(group_id: str):
    """Get group statistics"""
    group = await groups_collection.find_one({"group_id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    members = group.get("members", [])
    
    active_members = len([m for m in members if m.get("is_active")])
    managers = len([m for m in members if m.get("role") == "manager"])
    contributors = len([m for m in members if m.get("role") == "contributor"])
    
    return {
        "group_id": group_id,
        "group_name": group["name"],
        "total_members": len(group.members),
        "active_members": active_members,
        "managers": managers,
        "contributors": contributors,
        "total_goals": group["total_goals"],
        "total_contributions": group["total_contributions"],
        # "average_contribution": group.total_contributions / active_members if active_members > 0 else 0,
        "created_at": group["created_at"]
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