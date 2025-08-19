import uuid
# --- imports ---
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel
from datetime import datetime
from .mongo import db, users_collection, goals_collection
from .verify_token import verify_token
from bson import ObjectId

# --- router initialization ---
router = APIRouter(prefix="/request", tags=["requests"])

requests_collection = db["requests"]
# Approve a member request: store in goals, then delete request
@router.post("/approve/{request_id}")
async def approve_member_request(request_id: str, user=Depends(verify_token)):
    user_id = user.get("uid")
    user_doc = await users_collection.find_one({"firebase_uid": user_id})
    user_role = user_doc.get("role", {}).get("role_type", "contributor") if user_doc else "contributor"
    if user_role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can approve member requests.")
    data = await requests_collection.find_one({"_id": ObjectId(request_id)})
    if not data:
        raise HTTPException(status_code=404, detail="Request not found.")
    # Insert into goals collection (basic mapping, adjust as needed)
    request_user_id = data.get("user_id", "abcd") if user_doc else "abcd"
    request_user_doc = await users_collection.find_one({"firebase_uid": request_user_id})
    creator_name = "Unknown User"
    goal_id = str(uuid.uuid4())
    if request_user_doc:
        profile = request_user_doc.get("profile")
        if profile:
            creator_name = profile.get("first_name", "") + " " + profile.get("last_name", "")
        else:
            creator_name = user_doc.get("email", "Unknown User")
    user_role = request_user_doc.get("role", {}).get("role_type", "contributor") if request_user_doc else "contributor"
    goal_doc = {
        "goal_id": goal_id,
        "group_id": data.get("metadata", {}).get("group_id", "abcd"),
        "title": data.get("subject") or data.get("metadata", {}).get("title", "Untitled Goal"),
        "description": data.get("description", ""),
        "goal_amount": data.get("metadata", {}).get("goal_amount", 0.0),
        "goal_type": data.get("metadata", {}).get("goal_type", "Other"),
        "current_amount": 0.0,
        "creator_role": user_role,
        "creator_name": creator_name,
        "target_date": data.get("metadata", {}).get("target_date", datetime.now().date().isoformat()),
        "is_paid": False,
        "status": "active",
        "created_at": data.get("created_at"),
        "approved_at": data.get("created_at"),
        "auto_payment_settings": data.get("metadata", {}).get("auto_payment_settings", None)
    }
    await goals_collection.insert_one(goal_doc)
    await requests_collection.delete_one({"_id": ObjectId(request_id)})
    return {"message": "Request approved and added to goals."}

# Reject a member request: delete from requests
@router.post("/reject/{request_id}")
async def reject_member_request(request_id: str, user=Depends(verify_token)):
    user_id = user.get("uid")
    user_doc = await users_collection.find_one({"firebase_uid": user_id})
    user_role = user_doc.get("role", {}).get("role_type", "contributor") if user_doc else "contributor"
    if user_role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can reject member requests.")
    req = await requests_collection.find_one({"_id": ObjectId(request_id)})
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    await requests_collection.delete_one({"_id": ObjectId(request_id)})
    return {"message": "Request rejected and deleted."}


class MemberRequest(BaseModel):
    type: str
    subject: str
    description: str
    priority: str
    metadata: dict = {}


# Allow both members and managers to POST, but managers' requests go to goals_collection
@router.post("/")
async def create_member_request(request: MemberRequest, user=Depends(verify_token)):
    data = request.model_dump()
    data["created_at"] = datetime.now().isoformat()
    data["user_id"] = user.get("uid")
    user_doc = await users_collection.find_one({"firebase_uid": user.get("uid")})
    user_role = user_doc.get("role", {}).get("role_type", "contributor") if user_doc else "contributor"
    if user_role == "manager":
        import uuid
        goal_id = str(uuid.uuid4())
        creator_name = "Unknown User"
        if user_doc:
            profile = user_doc.get("profile")
            if profile:
                creator_name = profile.get("first_name", "") + " " + profile.get("last_name", "")
            else:
                creator_name = user_doc.get("email", "Unknown User")
        goal_doc = {
            "goal_id": goal_id,
            "group_id": data.get("metadata", {}).get("group_id", "abcd"),
            "title": data.get("subject") or data.get("metadata", {}).get("title", "Untitled Goal"),
            "description": data.get("description", ""),
            "goal_amount": data.get("metadata", {}).get("goal_amount", 0.0),
            "goal_type": data.get("metadata", {}).get("goal_type", "Other"),
            "current_amount": 0.0,
            "creator_role": user_role,
            "creator_name": creator_name,
            "target_date": data.get("metadata", {}).get("target_date", datetime.now().date().isoformat()),
            "is_paid": False,
            "status": "active",
            "created_at": data.get("created_at"),
            "approved_at": data.get("created_at"),
            "auto_payment_settings": data.get("metadata", {}).get("auto_payment_settings", None)
        }
        result = await goals_collection.insert_one(goal_doc)
        return {"message": "Manager request submitted as goal", "goal_id": str(result.inserted_id)}
    else:
        result = await requests_collection.insert_one(data)
        return {"message": "Request submitted", "request_id": str(result.inserted_id)}

# Manager: View all member requests
@router.get("/", response_model=list)
async def list_member_requests(user=Depends(verify_token)):
    user_id = user.get("uid")
    user_doc = await users_collection.find_one({"firebase_uid": user_id})
    user_role = user_doc.get("role", {}).get("role_type", "contributor") if user_doc else "contributor"
    if user_role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view all member requests.")
    user_group_id = user_doc.get("role", {}).get("group_id", "abcd") if user_doc else "abcd"
    requests = await requests_collection.find({"metadata.group_id": user_group_id}).to_list(length=None)
    # Convert ObjectId to string for each request
    for req in requests:
        if "_id" in req:
            req["_id"] = str(req["_id"])
    return requests

