from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Union
from datetime import datetime, date, timedelta
import uuid
import logging
import asyncio
import random
from enum import Enum

# logging for debugging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Payment Method Enum for Bank-Free Auto Payment
class PaymentMethod(str, Enum):
    VIRTUAL_BALANCE = "virtual_balance"
    MANUAL = "manual"
    BPI = "bpi"

# Bank-Free Payment Settings
class BankFreePaymentSettings(BaseModel):
    enabled: bool = False
    payment_method: PaymentMethod = PaymentMethod.MANUAL
    recipient_details: Optional[Dict[str, str]] = None
    require_confirmation: bool = True
    auto_complete_threshold: Optional[float] = None
    notification_settings: Dict[str, bool] = {
        "notify_manager": True,
        "notify_contributors": True,
        "send_receipt": True
    }

# Payment Confirmation Model
class PaymentConfirmation(BaseModel):
    goal_id: str
    confirmed_by: str
    payment_method: str
    receipt_image_url: Optional[str] = None
    confirmation_notes: Optional[str] = None

# Auto Payment Confirmation Model
class AutoPaymentConfirmation(BaseModel):
    goal_id: str
    approve_payment: bool
    manager_name: str
    confirmation_reason: Optional[str] = None

router = APIRouter(prefix="/goal", tags=["goals"])

virtual_balances = {}
payment_instructions = {}
auto_payment_queue = {}

async def notify_contributors_of_completion(goal_id: str, confirmation: Dict):
    """Notify all contributors that goal is completed and paid"""
    goal_item = goals[goal_id]
    contributors = pool_status[goal_id]["contributors"]
    
    notification = {
        "type": "goal_completed",
        "goal_title": goal_item.title,
        "total_amount": goal_item.current_amount,
        "payment_method": confirmation["payment_method"],
        "completed_by": confirmation["confirmed_by"],
        "completion_time": confirmation["completion_time"],
        "message": f"🎉 Goal '{goal_item.title}' has been completed and paid!"
    }

    # Agent try to send notification to AI tools system
    try:
        from .ai_tools_clean import notifications_db
        # Add completion notification to AI tools system
        ai_notification = {
            "id": f"completion_{goal_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "goal_completed_auto_payment",
            "recipient": "all_contributors",
            "group_id": goal_id,
            "message": f"🎉 AUTO PAYMENT SUCCESS: '{goal_item.title}' completed!\n\n" +
                      f"💰 Amount: ₱{goal_item.current_amount:,.2f}\n" +
                      f"📅 Completed: {confirmation.get('completion_time', datetime.now().isoformat())}\n" +
                      f"💳 Method: {confirmation['payment_method']}\n" +
                      f"✅ Payment processed automatically\n\n" +
                      f"Thank you to all {len(contributors)} contributors! 🙌",
            "channel": "push",
            "status": "sent",
            "timestamp": datetime.now().isoformat(),
            "auto_generated": True,
            "auto_payment": True,
            "goal_data": {
                "goal_id": goal_id,
                "title": goal_item.title,
                "amount": goal_item.current_amount,
                "contributors_count": len(contributors)
            }
        }
        
        notifications_db.append(ai_notification)
        logger.info(f"✅ Auto payment success notification sent to AI tools system for goal {goal_id}")
        
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send auto payment notification to AI tools: {str(e)}")
    
    # Log for debugging
    logger.info(f"📢 Notifying {len(contributors)} contributors of goal completion")
    
    return notification

async def notify_manager_of_request(request_id: str, request_data: Dict):
    """Notify manager when a new request is submitted"""
    try:
        from .ai_tools_clean import notifications_db
        
        # Create notification for manager
        manager_notification = {
            "id": f"request_{request_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "member_request",
            "recipient": request_data["to_manager_id"],
            "group_id": request_data.get("group_id"),
            "message": f"📧 New Request: {request_data['subject']}\n\n" +
                      f"From: {request_data['from_user_name']}\n" +
                      f"Subject: {request_data['subject']}\n" +
                      f"Message: {request_data['message'][:100]}{'...' if len(request_data['message']) > 100 else ''}\n\n" +
                      f"Please review and respond to this request.",
            "channel": "push",
            "status": "sent",
            "timestamp": datetime.now().isoformat(),
            "auto_generated": True,
            "request_data": {
                "request_id": request_id,
                "subject": request_data["subject"],
                "from_user": request_data["from_user_name"]
            }
        }
        
        notifications_db.append(manager_notification)
        logger.info(f"📧 Manager notification sent for request {request_id}")
        
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send manager request notification: {str(e)}")

async def notify_member_of_request_response(request_id: str, response_data: Dict):
    """Notify member when manager responds to their request"""
    try:
        from .ai_tools_clean import notifications_db
        
        # Create notification for member
        member_notification = {
            "id": f"response_{request_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "request_response",
            "recipient": response_data["from_user_id"],
            "group_id": response_data.get("group_id"),
            "message": f"💬 Manager Response to: {response_data['subject']}\n\n" +
                      f"Status: {response_data['status'].upper()}\n" +
                      f"Response: {response_data['manager_response']}\n\n" +
                      f"Thank you for your request!",
            "channel": "push",
            "status": "sent",
            "timestamp": datetime.now().isoformat(),
            "auto_generated": True,
            "request_data": {
                "request_id": request_id,
                "subject": response_data["subject"],
                "status": response_data["status"]
            }
        }
        
        notifications_db.append(member_notification)
        logger.info(f"💬 Member notification sent for request response {request_id}")
        
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send member response notification: {str(e)}")

async def notify_goal_approval_decision(goal_id: str, approval_data: Dict):
    """Notify goal creator when manager approves or rejects their goal"""
    try:
        from .ai_tools_clean import notifications_db
        
        pending_goal = pending_goals.get(goal_id)
        if not pending_goal:
            return
        
        # Create notification for goal creator
        approval_notification = {
            "id": f"goal_approval_{goal_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "goal_approval_decision",
            "recipient": pending_goal.creator_name,
            "group_id": goal_id,
            "message": f"🎯 Goal {approval_data['action'].upper()}: {pending_goal.title}\n\n" +
                      f"Goal: {pending_goal.title}\n" +
                      f"Amount: ₱{pending_goal.goal_amount:,.2f}\n" +
                      f"Decision: {approval_data['action'].upper()}\n" +
                      f"Manager: {approval_data['manager_name']}\n" +
                      (f"Reason: {approval_data.get('rejection_reason', 'N/A')}\n" if approval_data['action'] == 'reject' else '') +
                      f"\n{'🎉 Your goal is now active!' if approval_data['action'] == 'approve' else '❌ Please contact your manager for more details.'}",
            "channel": "push",
            "status": "sent",
            "timestamp": datetime.now().isoformat(),
            "auto_generated": True,
            "goal_data": {
                "goal_id": goal_id,
                "title": pending_goal.title,
                "amount": pending_goal.goal_amount,
                "decision": approval_data['action'],
                "manager": approval_data['manager_name']
            }
        }
        
        notifications_db.append(approval_notification)
        logger.info(f"🎯 Goal approval notification sent for goal {goal_id}: {approval_data['action']}")
        
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send goal approval notification: {str(e)}")

async def notify_managers_of_pending_goal(goal_id: str, goal_data: Dict):
    """Notify managers when a new goal is submitted for approval"""
    try:
        from .ai_tools_clean import notifications_db
        from .users import users_db  # Import users to find managers
        
        # Find all managers
        managers = [user for user in users_db.values() if user.role.role_type == "manager"]
        
        for manager in managers:
            manager_notification = {
                "id": f"pending_goal_{goal_id}_{manager.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "type": "pending_goal_approval",
                "recipient": manager.id,
                "group_id": goal_id,
                "message": f"⏳ New Goal Pending Approval\n\n" +
                          f"Title: {goal_data['title']}\n" +
                          f"Amount: ₱{goal_data['goal_amount']:,.2f}\n" +
                          f"Creator: {goal_data['creator_name']}\n" +
                          f"Target Date: {goal_data['target_date']}\n" +
                          f"Description: {goal_data.get('description', 'No description')}\n\n" +
                          f"Please review and approve/reject this goal.",
                "channel": "push",
                "status": "sent",
                "timestamp": datetime.now().isoformat(),
                "auto_generated": True,
                "goal_data": {
                    "goal_id": goal_id,
                    "title": goal_data["title"],
                    "amount": goal_data["goal_amount"],
                    "creator": goal_data["creator_name"]
                }
            }
            
            notifications_db.append(manager_notification)
        
        logger.info(f"⏳ Pending goal notifications sent to {len(managers)} managers for goal {goal_id}")
        
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send pending goal notifications: {str(e)}")


router = APIRouter(
    prefix="/goal",
    tags=["goal"]
)

goals: Dict[str, "goal"] = {}
pool_status: Dict[str, Dict] = {}
pending_goals: Dict[str, "pendingGoal"] = {}
auto_payment_queue: Dict[str, Dict] = {}  # Store pending auto payments

# Goal Models
class goalCreate(BaseModel):
    title: str
    goal_amount: float
    description: Optional[str] = None
    creator_role: str  # "manager" or "member"
    creator_name: str 
    target_date: date  
    auto_payment_settings: Optional[BankFreePaymentSettings] = None

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
    status: str = "active"  # active, completed, cancelled, awaiting_payment, awaiting_auto_payment, awaiting_payment_confirmation
    created_at: str
    approved_at: Optional[str] = None
    auto_payment_settings: Optional[BankFreePaymentSettings] = None

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

# Bank-Free Auto Payment Functions
async def process_bank_free_auto_payment(goal_id: str) -> Dict:
    goal_item = goals.get(goal_id)
    if not goal_item or not goal_item.auto_payment_settings:
        return {"error": "Goal not found or auto payment not configured"}
    
    settings = goal_item.auto_payment_settings
    if not settings.enabled:
        return {"error": "Auto payment not enabled for this goal"}
    
    pool_data = pool_status.get(goal_id, {})
    amount = pool_data.get("current_amount", 0)
    
    if amount < goal_item.goal_amount:
        return {"error": "Goal not yet completed"}
    
    # Check if auto completion threshold is met (for virtual balance)
    if (settings.auto_complete_threshold and 
        amount <= settings.auto_complete_threshold and 
        settings.payment_method == PaymentMethod.VIRTUAL_BALANCE):
        
        logger.info(f"🤖 Auto-completing virtual payment for goal {goal_id} - amount ₱{amount} within threshold")
        return await process_virtual_balance_payment(goal_id)
    
    elif settings.payment_method == PaymentMethod.VIRTUAL_BALANCE:
        return await process_virtual_balance_payment(goal_id)
    
    
    elif settings.require_confirmation:
        # auto payment queue for confirmation
        auto_payment_queue[goal_id] = {
            "goal": goal_item,
            "amount": amount,
            "timestamp": datetime.now().isoformat(),
            "status": "awaiting_confirmation"
        }
        
        goal_item.status = "awaiting_auto_payment"
        pool_status[goal_id]["status"] = "awaiting_auto_payment"
        
        logger.info(f"Goal {goal_id} added to auto payment queue - awaiting manager confirmation")
        return {
            "message": f"Goal '{goal_item.title}' ready for auto payment - awaiting confirmation",
            "requires_confirmation": True,
            "amount": amount
        }
    
    return {"error": "Auto payment configuration invalid"}

async def process_virtual_balance_payment(goal_id: str) -> Dict:
    """Process payment using virtual balance system"""
    goal_item = goals[goal_id]
    amount = pool_status[goal_id]["current_amount"]
    
    # Transfer to virtual payout balance
    payout_id = f"payout_{goal_id}"
    virtual_balances[payout_id] = {
        "amount": amount,
        "goal_title": goal_item.title,
        "status": "ready_for_external_payment",
        "created_at": datetime.now().isoformat()
    }
    
    # Mark goal as completed immediately (virtual transfer)
    goal_item.status = "completed"
    goal_item.is_paid = True
    pool_status[goal_id]["status"] = "completed"
    pool_status[goal_id]["is_paid"] = True
    
    # Remove from queue if it was there
    if goal_id in auto_payment_queue:
        del auto_payment_queue[goal_id]
    
    # Send success notification to AI tools system
    try:
        from .ai_tools_clean import notifications_db
        
        contributors = pool_status[goal_id].get("contributors", [])
        
        # Add completion notification to AI tools system
        ai_notification = {
            "id": f"auto_payment_success_{goal_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "auto_payment_success",
            "recipient": "all_contributors",
            "group_id": goal_id,
            "message": f"🎉 AUTO PAYMENT SUCCESS: '{goal_item.title}' completed!\n\n" +
                      f"💰 Amount: ₱{amount:,.2f}\n" +
                      f"📅 Completed: {datetime.now().isoformat()}\n" +
                      f"💳 Method: Virtual Balance\n" +
                      f"✅ Payment processed automatically\n\n" +
                      f"Thank you to all {len(contributors)} contributors! 🙌",
            "channel": "push",
            "status": "sent",
            "timestamp": datetime.now().isoformat(),
            "auto_generated": True,
            "auto_payment": True,
            "goal_data": {
                "goal_id": goal_id,
                "title": goal_item.title,
                "amount": amount,
                "contributors_count": len(contributors),
                "payment_method": "virtual_balance"
            }
        }
        
        notifications_db.append(ai_notification)
        logger.info(f"✅ Auto payment success notification sent to AI tools system for goal {goal_id}")
        
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send auto payment notification to AI tools: {str(e)}")
    
    logger.info(f"🏦 Virtual transfer completed for goal {goal_id} - ₱{amount}")
    
    return {
        "message": f"Virtual payment completed for '{goal_item.title}'",
        "payout_balance_id": payout_id,
        "amount": amount,
        "status": "completed",
        "note": "Funds transferred to virtual payout balance"
    }


@router.post("/", response_model=Union[goal, pendingGoalResponse])
async def create_goal(goal_data: goalCreate):
    if goal_data.creator_role not in ["manager", "member"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'manager' or 'member'.")
    
    goal_id = str(uuid.uuid4())
    current_time = datetime.now().isoformat()
    
    if not goals or goal_data.creator_role == "manager":
        new_goal = goal(
            id=goal_id,
            title=goal_data.title,
            description=goal_data.description,
            goal_amount=goal_data.goal_amount,
            creator_role=goal_data.creator_role,
            creator_name=goal_data.creator_name,
            target_date=goal_data.target_date,
            created_at=current_time,
            approved_at=current_time if goal_data.creator_role == "manager" else None,
            auto_payment_settings=goal_data.auto_payment_settings
        )
        goals[goal_id] = new_goal
        pool_status[goal_id] = {
            "current_amount": 0.0, 
            "is_paid": False, 
            "status": "active",
            "contributors": []
        }
        
        if goal_data.auto_payment_settings and goal_data.auto_payment_settings.enabled:
            logger.info(f" Auto payment enabled for goal {goal_id}")
        
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
        pending_goals[goal_id] = pending_goal
        
        # Notify managers about pending goal
        await notify_managers_of_pending_goal(goal_id, {
            "title": goal_data.title,
            "goal_amount": goal_data.goal_amount,
            "creator_name": goal_data.creator_name,
            "target_date": str(goal_data.target_date),
            "description": goal_data.description
        })
        
        return pendingGoalResponse(
            message=f"Goal '{goal_data.title}' created and sent for manager approval",
            goal_id=goal_id,
            status="pending_approval",
            pending_goal=pending_goal
        )

@router.get("/pending", response_model=List[pendingGoal])
def get_pending_goals():
    return [goal for goal in pending_goals.values() if goal.status == "pending"]

@router.post("/pending/{goal_id}/approve")
async def approve_or_reject_goal(goal_id: str, approval: goalApproval):
    if approval.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
    
    pending_goal = pending_goals.get(goal_id)

    if not pending_goal or pending_goal.status != "pending":
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
            
            goals[goal_id] = new_goal
            
            pool_status[goal_id] = {
                "current_amount": 0.0, 
                "is_paid": False, 
                "status": "active",
                "contributors": []
            }
            
            pending_goal.status = "approved"
            
            # Send approval notification
            await notify_goal_approval_decision(goal_id, {
                "action": approval.action,
                "manager_name": approval.manager_name,
                "rejection_reason": approval.rejection_reason
            })
            
            return {
                "message": f"Goal '{pending_goal.title}' approved by {approval.manager_name}",
                "goal": new_goal,
                "approved_at": current_time
            }
        
        elif approval.action == "reject":
            pending_goal.status = "rejected"
            
            # Send rejection notification
            await notify_goal_approval_decision(goal_id, {
                "action": approval.action,
                "manager_name": approval.manager_name,
                "rejection_reason": approval.rejection_reason
            })
            
            return {
                "message": f"Goal '{pending_goal.title}' rejected by {approval.manager_name}",
                "reason": approval.rejection_reason or "No reason provided",
                "rejected_at": current_time
            }
            
    except Exception as e:
        print(f"Error in approve_or_reject_goal: {str(e)}")
        print(f"Goal ID: {goal_id}")
        print(f"Approval data: {approval}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/", response_model=List[goal])
def get_all_goals():
    return list(goals.values())

@router.get("/{goal_id}", response_model=goal)
def get_goal(goal_id: str):
    goal_item = goals.get(goal_id)
    if goal_item:
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
async def contribute_to_goal(goal_id: str, contribution: contributionData):
    if goal_id not in pool_status:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    if contribution.amount <= 0:
        raise HTTPException(status_code=400, detail="Contribution amount must be positive")
    
    goal_item = goals.get(goal_id)
    
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    logger.info(f"Contribution received: {contribution.amount} from {contribution.contributor_name} for goal {goal_id}")
    
    pool_status[goal_id]["current_amount"] += contribution.amount
    pool_status[goal_id]["contributors"].append({
        "name": contribution.contributor_name,
        "amount": contribution.amount,
        "payment_method": contribution.payment_method,
        "reference_number": contribution.reference_number,
        "timestamp": datetime.now().isoformat()
    })
    
    # Update goal completion status
    progress_percentage = (pool_status[goal_id]["current_amount"] / goal_item.goal_amount) * 100
    
    # Check if goal is completed
    auto_payment_result = None
    if pool_status[goal_id]["current_amount"] >= goal_item.goal_amount:
        logger.info(f"🎯 Goal {goal_id} reached target amount!")
        
        # Check if auto payment is enabled
        if (goal_item.auto_payment_settings and 
            goal_item.auto_payment_settings.enabled):
            
            logger.info(f"Triggering bank-free auto payment for goal {goal_id}")
            auto_payment_result = await process_bank_free_auto_payment(goal_id)
        else:
            # Standard manual payment flow
            pool_status[goal_id]["status"] = "awaiting_payment"
            goal_item.status = "awaiting_payment"
            logger.info(f"Goal {goal_id} reached target amount - status updated to awaiting_payment")
    
    goal_item.current_amount = pool_status[goal_id]["current_amount"]
    goal_item.is_paid = pool_status[goal_id]["is_paid"]
    goal_item.status = pool_status[goal_id]["status"]
    
    response = {
        "message": f"₱{contribution.amount} contributed by {contribution.contributor_name}",
        "goal": goal_item,
        "remaining_amount": max(0, goal_item.goal_amount - goal_item.current_amount),
        "progress_percentage": min(100, progress_percentage)
    }
    
    # Include auto payment information if triggered
    if auto_payment_result:
        response["auto_payment"] = auto_payment_result
    
    return response

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

@router.put("/{goal_id}/status")
def update_goal_status(goal_id: str, status: str):
    if status not in ["active", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    goal_item = goals.get(goal_id)
    
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    pool_status[goal_id]["status"] = status
    goal_item.status = status
    
    return {"message": f"Goal '{goal_item.title}' status updated to {status}"}

@router.delete("/{goal_id}")
def delete_goal(goal_id: str):
    if goal_id not in goals:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    deleted_goal = goals.pop(goal_id)
    
    if goal_id in pool_status:
        del pool_status[goal_id]
    
    return {"message": f"Goal '{deleted_goal.title}' deleted successfully"}


#add ai to ping manager for payment
@router.post("/{goal_id}/payout")
def payout_goal(goal_id: str, manager_approval: bool):
    goal_item = goals.get(goal_id)
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")

    if goal_item.status != "awaiting_payment":
        raise HTTPException(status_code=400, detail="Goal is not awaiting payment.")

    if manager_approval:
        goal_item.status = "completed"
        goal_item.is_paid = True
        pool_status[goal_id]["status"] = "completed"
        pool_status[goal_id]["is_paid"] = True
        return {"message": f"Goal '{goal_item.title}' has been paid out."}
    else:
        goal_item.status = "active"
        pool_status[goal_id]["status"] = "active"
        return {"message": f"Payment for goal '{goal_item.title}' has been rejected by the manager."}

# Bank-Free Auto Payment Management Endpoints

@router.get("/auto-payment/queue")
def get_auto_payment_queue():
    """Get all goals awaiting auto payment confirmation"""
    return {
        "pending_auto_payments": list(auto_payment_queue.values()),
        "total_pending": len(auto_payment_queue)
    }

@router.post("/{goal_id}/auto-payment/confirm")
async def confirm_auto_payment(goal_id: str, confirmation: AutoPaymentConfirmation):
    """Manager confirms or rejects auto payment"""
    if goal_id not in auto_payment_queue:
        raise HTTPException(status_code=404, detail="Goal not found in auto payment queue")
    
    if confirmation.goal_id != goal_id:
        raise HTTPException(status_code=400, detail="Goal ID mismatch")
    
    goal_item = goals.get(goal_id)
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    logger.info(f"🤖 Auto payment confirmation for goal {goal_id}: {'APPROVED' if confirmation.approve_payment else 'REJECTED'} by {confirmation.manager_name}")
    
    if confirmation.approve_payment:
        # Execute bank-free auto payment
        result = await process_bank_free_auto_payment(goal_id)
        return {
            "message": f"Auto payment approved and executed by {confirmation.manager_name}",
            "payment_result": result,
            "confirmation_reason": confirmation.confirmation_reason
        }
    else:
        # Reject auto payment - revert to manual
        goal_item.status = "awaiting_payment"
        pool_status[goal_id]["status"] = "awaiting_payment"
        
        # Remove from queue
        del auto_payment_queue[goal_id]
        
        return {
            "message": f"Auto payment rejected by {confirmation.manager_name} - reverted to manual payment",
            "rejection_reason": confirmation.confirmation_reason or "No reason provided"
        }

@router.post("/{goal_id}/auto-payment/setup")
def setup_bank_free_auto_payment(goal_id: str, settings: BankFreePaymentSettings):
    """Setup bank-free auto payment for a goal"""
    goal_item = goals.get(goal_id)
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal_item.auto_payment_settings = settings
    
    logger.info(f"🤖 Bank-free auto payment configured for goal {goal_id} - Method: {settings.payment_method}")
    
    return {
        "message": f"Bank-free auto payment configured for goal '{goal_item.title}'",
        "payment_method": settings.payment_method,
        "settings": settings
    }

@router.get("/{goal_id}/auto-payment/status")
def get_auto_payment_status(goal_id: str):
    """Get auto payment status and settings for a goal"""
    goal_item = goals.get(goal_id)
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return {
        "goal_id": goal_id,
        "goal_title": goal_item.title,
        "auto_payment_settings": goal_item.auto_payment_settings,
        "in_auto_payment_queue": goal_id in auto_payment_queue,
        "current_status": goal_item.status
    }



@router.get("/virtual-balances")
def get_virtual_balances():
    """Get all virtual payout balances"""
    return {
        "virtual_balances": virtual_balances,
        "total_balances": len(virtual_balances)
    }

