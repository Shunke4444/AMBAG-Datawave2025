from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any
from pydantic import BaseModel

from .mongo import db, plans_collection, groups_collection, goals_collection

router = APIRouter()

# Pydantic models
class MemberQuota(BaseModel):
	id: int
	name: str
	quota: float

class AllocateRequest(BaseModel):
	plan_id: str
	members: List[MemberQuota]



@router.post("/allocate/quotas")
async def allocate_quotas(
	data: AllocateRequest = Body(...),
):
	"""
	Allocate quotas to members for a goal. Only users in the group can be assigned quotas.
	"""
	plan = await plans_collection.find_one({"_id": data.plan_id})
	if not plan:
		raise HTTPException(status_code=404, detail="Plan not found")

	# Fetch the goal info (assume plan_id is also goal_id, or you can adjust as needed)
	goal = await goals_collection.find_one({"_id": data.plan_id})
	if not goal:
		raise HTTPException(status_code=404, detail="Goal not found")

	# Get group_id from goal or plan
	group_id = goal.get("group_id") or plan.get("group_id")
	if not group_id:
		raise HTTPException(status_code=400, detail="Group ID not found in goal or plan.")

	# Fetch group members from groups collection
	group = await groups_collection.find_one({"_id": group_id})
	if not group:
		raise HTTPException(status_code=404, detail="Group not found")
	group_members = group.get("members", [])
	group_member_ids = {str(m.get("id")) for m in group_members}

	# Check that all assigned quotas are for users in the group
	for m in data.members:
		if str(m.id) not in group_member_ids:
			raise HTTPException(status_code=400, detail=f"User {m.id} is not a member of this group.")

	# Update the plan's member quotas
	await plans_collection.update_one(
		{"_id": data.plan_id},
		{"$set": {"member_quotas": [m.dict() for m in data.members]}}
	)

	updated_plan = await plans_collection.find_one({"_id": data.plan_id})
	return {"success": True, "plan": updated_plan}
