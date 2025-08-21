from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator
from typing import Dict, List, Optional, Union
from datetime import datetime, date, timedelta
from .mongo import users_collection, goals_collection, pool_status_collection, pending_goals_collection, auto_payment_queue_collection, virtual_balances_collection, notifications_collection, request_collection
from .verify_token import verify_token
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

# virtual_balances = {}
# payment_instructions = {}
# auto_payment_queue = {}

logger = logging.getLogger(__name__)

async def notify_contributors_of_completion(goal_id: str, confirmation: dict):
    """Notify all contributors that goal is completed and paid"""

    # Fetch goal and contributors data
    goal_item = await goals_collection.find_one({"goal_id": goal_id})
    if not goal_item:
        logger.error(f"Goal not found for goal_id={goal_id}")
        raise HTTPException(status_code=404, detail="Goal not found")

    pool_data = await pool_status_collection.find_one({"goal_id": goal_id}) or {}
    contributors = pool_data.get("contributors", [])

    # Defensive: get fields with fallback
    title = goal_item.get("title", "Untitled Goal")
    current_amount = float(goal_item.get("current_amount", 0))
    payment_method = confirmation.get("payment_method", "unknown")
    completed_by = confirmation.get("confirmed_by", "system")
    completion_time = confirmation.get("completion_time", datetime.now().isoformat())

    notification = {
        "type": "goal_completed",
        "goal_title": title,
        "total_amount": current_amount,
        "payment_method": payment_method,
        "completed_by": completed_by,
        "completion_time": completion_time,
        "message": f"🎉 Goal '{title}' has been completed and paid!"
    }

    # Try to send notification to AI tools system
    try:
        ai_notification = {
            "id": f"completion_{goal_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "goal_completed_auto_payment",
            "recipient": "all_contributors",
            "group_id": goal_id,
            "message": (
                f"🎉 AUTO PAYMENT SUCCESS: '{title}' completed!\n\n"
                f"💰 Amount: ₱{current_amount:,.2f}\n"
                f"📅 Completed: {completion_time}\n"
                f"💳 Method: {payment_method}\n"
                f"✅ Payment processed automatically\n\n"
                f"Thank you to all {len(contributors)} contributors! 🙌"
            ),
            "channel": "push",
            "status": "sent",
            "timestamp": datetime.now().isoformat(),
            "auto_generated": True,
            "auto_payment": True,
            "goal_data": {
                "goal_id": goal_id,
                "title": title,
                "amount": current_amount,
                "contributors_count": len(contributors)
            }
        }
        await notifications_collection.insert_one(ai_notification)
        logger.info(f"✅ Auto payment success notification sent to AI tools system for goal {goal_id}")
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send auto payment notification to AI tools: {str(e)}")

    logger.info(f"📢 Notifying {len(contributors)} contributors of goal completion")

    return notification
async def notify_manager_of_request(request_id: str, request_data: Dict):
    """Notify manager when a new request is submitted"""
    try:
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
        
        await notifications_collection.insert_one(manager_notification)
        logger.info(f"📧 Manager notification sent for request {request_id}")
        
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send manager request notification: {str(e)}")

async def notify_member_of_request_response(request_id: str, response_data: Dict):
    """Notify member when manager responds to their request"""
    try:
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
        
        await notifications_collection.insert_one(member_notification)
        logger.info(f"💬 Member notification sent for request response {request_id}")
        
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send member response notification: {str(e)}")

async def notify_goal_approval_decision(goal_id: str, approval_data: Dict):
    """Notify goal creator when manager approves or rejects their goal"""
    try:
        pending_goal = await pending_goals_collection.find_one({"goal_id": goal_id})
        if not pending_goal:
            return
        
        
        # Create notification for goal creator
        approval_notification = {
            "id": f"goal_approval_{goal_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "goal_approval_decision",
            "recipient": pending_goal['creator_name'],
            "group_id": goal_id,
            "message": f"🎯 Goal {approval_data['action'].upper()}: {pending_goal['title']}\n\n" +
                      f"Goal: {pending_goal['title']}\n" +
                      f"Amount: ₱{pending_goal['goal_amount']:,.2f}\n" +
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
                "title": pending_goal['title'],
                "amount": pending_goal['goal_amount'],
                "decision": approval_data['action'],
                "manager": approval_data['manager_name']
            }
        }
        
        await notifications_collection.insert_one(approval_notification)
        logger.info(f"🎯 Goal approval notification sent for goal {goal_id}: {approval_data['action']}")
        
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send goal approval notification: {str(e)}")

async def notify_managers_of_pending_goal(goal_id: str, goal_data: Dict):
    """Notify managers when a new goal is submitted for approval"""
    try:
        # from .ai_tools_clean import notifications_db
        # from .users import users_db  # Import users to find managers
        
        # Find all managers
        managers = await users_collection.find({"role.role_type": "manager"}).to_list(length=None)
        
        for manager in managers:
            manager_notification = {
                "id": f"pending_goal_{goal_id}_{manager['firebase_uid']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "type": "pending_goal_approval",
                "recipient": manager['firebase_uid'],
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
            
            await notifications_collection.insert_one(manager_notification)
        
        logger.info(f"⏳ Pending goal notifications sent to {len(managers)} managers for goal {goal_id}")
        
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send pending goal notifications: {str(e)}")


router = APIRouter(
    prefix="/goal",
    tags=["goal"]
)

# goals: Dict[str, "goal"] = {}
# pool_status: Dict[str, Dict] = {}
# pending_goals: Dict[str, "pendingGoal"] = {}
# auto_payment_queue: Dict[str, Dict] = {}  # Store pending auto payments

# Goal Models
class goalCreate(BaseModel):
    title: str
    group_id: str
    goal_amount: float
    description: Optional[str] = None
    goal_type: str
    creator_role: str  # "manager" or "member"
    creator_name: str
    target_date: date
    auto_payment_settings: Optional[BankFreePaymentSettings] = None

class goal(BaseModel):
    goal_id: str
    group_id: str
    title: str
    description: Optional[str] = None
    goal_amount: float
    goal_type : str
    current_amount: float = 0.0
    creator_role: str
    creator_name: str
    target_date: Union[date, str]  # Accept both date and string
    is_paid: bool = False
    status: str = "active"  # active, completed, cancelled, awaiting_payment, awaiting_auto_payment, awaiting_payment_confirmation
    created_at: str
    approved_at: Optional[str] = None
    auto_payment_settings: Optional[BankFreePaymentSettings] = None

    @field_validator('target_date', mode='before')
    @classmethod
    def validate_target_date(cls, v):
        if isinstance(v, str):
            try:
                # Try to parse ISO format date string
                return datetime.fromisoformat(v).date()
            except:
                return v
        return v

class pendingGoal(BaseModel):
    goal_id: str
    group_id: str
    title: str
    description: Optional[str] = None
    goal_amount: float
    goal_type : str
    creator_role: str
    creator_name: str
    target_date: Union[date, str]  # Accept both date and string
    status: str = "pending"  # pending, approved, rejected
    created_at: str

    @field_validator('target_date', mode='before')
    @classmethod
    def validate_target_date(cls, v):
        if isinstance(v, str):
            try:
                # Try to parse ISO format date string
                return datetime.fromisoformat(v).date()
            except:
                return v
        return v
    
class goalApproval(BaseModel):
    action: Union[str, bool]  # "approve"/"reject" or True/False
    manager_name: str
    rejection_reason: Optional[str] = None 

    @field_validator('action', mode='before')
    @classmethod
    def validate_action(cls, v):
        if isinstance(v, bool):
            return "approve" if v else "reject"
        return v 

class pendingGoalResponse(BaseModel):
    message: str
    goal_id: str
    status: str
    pending_goal: pendingGoal 

async def process_bank_free_auto_payment(goal_id: str) -> dict:
    goal_item = await goals_collection.find_one({"goal_id": goal_id})
    if not goal_item:
        return {"error": "Goal not found"}

    settings = goal_item.get("auto_payment_settings", {})
    if not settings:
        return {"error": "Auto payment not configured for this goal"}

    pool_data = await pool_status_collection.find_one({"goal_id": goal_id}) or {}
    amount = float(pool_data.get("current_amount", 0))
    target = float(goal_item.get("goal_amount", 0))

    if amount < target:
        return {"error": "Goal not yet completed"}

    # Virtual balance auto-complete if threshold is set and met
    if settings.get("payment_method") == PaymentMethod.VIRTUAL_BALANCE:
        threshold = settings.get("auto_complete_threshold")
        if threshold and amount <= threshold:
            return await process_virtual_balance_payment(goal_id)

    # Require confirmation case
    if settings.get("require_confirmation", True):
        auto_payment_queue = {
            "goal_id": goal_id,
            "goal": goal_item,
            "amount": amount,
            "timestamp": datetime.now().isoformat(),
            "status": "awaiting_confirmation"
        }
        await auto_payment_queue_collection.insert_one(auto_payment_queue)
        await goals_collection.update_one(
            {"goal_id": goal_id},
            {"$set": {"status": "awaiting_auto_payment"}}
        )
        return {
            "message": "Awaiting manager confirmation",
            "requires_confirmation": True,
            "amount": amount
        }

    return {"error": "Auto payment configuration invalid"}


async def process_virtual_balance_payment(goal_id: str) -> Dict:
    """Process payment using virtual balance system"""

    # Fetch goal and pool data
    goal_item = await goals_collection.find_one({"goal_id": goal_id})
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")

    pool_data = await pool_status_collection.find_one({"goal_id": goal_id}) or {}
    amount = float(pool_data.get("current_amount", 0))

    # Defensive: check for required fields
    title = goal_item.get("title", "Untitled Goal")

    # Transfer to virtual payout balance
    payout_id = f"payout_{goal_id}"
    virtual_balances = {
        "payout_id": payout_id,
        "amount": amount,
        "goal_title": title,
        "status": "ready_for_external_payment",
        "created_at": datetime.now().isoformat()
    }
    await virtual_balances_collection.insert_one(virtual_balances)

    # Mark goal as completed immediately (virtual transfer)
    await goals_collection.update_one(
        {"goal_id": goal_id},
        {"$set": {"status": "completed", "is_paid": True}}
    )
    await pool_status_collection.update_one(
        {"goal_id": goal_id},
        {"$set": {"status": "completed", "is_paid": True}}
    )
    await auto_payment_queue_collection.delete_one({"goal_id": goal_id})

    # Send success notification to AI tools system
    try:
        contributors_doc = await pool_status_collection.find_one({"goal_id": goal_id}) or {}
        contributors = contributors_doc.get("contributors", [])
        ai_notification = {
            "id": f"auto_payment_success_{goal_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "auto_payment_success",
            "recipient": "all_contributors",
            "group_id": goal_id,
            "message": (
                f"🎉 AUTO PAYMENT SUCCESS: '{title}' completed!\n\n"
                f"💰 Amount: ₱{amount:,.2f}\n"
                f"📅 Completed: {datetime.now().isoformat()}\n"
                f"💳 Method: Virtual Balance\n"
                f"✅ Payment processed automatically\n\n"
                f"Thank you to all {len(contributors)} contributors! 🙌"
            ),
            "channel": "push",
            "status": "sent",
            "timestamp": datetime.now().isoformat(),
            "auto_generated": True,
            "auto_payment": True,
            "goal_data": {
                "goal_id": goal_id,
                "title": title,
                "amount": amount,
                "contributors_count": len(contributors),
                "payment_method": "virtual_balance"
            }
        }
        await notifications_collection.insert_one(ai_notification)
        logger.info(f"✅ Auto payment success notification sent to AI tools system for goal {goal_id}")
    except ImportError:
        logger.warning("AI tools notification system not available")
    except Exception as e:
        logger.error(f"Failed to send auto payment notification to AI tools: {str(e)}")

    logger.info(f"🏦 Virtual transfer completed for goal {goal_id} - ₱{amount}")

    return {
        "message": f"Virtual payment completed for '{title}'",
        "payout_balance_id": payout_id,
        "amount": amount,
        "status": "completed",
        "note": "Funds transferred to virtual payout balance"
    }

# title: str
#     goal_amount: float
#     description: Optional[str] = None
#     creator_role: str  # "manager" or "member"
#     creator_name: str 
#     target_date: date  
#     auto_payment_settings: Optional[BankFreePaymentSettings] = None

@router.post("/", response_model=goal)
async def create_goal(goal_data: goalCreate, user=Depends(verify_token)):
    import json
    try:
        logger.info(f"Received goal creation request body: {goal_data}")
        logger.info(f"Raw request body: {json.dumps(goal_data.model_dump(), default=str)}")
        logger.info(f"Creating goal: {goal_data.title} by {goal_data.creator_name} ({goal_data.creator_role})")
        if goal_data.creator_role not in ["manager", "member"]:
            raise HTTPException(status_code=400, detail="Invalid role. Must be 'manager' or 'member'.")
        goal_id = str(uuid.uuid4())
        current_time = datetime.now().isoformat()
        if goal_data.creator_role == "manager":
            logger.info(f"Creating goal directly (manager)")
            new_goal = goal(
                goal_id=goal_id,
                group_id = goal_data.group_id,
                title=goal_data.title,
                description=goal_data.description,
                goal_amount=goal_data.goal_amount,
                goal_type=goal_data.goal_type,
                creator_role=goal_data.creator_role,
                creator_name=goal_data.creator_name,
                target_date=goal_data.target_date,
                created_at=current_time,
                approved_at=current_time,
                auto_payment_settings=goal_data.auto_payment_settings
            )
            # Restore: copy all fields from goal_data to goal_dict, add creator_uid, ensure target_date
            goal_dict = goal_data.model_dump() if hasattr(goal_data, 'model_dump') else dict(goal_data)
            goal_dict['goal_id'] = goal_id
            goal_dict['created_at'] = current_time
            goal_dict['approved_at'] = current_time
            goal_dict['creator_uid'] = user.get('uid') if user else None
            if not goal_dict.get('target_date') and goal_dict.get('dueDate'):
                goal_dict['target_date'] = goal_dict['dueDate']
            if isinstance(goal_dict.get('target_date'), date):
                goal_dict['target_date'] = goal_dict['target_date'].isoformat()
            await goals_collection.insert_one(goal_dict)
            pool_status = {
                "goal_id": goal_id,
                "current_amount": 0.0,
                "is_paid": False,
                "status": "active",
                "contributors": []
            }
            await pool_status_collection.insert_one(pool_status)
            return new_goal
        else:
            logger.info(f"⏳ MEMBER REQUEST: Creating pending goal for approval")
            pending_goal_obj = pendingGoal(
                goal_id=goal_id,
                group_id=goal_data.group_id,
                title=goal_data.title,
                description=goal_data.description,
                goal_amount=goal_data.goal_amount,
                goal_type=goal_data.goal_type,
                creator_role=goal_data.creator_role,
                creator_name=goal_data.creator_name,
                target_date=goal_data.target_date,
                status="pending",
                created_at=current_time
            )
            await pending_goals_collection.insert_one(pending_goal_obj.model_dump())
            return pendingGoalResponse(
                message="Goal submitted for approval",
                goal_id=goal_id,
                status="pending",
                pending_goal=pending_goal_obj
            )
    except Exception as e:
        logger.error(f"Goal creation error: {e}")
        raise
        #     goal_id=goal_id,
        #     group_id=goal_data.group_id,
        #     title=goal_data.title,
        #     description=goal_data.description,
        #     goal_amount=goal_data.goal_amount,
        #     goal_type=goal_data.goal_type,
        #     creator_role=goal_data.creator_role,
        #     creator_name=goal_data.creator_name,
        #     target_date=goal_data.target_date,
        #     status="pending",
        #     created_at=current_time
        # )
        # await pending_goals_collection.insert_one(pending_goal_obj.model_dump())
        # return pendingGoalResponse(
        #     message="Goal submitted for approval",
        #     goal_id=goal_id,
        #     status="pending",
        #     pending_goal=pending_goal_obj
        # )

@router.get("/pending", response_model=List[pendingGoal])
async def get_pending_goals(user=Depends(verify_token)):
    logger.info(f"🎯 MANAGER REQUEST: Getting pending goals for manager")
    # Only managers should see pending goals
    user_uid = user.get('uid') if user else None
    user_doc = await users_collection.find_one({"firebase_uid": user_uid})
    user_role = user_doc.get("role", {}).get("role_type", "contributor") if user_doc else "contributor"
    
    logger.info(f"👤 User role: {user_role}, UID: {user_uid}")
    
    if user_role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view pending goals")
    
    # Only fetch goals with status "pending"
    logger.info(f"🔍 Searching for pending goals with status='pending'")
    user_group_id = user_doc.get('group_id') if user_doc else None

    if user_group_id:
        pendings = await pending_goals_collection.find({
            "status": "pending", 
            "group_id": user_group_id
        }).to_list(length=None)
    else:
        # If user has no group_id, return empty list or all pending goals
        pendings = []
    all_pendings = await pending_goals_collection.find().to_list(length=None)
    logger.info(f"📊 Found {len(pendings)} pending goals out of {len(all_pendings)} total goals in pending_goals collection")
    
    # Log the statuses of all pending goals for debugging
    logger.info(f"📋 ALL GOALS IN PENDING_GOALS COLLECTION:")
    for i, p in enumerate(all_pendings):
        logger.info(f"  {i+1}. Title: '{p.get('title', 'No title')}' | Status: '{p.get('status', 'No status')}' | ID: {p.get('goal_id', 'No ID')}")

    # Filter and validate pending goals, skip invalid ones and non-pending goals
    valid_pending_goals = []
    for pending in pendings:
        try:
            # Skip goals that are not pending
            if pending.get('status') != 'pending':
                logger.info(f"Skipping goal {pending.get('goal_id', 'unknown')} with status: {pending.get('status')}")
                continue
                
            # Remove MongoDB's _id field if present
            if '_id' in pending:
                del pending['_id']
            
            # Provide default values for missing required fields
            if 'goal_type' not in pending:
                pending['goal_type'] = 'Savings'  # Default goal type
            
            if 'description' not in pending:
                pending['description'] = ''
                
            if 'status' not in pending:
                pending['status'] = 'pending'
                
            if 'creator_role' not in pending:
                pending['creator_role'] = 'member'
                
            if 'creator_name' not in pending:
                pending['creator_name'] = 'Unknown User'
                
            # Create the pendingGoal object
            pending_goal_obj = pendingGoal(**pending)
            valid_pending_goals.append(pending_goal_obj)
        except Exception as e:
            logger.warning(f"Skipping invalid pending goal {pending.get('goal_id', 'unknown')}: {e}")
            continue

    return valid_pending_goals

@router.post("/pending/{goal_id}/approve")
async def approve_or_reject_goal(goal_id: str, approval: goalApproval, user=Depends(verify_token)):
    # Only managers can approve/reject goals
    user_uid = user.get('uid') if user else None
    user_doc = await users_collection.find_one({"firebase_uid": user_uid})
    user_role = user_doc.get("role", {}).get("role_type", "contributor") if user_doc else "contributor"
    
    if user_role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can approve/reject goals")
    
    if approval.action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
    
    pending_goal = await pending_goals_collection.find_one({"goal_id": goal_id})
    logger.info(f"Looking for pending goal with ID: {goal_id}")
    
    if not pending_goal:
        logger.warning(f"No pending goal found with ID: {goal_id}")
        raise HTTPException(status_code=404, detail="Pending goal not found")
    
    logger.info(f"Found pending goal: {pending_goal.get('title', 'No title')} with status: {pending_goal.get('status', 'No status')}")
    
    if pending_goal.get("status") != "pending":
        logger.warning(f"Goal {goal_id} has status '{pending_goal.get('status')}', expected 'pending'")
        raise HTTPException(status_code=404, detail="Goal already processed")

    current_time = datetime.now().isoformat()
    logger.info(f"Processing {approval.action} action for goal {goal_id}")
    try:
        if approval.action == "approve":
            # Ensure we have all required fields with defaults if missing
            goal_data = {
                "goal_id": pending_goal.get("goal_id") or pending_goal.get("id") or str(uuid.uuid4()),
                "group_id": pending_goal.get("group_id") or str(uuid.uuid4()),
                "title": pending_goal.get("title") or "Untitled Goal",
                "description": pending_goal.get("description") or "",
                "goal_amount": pending_goal.get("goal_amount") or 0.0,
                "goal_type": pending_goal.get("goal_type") or "Savings",  # Default goal type
                "creator_role": pending_goal.get("creator_role") or "member",
                "creator_name": pending_goal.get("creator_name") or "Unknown User",
                "target_date": pending_goal.get("target_date"),
                "created_at": pending_goal.get("created_at") or current_time,
                "approved_at": current_time
            }
            
            new_goal = goal(**goal_data)
            
            # Convert the model to dict and handle date serialization
            goal_dict = new_goal.model_dump()
            
            # Handle date serialization for MongoDB
            if 'target_date' in goal_dict and goal_dict['target_date'] is not None:
                if isinstance(goal_dict['target_date'], date):
                    goal_dict['target_date'] = goal_dict['target_date'].isoformat()
            
            # Add creator UID for filtering
            goal_dict['creator_uid'] = pending_goal.get('creator_uid')
            
            await goals_collection.insert_one(goal_dict)
            
            pool_status = {
                "goal_id": goal_id,
                "current_amount": 0.0, 
                "is_paid": False, 
                "status": "active",
                "contributors": []
            }
            
            await pool_status_collection.insert_one(pool_status)
            await pending_goals_collection.update_one(
                {
                    "goal_id": goal_id
                }, 
                {
                    "$set": {
                        "status": "approved"
                    }
                }
            )
            
            # Send approval notification
            await notify_goal_approval_decision(goal_id, {
                "action": approval.action,
                "manager_name": approval.manager_name,
                "rejection_reason": approval.rejection_reason
            })
            
            return {
                "message": f"Goal '{pending_goal.get('title', 'Untitled Goal')}' approved by {approval.manager_name}",
                "goal": new_goal,
                "approved_at": current_time
            }
        
        elif approval.action == "reject":
            await pending_goals_collection.update_one(
                {
                    "goal_id": goal_id
                }, 
                {
                    "$set": {
                        "status": "rejected"
                    }
                }
            )
            
            # Send rejection notification
            await notify_goal_approval_decision(goal_id, {
                "action": approval.action,
                "manager_name": approval.manager_name,
                "rejection_reason": approval.rejection_reason
            })
            
            return {
                "message": f"Goal '{pending_goal.get('title', 'Untitled Goal')}' rejected by {approval.manager_name}",
                "reason": approval.rejection_reason or "No reason provided",
                "rejected_at": current_time
            }
            
    except Exception as e:
        print(f"Error in approve_or_reject_goal: {str(e)}")
        print(f"Goal ID: {goal_id}")
        print(f"Approval data: {approval}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/test-no-auth")
async def test_goals_no_auth():
    """Test endpoint to check if database connection works"""
    try:
        count = await goals_collection.count_documents({})
        return {"message": "Database connection working", "goal_count": count}
    except Exception as e:
        return {"error": str(e)}

@router.get("/test-goals-no-auth")
async def test_get_goals_no_auth():
    """Test endpoint to get goals without authentication for debugging"""
    try:
        goals = await goals_collection.find().limit(1).to_list(length=1)
        # Return raw data without Pydantic validation
        for goal_data in goals:
            goal_data['_id'] = str(goal_data['_id'])  # Convert ObjectId to string
        return {"goals": goals, "count": len(goals)}
    except Exception as e:
        logger.error(f"Error in test endpoint: {str(e)}")
        return {"error": str(e)}

@router.get("/public", response_model=List[goal])
async def get_all_goals_public():
    """Temporary public endpoint for testing"""
    try:
        goals = await goals_collection.find().to_list(length=None)
        # Convert ObjectId to string and ensure proper data format
        validated_goals = []
        for goal_data in goals:
            try:
                # Remove MongoDB ObjectId
                if '_id' in goal_data:
                    del goal_data['_id']
                # Fix missing goal_type field
                if 'goal_type' not in goal_data or goal_data['goal_type'] is None:
                    goal_data['goal_type'] = 'Savings'  # Default value
                # Fix target_date format - convert datetime to date string
                if 'target_date' in goal_data:
                    if hasattr(goal_data['target_date'], 'date'):
                        goal_data['target_date'] = goal_data['target_date'].date().isoformat()
                    elif hasattr(goal_data['target_date'], 'isoformat'):
                        goal_data['target_date'] = goal_data['target_date'].isoformat()
                # Validate and create goal object
                goal_obj = goal(**goal_data)
                validated_goals.append(goal_obj)
            except Exception:
                # Silently skip invalid goal data
                continue
        
        return validated_goals
    except Exception as e:
        logger.error(f"Error fetching goals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch goals: {str(e)}")

@router.get("/", response_model=List[goal])
async def get_all_goals(user=Depends(verify_token)):
    try:
        user_uid = user.get('uid') if user else None
        user_doc = await users_collection.find_one({"firebase_uid": user_uid})
        user_role = user_doc.get("role", {}).get("role_type", "contributor") if user_doc else "contributor"

        user_group_id = user_doc.get("role", {}).get("group_id") if user_doc and user_doc.get("role") else None
        goals = await goals_collection.find({"group_id" : user_group_id}).to_list(length=None)
        logger.info(f"User {user_uid} ({user_role}): Found {len(goals)} total goals")

        validated_goals = []
        for goal_data in goals:
            try:
                if '_id' in goal_data:
                    del goal_data['_id']
                if 'goal_type' not in goal_data or goal_data['goal_type'] is None:
                    goal_data['goal_type'] = 'Savings'
                if 'target_date' in goal_data:
                    if hasattr(goal_data['target_date'], 'date'):
                        goal_data['target_date'] = goal_data['target_date'].date().isoformat()
                    elif hasattr(goal_data['target_date'], 'isoformat'):
                        goal_data['target_date'] = goal_data['target_date'].isoformat()
                # Fetch current amount from pool_status_collection
                pool = await pool_status_collection.find_one({"goal_id": goal_data["goal_id"]})
                if pool and "current_amount" in pool:
                    goal_data["current_amount"] = pool["current_amount"]
                else:
                    goal_data["current_amount"] = 0.0
                
                goal_obj = goal(**goal_data)
                validated_goals.append(goal_obj)
            except Exception:
                continue

        return validated_goals
    except Exception as e:
        logger.error(f"Error fetching goals: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch goals: {str(e)}")

@router.get("/{goal_id}", response_model=goal)
async def get_goal(goal_id: str, user=Depends(verify_token)):
    goal_data = await goals_collection.find_one({"goal_id": goal_id})
    if not goal_data:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return goal(**goal_data)

class contributionData(BaseModel):
    amount: float
    contributor_name: str
    payment_method: Optional[str] = "virtual_balance"
    reference_number: Optional[str] = None

@router.post("/{goal_id}/contribute")
async def contribute_to_goal(goal_id: str, contribution: contributionData, user=Depends(verify_token)):

    pool = await pool_status_collection.find_one({"goal_id": goal_id})
    goal_item = None
    if not pool:
        # Try to find the goal in goals_collection
        goal_item = await goals_collection.find_one({"goal_id": goal_id})
        if not goal_item:
            raise HTTPException(status_code=404, detail="Goal not found")
        # Auto-create pool status entry for this goal
        pool_doc = {
            "goal_id": goal_id,
            "current_amount": 0.0,
            "is_paid": False,
            "status": goal_item.get("status", "active"),
            "contributors": []
        }
        await pool_status_collection.insert_one(pool_doc)
        pool = pool_doc
    if goal_item is None:
        goal_item = await goals_collection.find_one({"goal_id": goal_id})

    amount = float(contribution.amount)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")


    # Update contribution in pool_status_collection
    await pool_status_collection.update_one(
        {"goal_id": goal_id},
        {
            "$inc": {"current_amount": amount},
            "$push": {
                "contributors": {
                    "name": contribution.contributor_name,
                    "amount": amount,
                        "payment_method": contribution.payment_method or "virtual_balance",
                    "reference_number": contribution.reference_number or "",
                    "timestamp": datetime.now().isoformat()
                }
            }
        }
    )

    # Update current_amount in goals_collection as well
    await goals_collection.update_one(
        {"goal_id": goal_id},
        {"$inc": {"current_amount": amount}}
    )


    # Always resolve owner_uid from user or contributor_name
    owner_uid = None
    if user and isinstance(user, dict):
        owner_uid = user.get("uid") or user.get("firebase_uid")
    if not owner_uid:
        owner_uid = contribution.contributor_name

    # Insert a negative 'contribution' record for deduction
    # First, check if user has enough available balance
    total_balance = await virtual_balances_collection.aggregate([
        {"$match": {"owner_uid": owner_uid, "status": {"$ne": "used"}}},
        {"$group": {"_id": None, "sum": {"$sum": "$amount"}}}
    ]).to_list(length=1)
    available = total_balance[0]["sum"] if total_balance else 0
    if available < amount:
        raise HTTPException(status_code=400, detail="Not enough virtual balance to contribute.")

    vb_doc = {
        "owner_uid": owner_uid,
        "amount": -abs(amount),
        "goal_title": goal_item.get("title", "Goal Contribution") if goal_item else "Goal Contribution",
        "type": "contribution",
        "status": "ready_for_external_payment",
        "created_at": datetime.now().isoformat()
    }
    await virtual_balances_collection.insert_one(vb_doc)

    # Prepare response as before
    updated_pool = await pool_status_collection.find_one({"goal_id": goal_id}) or {}
    goal_item = await goals_collection.find_one({"goal_id": goal_id}) or {}
    current = float(updated_pool.get("current_amount", 0))
    target = float(goal_item.get("goal_amount", 1))  # Avoid division by zero
    progress = min(100, (current / target) * 100) if target > 0 else 0
    response = {
        "message": f"₱{amount:,.2f} contributed",
        "remaining": max(0, target - current),
        "progress": progress
    }

    # Handle goal completion
    if current >= target:
        auto_payment_settings = {}
        if goal_item and isinstance(goal_item, dict):
            aps = goal_item.get("auto_payment_settings", {})
            if aps is None:
                aps = {}
            auto_payment_settings = aps
        if isinstance(auto_payment_settings, dict) and auto_payment_settings.get("enabled"):
            response["auto_payment"] = await process_bank_free_auto_payment(goal_id)
        else:
            await goals_collection.update_one(
                {"goal_id": goal_id},
                {"$set": {"status": "awaiting_payment"}}
            )
            response["status"] = "awaiting_payment"

    return response

@router.get("/{goal_id}/contributors")
async def get_goal_contributors(goal_id: str, user=Depends(verify_token)):
    pool = await pool_status_collection.find_one({"goal_id": goal_id})
    if not pool:
        raise HTTPException(status_code=404, detail="Goal not found")

    return {
        "goal_id": goal_id,
        "contributors": pool.get("contributors", []),
        "total_contributors": len(pool.get("contributors", [])),
        "total_amount": pool.get("current_amount", 0.0)
    }

@router.put("/{goal_id}/status")
async def update_goal_status(goal_id: str, status: str, user=Depends(verify_token)):
    if status not in ["active", "completed", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    goal_item = await goals_collection.find_one({"goal_id": goal_id})
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Update status in both collections
    await goals_collection.update_one({"goal_id": goal_id}, {"$set": {"status": status}})
    await pool_status_collection.update_one({"goal_id": goal_id}, {"$set": {"status": status}})

    return {"message": f"Goal '{goal_item['title']}' status updated to {status}"}

@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, user=Depends(verify_token)):
    goal_item = await goals_collection.find_one({"goal_id": goal_id})
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Delete from both collections
    await goals_collection.delete_one({"goal_id": goal_id})
    await pool_status_collection.delete_one({"goal_id": goal_id})

    return {"message": f"Goal '{goal_item['title']}' deleted successfully"}

#add ai to ping manager for payment
@router.post("/{goal_id}/payout")
async def payout_goal(goal_id: str, manager_approval: bool, user=Depends(verify_token)):
    # Find goal in MongoDB instead of in-memory
    goal_item = await goals_collection.find_one({"goal_id": goal_id})
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")

    if goal_item["status"] != "awaiting_payment":
        raise HTTPException(status_code=400, detail="Goal is not awaiting payment.")

    if manager_approval:
        # Update goals collection
        await goals_collection.update_one(
            {"goal_id": goal_id},
            {"$set": {"status": "completed", "is_paid": True}}
        )

        # Update pool_status_collection
        await pool_status_collection.update_one(
            {"goal_id": goal_id},
            {"$set": {"status": "completed", "is_paid": True}}
        )

        return {"message": f"Goal '{goal_item['title']}' has been paid out."}
    else:
        # Update goals collection
        await goals_collection.update_one(
            {"goal_id": goal_id},
            {"$set": {"status": "active"}}
        )

        # Update pool_status_collection
        await pool_status_collection.update_one(
            {"goal_id": goal_id},
            {"$set": {"status": "active"}}
        )

        return {"message": f"Payment for goal '{goal_item['title']}' has been rejected by the manager."}

# Bank-Free Auto Payment Management Endpoints

@router.get("/auto-payment/queue")
async def get_auto_payment_queue(user=Depends(verify_token)):
    """Get all goals awaiting auto payment confirmation"""
    pending_auto_payments = await auto_payment_queue_collection.find({}, {"_id": 0}).to_list(length=None)
    # ^ {} means no filter, {"_id": 0} hides Mongo's internal ID

    return {
        "pending_auto_payments": pending_auto_payments,
        "total_pending": len(pending_auto_payments)
    }

@router.post("/{goal_id}/auto-payment/confirm")
async def confirm_auto_payment(goal_id: str, confirmation: AutoPaymentConfirmation, user=Depends(verify_token)):
    """Manager confirms or rejects auto payment"""
    auto_payment_queue = await auto_payment_queue_collection.find_one({"goal_id": goal_id})
    if not auto_payment_queue:
        raise HTTPException(status_code=404, detail="Goal not found in auto payment queue")
    
    if confirmation.goal_id != goal_id:
        raise HTTPException(status_code=400, detail="Goal ID mismatch")
    
    goal_item = await goals_collection.find_one({"goal_id": goal_id})
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
        await goals_collection.update_one({"goal_id": goal_id}, {"$set": {"status": "awaiting_payment"}})
        await pool_status_collection.update_one({"goal_id": goal_id}, {"$set": {"status": "awaiting_payment"}})
        
        # Remove from queue
        await auto_payment_queue_collection.delete_one({"goal_id": goal_id})
        
        return {
            "message": f"Auto payment rejected by {confirmation.manager_name} - reverted to manual payment",
            "rejection_reason": confirmation.confirmation_reason or "No reason provided"
        }

@router.post("/{goal_id}/auto-payment/setup")
async def setup_bank_free_auto_payment(goal_id: str, settings: BankFreePaymentSettings, user=Depends(verify_token)):
    """Setup bank-free auto payment for a goal"""
    goal_item = await goals_collection.find_one({"goal_id": goal_id})
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal_item["auto_payment_settings"] = settings
    
    logger.info(f"🤖 Bank-free auto payment configured for goal {goal_id} - Method: {settings.payment_method}")
    
    return {
        "message": f"Bank-free auto payment configured for goal '{goal_item['title']}'",
        "payment_method": settings.payment_method,
        "settings": settings
    }

@router.get("/{goal_id}/auto-payment/status")
async def get_auto_payment_status(goal_id: str, user=Depends(verify_token)):
    """Get auto payment status and settings for a goal"""
    goal_item = await goals_collection.find_one({"goal_id": goal_id})
    if not goal_item:
        raise HTTPException(status_code=404, detail="Goal not found")
    auto_payment_queue = await auto_payment_queue_collection.find_one({"goal_id": goal_id})

    return {
        "goal_id": goal_id,
        "goal_title": goal_item.title,
        "auto_payment_settings": goal_item.auto_payment_settings,
        "in_auto_payment_queue": bool(auto_payment_queue),
        "current_status": goal_item.status
    }



@router.get("/virtual-balances")
async def get_virtual_balances():
    """Get all virtual payout balances"""
    virtual_balances = await virtual_balances_collection.find().to_list(length=None)
    return {
        "virtual_balances": virtual_balances,
        "total_balances": len(virtual_balances) # UHHHHHHHHHHHH im not sure what to do with this yet
    }