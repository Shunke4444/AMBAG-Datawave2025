from pydantic import BaseModel
from datetime import datetime

# Model for manual virtual balance creation
class VirtualBalanceCreate(BaseModel):
	owner_uid: str
	amount: float
	goal_title: str = "Manual Top-up"
	balance_type : str
	status: str = "ready_for_external_payment"

from fastapi import APIRouter, Depends, HTTPException
from .mongo import users_collection, virtual_balances_collection
from .verify_token import verify_token

router = APIRouter(prefix="/balance", tags=["balance"])

# Admin endpoint to add a virtual balance for a user
@router.post("/add")
async def add_virtual_balance(data: VirtualBalanceCreate,):
	vb = {
		"owner_uid": data.owner_uid,
		"amount": data.amount,
		"goal_title": data.goal_title,
		"type" : data.balance_type,
		"status": data.status,
		"created_at": datetime.now().isoformat()
	}
	result = await virtual_balances_collection.insert_one(vb)
	vb["_id"] = str(result.inserted_id)
	return {"message": "Virtual balance added", "virtual_balance": vb}

# Get the authenticated user's virtual balance
@router.get("/{owner_uid}")
async def get_balance_by_uid(owner_uid: str):
    user_doc = await users_collection.find_one({"firebase_uid": owner_uid})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    balances = await virtual_balances_collection.find({"owner_uid": owner_uid}).to_list(length=None)
    # Convert ObjectId to string for each balance
    for b in balances:
        if "_id" in b:
            b["_id"] = str(b["_id"])
    total_balance = sum(b.get("amount", 0) for b in balances)
    return {
        "user_uid": owner_uid,
        "balance_types": list(set(b.get("type") for b in balances if "type" in b)),
        "total_balance": total_balance,
        "virtual_balances": balances
    }



