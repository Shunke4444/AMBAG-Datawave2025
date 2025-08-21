
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from . import mongo
from .verify_token import verify_token

router = APIRouter(prefix="/allocate", tags=["allocate"])
# --- Pydantic models ---
class MemberQuota(BaseModel):
	id: str
	name: Optional[str] = None
	quota: float

class AllocateQuotasRequest(BaseModel):
	plan_id: Optional[str] = None
	goal_id: Optional[str] = None
	group_id: Optional[str] = None
	members: List[MemberQuota]

# --- Helper functions ---
from .mongo import plans_collection, goals_collection
from typing import Optional
async def update_member_quotas(plan_id: Optional[str] = None, goal_id: Optional[str] = None, members: Optional[List[Dict[str, Any]]] = None):
	"""
	Update the quotas for members in the specified plan or goal document.
	"""
	if plan_id:
		doc = await plans_collection.find_one({"plan_id": plan_id})
		collection = plans_collection
		id_field = "plan_id"
		id_value = plan_id
		not_found_msg = "Plan not found"
	elif goal_id:
		doc = await goals_collection.find_one({"goal_id": goal_id})
		collection = goals_collection
		id_field = "goal_id"
		id_value = goal_id
		not_found_msg = "Goal not found"
	else:
		raise HTTPException(status_code=400, detail="plan_id or goal_id is required")
	if not doc:
		raise HTTPException(status_code=404, detail=not_found_msg)
	if members is None:
		raise HTTPException(status_code=400, detail="members is required")
	updated_members = []
	for m in members:
		found = False
		for dm in doc.get("members", []):
			if dm.get("id") == m["id"]:
				dm["quota"] = m["quota"]
				found = True
				updated_members.append(dm)
				break
		if not found:
			new_member = {"id": m["id"], "name": m.get("name", ""), "quota": m["quota"]}
			doc.setdefault("members", []).append(new_member)
			updated_members.append(new_member)
	await collection.update_one({id_field: id_value}, {"$set": {"members": doc["members"]}})
	return updated_members

@router.post("/quotas")
async def allocate_quotas(
	req: AllocateQuotasRequest,
	request: Request,
	user=Depends(verify_token)
):
	"""
	Allocate quotas to members for a given plan or goal.
	"""
	# Require at least goal_id
	if not req.plan_id and not req.goal_id:
		raise HTTPException(status_code=400, detail="plan_id or goal_id is required")
	try:
		updated_members = await update_member_quotas(plan_id=req.plan_id, goal_id=req.goal_id, members=[m.dict() for m in req.members])
	except HTTPException as e:
		raise e
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))
	return {"success": True, "updated_members": updated_members}
