from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Union
from datetime import datetime, date
import uuid

router = APIRouter(
    prefix="/goal",
    tags=["goal"]
)

goals = []
pool_status = {}
pending_goals = []  

class goalCreate(BaseModel):
    title: str
    goal_amount: float
    description: Optional[str] = None
    creator_role: str  # "manager" or "member"
    creator_name: str 
    target_date: date  

class goal(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    goal_amount: float
    current_amount: float = 0.0
    creator_role: str
    creator_name: str
    target_date: date 
    is_paid: bool = False
    status: str = "active"  # active, completed, cancelled
    created_at: str
    approved_at: Optional[str] = None

class pendingGoal(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    goal_amount: float
    creator_role: str
    creator_name: str
    target_date: date
    status: str = "pending"  # pending, approved, rejected
    created_at: str
    
class goalApproval(BaseModel):
    action: str  # "approve" or "reject"
    manager_name: str
    rejection_reason: Optional[str] = None 

class pendingGoalResponse(BaseModel):
    message: str
    goal_id: str
    status: str
    pending_goal: pendingGoal 


@router.post("/", response_model=Union[goal, pendingGoalResponse])
def create_goal(goal_data: goalCreate):
    if goal_data.creator_role not in ["manager", "member"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'manager' or 'member'.")
    
    goal_id = str(uuid.uuid4())
    current_time = datetime.now().isoformat()
    
    if len(goals) == 0 or goal_data.creator_role == "manager":
        new_goal = goal(
            id=goal_id,
            title=goal_data.title,
            description=goal_data.description,
            goal_amount=goal_data.goal_amount,
            creator_role=goal_data.creator_role,
            creator_name=goal_data.creator_name,
            target_date=goal_data.target_date,
            created_at=current_time,
            approved_at=current_time if goal_data.creator_role == "manager" else None
        )
        goals.append(new_goal)
        pool_status[goal_id] = {
            "current_amount": 0.0, 
            "is_paid": False, 
            "status": "active",
            "contributors": []
        }
        return new_goal
    
    else:
        pending_goal = pendingGoal(
            id=goal_id,
            title=goal_data.title,
            description=goal_data.description,
            goal_amount=goal_data.goal_amount,
            creator_role=goal_data.creator_role,
            creator_name=goal_data.creator_name,
            target_date=goal_data.target_date,
            created_at=current_time
        )
        pending_goals.append(pending_goal)
        
        return pendingGoalResponse(
            message=f"Goal '{goal_data.title}' created and sent for manager approval",
            goal_id=goal_id,
            status="pending_approval",
            pending_goal=pending_goal
        )

@router.get("/pending", response_model=List[pendingGoal])
def get_pending_goals():
    return [goal for goal in pending_goals if goal.status == "pending"]

@router.post("/pending/{goal_id}/approve")
def approve_or_reject_goal(goal_id: str, approval: goalApproval):
    if approval.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
    
    pending_goal = None
    pending_goal_index = None
    
    for i, goal_item in enumerate(pending_goals):
        if goal_item.id == goal_id and goal_item.status == "pending":
            pending_goal = goal_item
            pending_goal_index = i
            break

    if not pending_goal or pending_goal_index is None:
        raise HTTPException(status_code=404, detail="Pending goal not found or already processed")
    
    current_time = datetime.now().isoformat()
    
    try:
        if approval.action == "approve":
            new_goal = goal(
                id=pending_goal.id,
                title=pending_goal.title,
                description=pending_goal.description,
                goal_amount=pending_goal.goal_amount,
                creator_role=pending_goal.creator_role,
                creator_name=pending_goal.creator_name,
                target_date=pending_goal.target_date,
                created_at=pending_goal.created_at,
                approved_at=current_time
            )
            
            goals.append(new_goal)
            
            pool_status[goal_id] = {
                "current_amount": 0.0, 
                "is_paid": False, 
                "status": "active",
                "contributors": []
            }
            
            pending_goals[pending_goal_index].status = "approved"
            
            return {
                "message": f"Goal '{pending_goal.title}' approved by {approval.manager_name}",
                "goal": new_goal,
                "approved_at": current_time
            }
        
        elif approval.action == "reject":
            pending_goals[pending_goal_index].status = "rejected"
            
            return {
                "message": f"Goal '{pending_goal.title}' rejected by {approval.manager_name}",
                "reason": approval.rejection_reason or "No reason provided",
                "rejected_at": current_time
            }
            
    except Exception as e:
        # Log the error for debugging
        print(f"Error in approve_or_reject_goal: {str(e)}")
        print(f"Goal ID: {goal_id}")
        print(f"Approval data: {approval}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[goal])
def get_all_goals():
    return goals

@router.get("/{goal_id}", response_model=goal)
def get_goal(goal_id: str):
    for goal_item in goals:
        if goal_item.id == goal_id:
            if goal_id in pool_status:
                goal_item.current_amount = pool_status[goal_id]["current_amount"]
                goal_item.is_paid = pool_status[goal_id]["is_paid"]
                goal_item.status = pool_status[goal_id]["status"]
            return goal_item
    raise HTTPException(status_code=404, detail="Goal not found")

class contributionData(BaseModel):
    amount: float
    contributor_name: str
    payment_method: Optional[str] = "cash"
    reference_number: Optional[str] = None

@router.post("/{goal_id}/contribute")
def contribute_to_goal(goal_id: str, contribution: contributionData):
    if goal_id not in pool_status:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    if contribution.amount <= 0:
        raise HTTPException(status_code=400, detail="Contribution amount must be positive")
    
    goal_item = None
    for g in goals:
        if g.id == goal_id:
            goal_item = g
            break
    
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    pool_status[goal_id]["current_amount"] += contribution.amount
    pool_status[goal_id]["contributors"].append({
        "name": contribution.contributor_name,
        "amount": contribution.amount,
        "payment_method": contribution.payment_method,
        "reference_number": contribution.reference_number,
        "timestamp": datetime.now().isoformat()
    })
    
    if pool_status[goal_id]["current_amount"] >= goal_item.goal_amount:
        pool_status[goal_id]["is_paid"] = True
        pool_status[goal_id]["status"] = "completed"
    
    goal_item.current_amount = pool_status[goal_id]["current_amount"]
    goal_item.is_paid = pool_status[goal_id]["is_paid"]
    goal_item.status = pool_status[goal_id]["status"]
    
    return {
        "message": f"₱{contribution.amount} contributed by {contribution.contributor_name}",
        "goal": goal_item,
        "remaining_amount": max(0, goal_item.goal_amount - goal_item.current_amount),
        "progress_percentage": min(100, (goal_item.current_amount / goal_item.goal_amount) * 100)
    }

@router.get("/{goal_id}/contributors")
def get_goal_contributors(goal_id: str):
    if goal_id not in pool_status:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return {
        "goal_id": goal_id,
        "contributors": pool_status[goal_id]["contributors"],
        "total_contributors": len(pool_status[goal_id]["contributors"]),
        "total_amount": pool_status[goal_id]["current_amount"]
    } 