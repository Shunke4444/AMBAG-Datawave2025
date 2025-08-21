import logging
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from . import mongo
from .verify_token import verify_token
from .mongo import plans_collection, goals_collection

logging.basicConfig(level=logging.INFO)

router = APIRouter(prefix="/allocate", tags=["allocate"])

# --- Models ---
class MemberQuota(BaseModel):
    id: str
    name: Optional[str] = None
    quota: float

class AllocateQuotasRequest(BaseModel):
    plan_id: Optional[str] = None
    goal_id: Optional[str] = None
    group_id: Optional[str] = None
    members: List[MemberQuota]

# --- Routes ---
@router.get("/test-alive")
async def test_alive():
    return {"status": "allocate router is active"}

@router.get("/quota/{goal_id}/{user_id}")
async def get_member_quota(goal_id: str, user_id: str, plan_id: Optional[str] = None):
    doc = None
    if plan_id:
        doc = await plans_collection.find_one({"plan_id": str(plan_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Plan not found")
    else:
        doc = await goals_collection.find_one({"goal_id": str(goal_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Goal not found")

    for m in doc.get("members", []):
        if str(m.get("id")) == str(user_id):
            return {"quota": m.get("quota", 0)}
    return {"quota": 0}

async def update_member_quotas(plan_id: Optional[str] = None, goal_id: Optional[str] = None, members: Optional[List[Dict[str, Any]]] = None):
    if not plan_id and not goal_id:
        raise HTTPException(status_code=400, detail="plan_id or goal_id is required")
    if members is None or len(members) == 0:
        raise HTTPException(status_code=400, detail="members list cannot be empty")

    if plan_id:
        doc = await plans_collection.find_one({"plan_id": plan_id})
        collection, id_field, id_value, not_found_msg = plans_collection, "plan_id", plan_id, "Plan not found"
    else:
        doc = await goals_collection.find_one({"goal_id": goal_id})
        collection, id_field, id_value, not_found_msg = goals_collection, "goal_id", goal_id, "Goal not found"

    if not doc:
        raise HTTPException(status_code=404, detail=not_found_msg)

    if "members" not in doc or not isinstance(doc["members"], list):
        doc["members"] = []

    updated_members = []
    for m in members:
        found = False
        for dm in doc["members"]:
            if dm.get("id") == m["id"]:
                dm["quota"] = m["quota"]
                found = True
                updated_members.append(dm)
                break
        if not found:
            new_member = {"id": m["id"], "name": m.get("name", ""), "quota": m["quota"]}
            doc["members"].append(new_member)
            updated_members.append(new_member)

    await collection.update_one({id_field: id_value}, {"$set": {"members": doc["members"]}})
    return updated_members

@router.post("/quotas")
async def allocate_quotas(req: AllocateQuotasRequest, request: Request, user=Depends(verify_token)):
    updated_members = await update_member_quotas(plan_id=req.plan_id, goal_id=req.goal_id, members=[m.dict() for m in req.members])
    return {"success": True, "updated_members": updated_members}
