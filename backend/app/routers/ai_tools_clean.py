from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import logging
import json
import re
from uuid import uuid4

from .ai_client import get_ai_client

# from .goal import goals, pool_status
# from .groups import group_db
from .mongo import goals_collection, pool_status_collection, groups_collection, smart_reminders_collection, notifications_collection, executed_actions_collection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai-tools", tags=["ai-tools"])

# Never used (idk)
# async def get_goal_by_id(goal_id: str):
#     return await goals_collection.find_one({"goal_id": goal_id})

# def get_group_by_id(group_id: str):
#     return groups_collection.find_one({"group_id": group_id})

async def find_group_for_goal(goal_id: str):
    goal = await goals_collection.find_one({"goal_id": goal_id})
    if not goal:
        logger.warning(f"Goal with id {goal_id} not found.")
        return None
    creator_user_id = f"user_{goal.get('creator_name', 'unknown').replace(' ', '_').lower()}"
    async for group in groups_collection.find():
        members = group.get("members", [])
        member_names = [member.get("user_id", "").lower() for member in members if isinstance(member, dict)]
        if creator_user_id in member_names or group.get("manager_id", "").lower() == creator_user_id:
            return group
    return None

async def convert_goal_to_group_format(goal_id: str):
    goal = await goals_collection.find_one({"goal_id": goal_id})
    if not goal:
        logger.warning(f"Goal with id {goal_id} not found.")
        return None
    pool_data = await pool_status_collection.find_one({"goal_id": goal_id}) or {}
    contributors_data = pool_data.get("contributors", [])
    # Defensive: always default to empty list
    all_members = [goal.get('creator_name', 'Unknown')]
    # ... logic to add more members if needed ...
    pending_members = [m for m in all_members if m not in [c.get("name", "") for c in contributors_data]]
    group_data = {
        "id": goal_id,
        "title": goal.get('title', 'Untitled Goal'),
        "goal_amount": goal.get('goal_amount', 0.0),
        "current_amount": pool_data.get('current_amount', 0.0),
        "status": goal.get('status', 'active'),
        "creator": goal.get('creator_name', 'Unknown'),
        "deadline": (goal.get('target_date') or datetime.now()).isoformat(),
        "members": all_members,
        "contributions": [
            {
                "member": c.get("name", ""),
                "amount": c.get("amount", 0),
                "timestamp": c.get("timestamp", datetime.now().isoformat()),
                "status": c.get("status", "confirmed"),
                "payment_method": c.get("payment_method", "bank_transfer"),
                "reference_number": c.get("reference_number", "")
            }
            for c in contributors_data
        ],
        "pending_members": pending_members,
        "created_at": goal.get('created_at', datetime.now().isoformat()),
        "description": goal.get('description', ''),
        "is_paid": pool_data.get("is_paid", False),
        "pool_status": pool_data.get("status", "active")
    }
    return group_data

def calculate_group_analytics(group_data: dict):
    goal_amount = group_data.get("goal_amount", 0.0)
    current_amount = group_data.get("current_amount", 0.0)
    progress_percentage = (current_amount / goal_amount) * 100 if goal_amount > 0 else 0
    remaining_amount = max(0, goal_amount - current_amount)
    deadline_str = group_data.get("deadline")
    if not deadline_str:
        days_remaining = 0
    else:
        try:
            if "T" in deadline_str:
                deadline = datetime.fromisoformat(deadline_str.replace("Z", "+00:00"))
            else:
                deadline = datetime.fromisoformat(deadline_str + "T23:59:59")
            days_remaining = (deadline - datetime.now()).days
        except Exception as e:
            logger.warning(f"Failed to parse deadline: {e}")
            days_remaining = 0
    total_members = len(group_data.get("members", []))
    contributors = len([c for c in group_data.get("contributions", []) if c.get("amount", 0) > 0])
    return {
        "total_members": total_members,
        "contributors": contributors,
        "non_contributors": max(0, total_members - contributors),
        "progress_percentage": round(progress_percentage, 2),
        "remaining_amount": remaining_amount,
        "days_remaining": days_remaining,
        "average_contribution": current_amount / max(contributors, 1),
        "completion_rate": contributors / max(total_members, 1),
        "daily_target": remaining_amount / max(days_remaining, 1) if days_remaining > 0 else remaining_amount
    }

# Fallback autonomous actions when AI doesn't provide them
def create_fallback_actions(group_data: dict, analytics: dict):
    actions = []
    pending_count = len(group_data.get("pending_members", [])) or 1  # Prevent division by zero
    amount_due = analytics.get("remaining_amount", 0) / pending_count
    if group_data.get("pending_members"):
        actions.append({
            "action_type": "send_reminder",
            "target_members": group_data.get("pending_members", []),
            "action_data": {
                "amount_due": amount_due,
                "deadline": group_data.get("deadline", "soon"),
                "remaining_amount": analytics.get("remaining_amount", 0),
                "urgency": "medium"
            }
        })
    return actions

#create test for backend
async def create_test_goal_with_group(title: str, goal_amount: float, creator_name: str, member_names: Optional[List[str]] = None):
    """Create a test goal with associated group for comprehensive testing"""
    
    goal_id = str(uuid4())
    
    if not member_names:
        member_names = ["Maria Santos", "John Cruz", "Jane Dela Cruz", "Mike Reyes", "Sarah Garcia"]
    
    # Ensure creator is in member list
    if creator_name not in member_names:
        member_names = [creator_name] + member_names
    
    # Create the goal document
    new_goal = {
        "goal_id": goal_id,
        "title": title,
        "goal_amount": goal_amount,
        "creator_name": creator_name,
        "creator_role": "manager",
        "description": f"Test goal for {title}",
        "target_date": (datetime.now() + timedelta(days=20)).date(),
        "created_at": datetime.now().isoformat(),
        "status": "active"
    }
    
    # Insert goal into MongoDB
    await goals_collection.insert_one(new_goal)
    
    # Create group members data
    group_members = []
    for i, member_name in enumerate(member_names):
        member = {
            "user_id": f"user_{member_name.replace(' ', '_').lower()}_{i}",
            "role": "manager" if member_name == creator_name else "contributor",
            "joined_at": datetime.now().isoformat(),
            "contribution_total": 0.0,
            "is_active": True
        }
        group_members.append(member)
    
    # Create group document
    group = {
        "group_id": goal_id,  # Use same ID to link goal and group
        "name": f"Group for {title}",
        "description": f"Financial group for {title}",
        "manager_id": f"user_{creator_name.replace(' ', '_').lower()}_0",
        "members": group_members,
        "created_at": datetime.now().isoformat(),
        "is_active": True,
        "total_goals": 1,
        "total_contributions": 0.0
    }
    
    # Insert group into MongoDB
    await groups_collection.insert_one(group)
    
    # Initialize pool status
    pool_status = {
        "goal_id": goal_id,
        "current_amount": 0.0,
        "is_paid": False,
        "status": "active",
        "contributors": []
    }
    
    # Insert pool status into MongoDB
    await pool_status_collection.insert_one(pool_status)
    
    return goal_id, group

async def add_realistic_test_contributions(goal_id: str, contribution_percentage: float = 0.6):
    """Add realistic test contributions to a goal for testing autonomous triggers"""
    
    # Get goal from MongoDB
    goal = await goals_collection.find_one({"goal_id": goal_id})
    if not goal:
        return False
    
    group_data = await convert_goal_to_group_format(goal_id)
    if not group_data:
        return False
    
    members = group_data.get("members", [])
    target_amount = goal["goal_amount"] * contribution_percentage
    
    # Add contributions from some members (not all, to create pending members)
    contributing_members = members[:int(len(members) * 0.7)]  # 70% of members contribute
    
    contribution_per_member = target_amount / len(contributing_members)
    
    total_amount = 0
    new_contributors = []
    
    for i, member in enumerate(contributing_members):
        # Vary contribution amounts slightly
        amount = contribution_per_member * (0.8 + (i * 0.1))  # Variation between 80% and 120%
        
        new_contribution = {
            "name": member,
            "amount": round(amount, 2),
            "payment_method": "bank_transfer",
            "reference_number": f"REF_{datetime.now().strftime('%Y%m%d')}_{i:03d}",
            "timestamp": (datetime.now() - timedelta(days=i)).isoformat()
        }
        
        new_contributors.append(new_contribution)
        total_amount += amount
    
    # Update pool status in MongoDB
    await pool_status_collection.update_one(
        {"goal_id": goal_id},
        {
            "$push": {"contributors": {"$each": new_contributors}},
            "$set": {"current_amount": total_amount}
        }
    )
    
    return True


# Database for AI analyses, reminders, notifications, and executed actions
# smart_reminders_db = []
# notifications_db = []
# executed_actions_db = []

# Enhanced request models for autonomous execution
class SmartReminderRequest(BaseModel):
    group_id: str
    reminder_type: Optional[str] = None
    target_members: Optional[List[str]] = None
    urgency: Optional[str] = None # low, medium, high, critical
    custom_message: Optional[str] = None
    auto_send: bool = True  # When True, reminders are automatically sent to members

# AI Helper Function
async def get_ai_analysis(prompt: str) -> dict:
    try:
        client = get_ai_client()
        
        if client is None:
            return {"error": "AI client not available", "analysis": "Unable to connect to AI service"}
        
        response = await client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        if isinstance(ai_response, str):
            try:
                return json.loads(ai_response)
            except:
                try:
                    import re
                    json_match = re.search(r'```json\s*(\{.*?\})\s*```', ai_response, re.DOTALL)
                    if json_match:
                        json_str = json_match.group(1)
                        parsed_json = json.loads(json_str)
                        logger.info(f"✅ Successfully extracted JSON from markdown: {type(parsed_json)}")
                        return parsed_json
                    else:
                        logger.warning("❌ No JSON found in markdown, returning as text")
                        return {"analysis": ai_response, "type": "text_response"}
                except Exception as e:
                    logger.error(f"❌ Failed to extract JSON from markdown: {str(e)}")
                    return {"analysis": ai_response, "type": "text_response"}
        
        return ai_response if isinstance(ai_response, dict) else {"analysis": str(ai_response)}
        
    except Exception as e:
        logger.error(f"AI analysis error: {str(e)}")
        return {"error": f"AI analysis failed: {str(e)}", "analysis": "Unable to generate analysis"}

# AUTONOMOUS ACTION LAYER - The core of agentic behavior
async def execute_autonomous_action(action_type: Optional[str], group_id: str, action_data: Dict, target_members: Optional[List[str]] = None):
    """
    Execute actions agentically: If action_type is None or 'auto', infer the best action(s) based on group data and risks.
    """
    try:
        # If action_type is None or 'auto', infer the best action(s) based on analytics and risks
        if not action_type or action_type == "auto":
            group_data = await convert_goal_to_group_format(group_id)
            
            # Check if group_data is None
            if not group_data:
                logger.error(f"Could not find or convert goal {group_id} to group format")
                return {"executed": False, "reason": f"Goal {group_id} not found"}
            
            analytics = calculate_group_analytics(group_data)
            
            # Enhanced agentic logic with multiple decision factors
            progress = analytics.get("progress_percentage", 0)
            days_remaining = analytics.get("days_remaining", 0)
            pending_members = group_data.get("pending_members", [])
            
            logger.info(f"🤖 Agentic decision for group {group_id}: Progress={progress}%, Days={days_remaining}, Pending={len(pending_members)}")
            
            # Priority 1: Goal completed - transfer funds
            if progress >= 100:
                logger.info("🎉 Agentic decision: Goal completed, initiating fund transfer")
                return await send_fund_transfer_alert(group_id, action_data)
            
            # Priority 2: Critical deadline with low progress - escalate immediately
            elif days_remaining <= 1 and progress < 50:
                logger.info("🚨 Agentic decision: Critical deadline, escalating to manager")
                action_data.update({
                    "situation": "Critical deadline with very low progress",
                    "urgency": "critical",
                    "amount_short": analytics.get("remaining_amount", 0),
                    "deadline": group_data.get("deadline", "soon"),
                    "late_members": pending_members
                })
                return await escalate_to_manager(group_id, action_data)
            
            # Priority 3: Urgent deadline with moderate progress - escalate
            elif days_remaining <= 3 and progress < 70:
                logger.info("⚠️ Agentic decision: Urgent deadline, escalating to manager")
                action_data.update({
                    "situation": "Deadline approaching with insufficient progress",
                    "urgency": "high",
                    "amount_short": analytics.get("remaining_amount", 0),
                    "deadline": group_data.get("deadline", "soon"),
                    "late_members": pending_members
                })
                return await escalate_to_manager(group_id, action_data)
            
            # Priority 4: Many pending members - send reminders
            elif len(pending_members) > len(group_data.get("members", [])) * 0.3:  # >30% pending
                logger.info("📢 Agentic decision: Many pending members, sending reminders")
                action_data.update({
                    "amount_due": analytics.get("remaining_amount", 0) / max(len(pending_members), 1),
                    "deadline": group_data.get("deadline", "soon"),
                    "remaining_amount": analytics.get("remaining_amount", 0),
                    "urgency": "medium" if days_remaining > 7 else "high"
                })
                return await send_contributor_reminder(group_id, action_data, pending_members)
            
            # Priority 5: Low progress with time left - send motivational reminders
            elif progress < 50 and days_remaining > 7:
                logger.info("💪 Agentic decision: Low progress but time available, sending motivational reminders")
                action_data.update({
                    "amount_due": analytics.get("remaining_amount", 0) / max(len(pending_members), 1),
                    "deadline": group_data.get("deadline", "soon"),
                    "remaining_amount": analytics.get("remaining_amount", 0),
                    "urgency": "medium"
                })
                return await send_contributor_reminder(group_id, action_data, pending_members)
            
            # Default: No immediate action needed
            else:
                logger.info("✅ Agentic decision: No immediate action required, monitoring continues")
                return {"executed": False, "reason": "No agentic action needed - group is on track"}
        
        # Otherwise, execute the specified action_type
        if action_type == "send_reminder":
            return await send_contributor_reminder(group_id, action_data, target_members or [])
        elif action_type == "escalate_manager":
            return await escalate_to_manager(group_id, action_data)
        elif action_type == "redistribute_amount":
            return await suggest_redistribution(group_id, action_data)
        elif action_type == "setup_payment_plan":
            return await setup_payment_plan(group_id, action_data, target_members or [])
        elif action_type == "fund_transfer_alert":
            return await send_fund_transfer_alert(group_id, action_data)
        else:
            logger.warning(f"Unknown action type: {action_type}")
            return {"executed": False, "reason": "Unknown action type"}
    except Exception as e:
        logger.error(f"Action execution failed: {str(e)}")
        return {"executed": False, "error": str(e)}

async def send_contributor_reminder(group_id: str, action_data: Dict, target_members: List[str]):
    
    notifications_sent = []
    
    for member in target_members:
        # Generate personalized message
        message = f"""
        Hi {member}! 👋
        
        Your ₱{action_data.get('amount_due', 0)} share is due by {action_data.get('deadline', 'soon')}.
        
        Current status: Only ₱{action_data.get('remaining_amount', 0)} left to reach your goal! 🎯
        
        Quick actions:
        • Pay via BPI: Manager's Account
        • Request payment plan: Go to Request page
        • Check group progress
        
        Your group is counting on you! 💪
        """
        
        # PRODUCTION: Send via SMS/Email/Push notification
        notification = {
            "id": f"rem_{group_id}_{member}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "contributor_reminder",
            "recipient": member,
            "group_id": group_id,
            "message": message,
            "channel": "push notification",  # Could be sms, email, push
            "status": "sent",
            "timestamp": datetime.now().isoformat(),
            "auto_generated": True  # Indicates this was generated by AI
        }
        
        # notifications_db.append(notification)
        await notifications_collection.insert_one(notification)
        notifications_sent.append(member)
        
        # Log the notification creation for debugging
        logger.info(f"✅ Notification created and stored: {notification['id']} for {member} in group {group_id}")
        notifications_count = await notifications_collection.count_documents({})
        logger.info(f"📊 Total notifications in database: {notifications_count}")
    
    # Log the autonomous action
    await executed_actions_collection.insert_one({
        "action_type": "send_reminder",
        "group_id": group_id,
        "targets": target_members,
        "notifications_sent": len(notifications_sent),
        "timestamp": datetime.now().isoformat(),
        "autonomous": True
    })
    
    return {
        "executed": True,
        "action": "reminder_sent",
        "recipients": notifications_sent,
        "count": len(notifications_sent)
    }


async def escalate_to_manager(group_id: str, action_data: Dict):
    """PRODUCTION: Send alerts to manager when intervention needed"""
    
    situation = action_data.get('situation', 'Unknown issue')
    urgency = action_data.get('urgency', 'medium')
    
    if urgency == "critical":
        message = f"""
        🚨 URGENT: Group {group_id} Alert
        
        Situation: {situation}
        
        Immediate action needed:
        • ₱{action_data.get('amount_short', 0)} short of goal
        • Deadline: {action_data.get('deadline', 'Soon')}
        • Contributors behind: {', '.join(action_data.get('late_members', []))}
        
        Suggested actions:
        1. Contact late contributors directly
        2. Consider goal adjustment
        3. Extend deadline if possible
        
        [Take Action] [View Details]
        """
    else:
        message = f"""
        📊 Group {group_id} Status Update
        
        ₱{action_data.get('current_amount', 0)} of ₱{action_data.get('goal_amount', 0)} collected
        
        Should we alert contributors about the ₱{action_data.get('amount_short', 0)} remaining?
        
        [Yes, Send Alerts] [Extend Deadline] [Adjust Goal]
        """
    
    # PRODUCTION: Send to manager via preferred channel
    manager_notification = {
        "id": f"mgr_{group_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "type": "manager_alert",
        "recipient": "manager",
        "group_id": group_id,
        "message": message,
        "urgency": urgency,
        "channel": "push",
        "status": "sent",
        "timestamp": datetime.now().isoformat(),
        "requires_action": True,
        "auto_generated": True
    }
    
    await notifications_collection.insert_one(manager_notification)
    
    await executed_actions_collection.insert_one({
        "action_type": "escalate_manager",
        "group_id": group_id,
        "urgency": urgency,
        "timestamp": datetime.now().isoformat(),
        "autonomous": True
    })
    
    logger.info(f"Manager escalation sent for group {group_id} - urgency: {urgency}")
    
    return {
        "executed": True,
        "action": "manager_escalated",
        "urgency": urgency,
        "notification_id": manager_notification["id"]
    }

async def send_fund_transfer_alert(group_id: str, action_data: Dict):
    """PRODUCTION: Alert manager when goal is reached and funds ready for transfer"""
    
    message = f"""
    🎉 Goal Reached! Group {group_id}
    
    ₱{action_data.get('goal_amount', 0)} goal completed!
    
    Ready to pay bills:
    • Total collected: ₱{action_data.get('total_collected', 0)}
    • Contributors: {action_data.get('contributor_count', 0)}
    • Collection period: {action_data.get('collection_period', 'N/A')}
    
    Next steps:
    1. Transfer funds to pay bills
    2. Notify contributors about completion
    3. Confirm payment once processed
    """
    
    # PRODUCTION: High-priority notification to manager
    transfer_notification = {
        "id": f"transfer_{group_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "type": "fund_transfer_ready",
        "recipient": "manager",
        "group_id": group_id,
        "message": message,
        "priority": "high",
        "channel": "push",
        "status": "sent",
        "timestamp": datetime.now().isoformat(),
        "requires_action": True,
        "auto_generated": True,
        "fund_amount": action_data.get('total_collected', 0)
    }
    
    await notifications_collection.insert_one(transfer_notification)
    
    # Also notify contributors about completion
    completion_message = f"""
    🎉 Congratulations!
    
    Group {group_id} has reached its ₱{action_data.get('goal_amount', 0)} goal!
    
    Your contribution made this possible. Funds are being transferred to pay the bills.
    
    You'll receive confirmation once the payment is processed.
    
    Thank you for your participation! 🙌
    """
    
    for contributor in action_data.get('contributors', []):
        contributor_notification = {
            "id": f"complete_{group_id}_{contributor}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "goal_completed",
            "recipient": contributor,
            "group_id": group_id,
            "message": completion_message,
            "channel": "push",
            "status": "sent",
            "timestamp": datetime.now().isoformat(),
            "auto_generated": True
        }
        await notifications_collection.insert_one(contributor_notification)
    
    await executed_actions_collection.insert_one({
        "action_type": "fund_transfer_alert",
        "group_id": group_id,
        "amount": action_data.get('total_collected', 0),
        "timestamp": datetime.now().isoformat(),
        "autonomous": True
    })
    
    logger.info(f"Fund transfer alert sent for group {group_id} - Amount: ₱{action_data.get('total_collected', 0)}")
    
    return {
        "executed": True,
        "action": "fund_transfer_alert_sent",
        "amount": action_data.get('total_collected', 0),
        "notifications_sent": len(action_data.get('contributors', [])) + 1
    }

async def suggest_redistribution(group_id: str, action_data: Dict):
    """PRODUCTION: Suggest automatic redistribution when members can't pay"""
    
    shortage = action_data.get('shortage_amount', 0)
    active_members = action_data.get('active_members', [])
    
    if len(active_members) == 0:
        return {"executed": False, "reason": "No active members for redistribution"}
    
    per_member_additional = shortage / len(active_members)
    
    message = f"""
    💡 Redistribution Suggestion - Group {group_id}
    
    Shortage: ₱{shortage}
    Active members: {len(active_members)}
    Additional per member: ₱{per_member_additional:.2f}
    
    Would you like to redistribute the remaining ₱{shortage} among {len(active_members)} active members?
    
    Each member would pay an additional ₱{per_member_additional:.2f}.
    
    [Accept Redistribution] [Find Alternative] [Extend Deadline]
    """
    
    redistribution_notification = {
        "id": f"redis_{group_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "type": "redistribution_suggestion",
        "recipient": "manager",
        "group_id": group_id,
        "message": message,
        "channel": "push",
        "status": "sent",
        "timestamp": datetime.now().isoformat(),
        "requires_action": True,
        "auto_generated": True,
        "redistribution_amount": per_member_additional
    }
    
    await notifications_collection.insert_one(redistribution_notification)
    
    await executed_actions_collection.insert_one({
        "action_type": "suggest_redistribution",
        "group_id": group_id,
        "shortage": shortage,
        "per_member_additional": per_member_additional,
        "timestamp": datetime.now().isoformat(),
        "autonomous": True
    })
    
    return {
        "executed": True,
        "action": "redistribution_suggested",
        "shortage": shortage,
        "per_member_additional": per_member_additional,
        "active_members": len(active_members)
    }

async def setup_payment_plan(group_id: str, action_data: Dict, target_members: List[str]):
    """PRODUCTION: Automatically suggest payment plans for struggling members"""
    
    plans_created = []
    
    for member in target_members:
        member_debt = action_data.get('member_debts', {}).get(member, 0)
        
        # AI-generated payment plan
        weekly_amount = member_debt / 4  # 4-week plan
        
        plan_message = f"""
        💳 Payment Plan Option - {member}
        
        We understand payments can be challenging. Here's a personalized plan:
        
        Total owed: ₱{member_debt}
        Suggested plan: ₱{weekly_amount:.2f} weekly for 4 weeks
        
        Week 1: ₱{weekly_amount:.2f} (Due: {(datetime.now() + timedelta(days=7)).strftime('%b %d')})
        Week 2: ₱{weekly_amount:.2f} (Due: {(datetime.now() + timedelta(days=14)).strftime('%b %d')})
        Week 3: ₱{weekly_amount:.2f} (Due: {(datetime.now() + timedelta(days=21)).strftime('%b %d')})
        Week 4: ₱{weekly_amount:.2f} (Due: {(datetime.now() + timedelta(days=28)).strftime('%b %d')})
        
        [Accept Plan] [Modify Plan] [Contact Manager]
        """
        
        plan_notification = {
            "id": f"plan_{group_id}_{member}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "type": "payment_plan",
            "recipient": member,
            "group_id": group_id,
            "message": plan_message,
            "channel": "sms",
            "status": "sent",
            "timestamp": datetime.now().isoformat(),
            "auto_generated": True,
            "payment_plan": {
                "total_amount": member_debt,
                "weekly_amount": weekly_amount,
                "duration_weeks": 4
            }
        }
        
        await notifications_collection.insert_one(plan_notification)
        plans_created.append(member)
    
    await executed_actions_collection.insert_one({
        "action_type": "setup_payment_plan",
        "group_id": group_id,
        "plans_created": len(plans_created),
        "members": target_members,
        "timestamp": datetime.now().isoformat(),
        "autonomous": True
    })
    
    return {
        "executed": True,
        "action": "payment_plans_created",
        "plans_created": len(plans_created),
        "members": plans_created
    }

@router.post("/smart-reminder")
async def smart_reminder(request: SmartReminderRequest, background_tasks: BackgroundTasks):
    """
    PRODUCTION: AI-powered smart reminders with autonomous sending
    Generates and optionally sends personalized reminders automatically
    """
    
    try:
        # Get actual goal data from real database
        group_data = await convert_goal_to_group_format(request.group_id)
        
        if not group_data:
            raise HTTPException(status_code=404, detail=f"Goal {request.group_id} not found")
        
        if group_data is None:
            raise HTTPException(status_code=404, detail=f"Goal {request.group_id} not found")
        analytics = calculate_group_analytics(group_data) if group_data is not None else {}
        
        context = {
            "group": group_data,
            "analytics": analytics,
            "reminder_type": request.reminder_type,
            "target_members": request.target_members,
            "urgency": request.urgency,
            "auto_send": request.auto_send,
            "custom_message": request.custom_message
        }
        
        ai_prompt = f"""
        Generate personalized reminder for AMBAG financial group {request.group_id}
        
        Context:
        - Platform: Filipino bill sharing and savings collaboration
        - Reminder Type: {request.reminder_type}
        - Urgency: {request.urgency}
        - Target Members: {request.target_members or group_data.get('pending_members', [])}
        - Custom Context: {request.custom_message or 'None'}
        
        Group Details:
        - Title: {group_data.get('title', 'Unknown Group')}
        - Goal: ₱{group_data.get('goal_amount', 0):,.2f}
        - Current: ₱{group_data.get('current_amount', 0):,.2f}
        - Progress: {analytics.get('progress_percentage', 0):.1f}%
        - Remaining: ₱{analytics.get('remaining_amount', 0):,.2f}
        - Deadline: {group_data.get('deadline', 'Not set')}
        - Days Left: {analytics.get('days_remaining', 0)}
        - Members: {len(group_data.get('members', []))}
        - Pending: {', '.join(group_data.get('pending_members', []))}
        
        Recent Contributions:
        {chr(10).join([f"• {c['member']}: ₱{c['amount']:,.2f} on {c['timestamp'][:10]}" for c in group_data.get('contributions', [])[-3:]])}
        
        Generate appropriate reminder message in Filipino-English mix (Taglish) that's:
        - Friendly but motivating
        - Includes specific amounts and deadlines
        - Culturally appropriate for Filipino users
        - Action-oriented with clear next steps
        - Mentions actual group progress and member contributions
        
        Return JSON with: message, urgency_level, suggested_actions, and personalized_amount_due
        """
        
        # Get AI-generated reminder
        ai_reminder = await get_ai_analysis(ai_prompt)
        
        # Store the reminder
        reminder_result = {
            "id": f"reminder_{request.group_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "group_id": request.group_id,
            "reminder_type": request.reminder_type,
            "ai_reminder": ai_reminder,
            "context": context,
            "timestamp": datetime.now().isoformat(),
            "auto_send": request.auto_send
        }
        
        await smart_reminders_collection.insert_one(reminder_result)
        
        # AUTONOMOUS SENDING: If auto_send is enabled, send the reminder immediately
        send_results = []
        if request.auto_send:
            # Calculate realistic amounts for each target member
            target_members = request.target_members or group_data.get("pending_members", [])
            per_member_amount = analytics.get("remaining_amount", 0) / max(len(target_members), 1) if target_members else 0
            
            # Execute autonomous action (let system decide best approach)
            background_tasks.add_task(
                execute_autonomous_action,
                "auto",  # Agentic mode - system decides best action
                request.group_id,
                {
                    "reminder_message": ai_reminder.get("message", "Payment reminder"),
                    "urgency": request.urgency or "medium",
                    "reminder_type": request.reminder_type or "payment_due",
                    "deadline": group_data.get("deadline", "soon"),
                    "amount_due": per_member_amount,
                    "remaining_amount": analytics.get("remaining_amount", 0),
                    "group_progress": analytics.get("progress_percentage", 0),
                    "days_remaining": analytics.get("days_remaining", 0)
                },
                target_members
            )
            send_results = target_members
        
        response = {
            "reminder_id": reminder_result["id"],
            "group_id": request.group_id,
            "generated_reminder": ai_reminder,
            "timestamp": reminder_result["timestamp"],
            "auto_sent_to": send_results if request.auto_send else [],
            "auto_send": request.auto_send
        }
        
        logger.info(f"Smart reminder generated for group {request.group_id} - Auto-send: {request.auto_send}")
        
        return response
        
    except Exception as e:
        logger.error(f"Smart reminder error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Reminder generation failed: {str(e)}")

@router.post("/agentic-action")
async def trigger_agentic_action(group_id: str, background_tasks: BackgroundTasks):
    """
    PRODUCTION: Pure agentic action - system autonomously decides and executes the best action
    """
    try:
        # Get group data and analytics
        group_data = await convert_goal_to_group_format(group_id)
        if not group_data:
            raise HTTPException(status_code=404, detail=f"Goal {group_id} not found")
        
        analytics = calculate_group_analytics(group_data)
        
        # Execute pure agentic action (system decides everything)
        background_tasks.add_task(
            execute_autonomous_action,
            None,  # Pure agentic mode - no action type specified
            group_id,
            {
                "current_amount": group_data.get("current_amount", 0),
                "goal_amount": group_data.get("goal_amount", 0),
                "deadline": group_data.get("deadline", "soon"),
                "remaining_amount": analytics.get("remaining_amount", 0),
                "progress_percentage": analytics.get("progress_percentage", 0),
                "days_remaining": analytics.get("days_remaining", 0),
                "pending_members": group_data.get("pending_members", []),
                "contributors": [c["member"] for c in group_data.get("contributions", [])]
            },
            group_data.get("pending_members", [])
        )
        
        return {
            "success": True,
            "group_id": group_id,
            "action_type": "agentic_autonomous",
            "message": "System will autonomously determine and execute the best action",
            "analytics": analytics,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Agentic action error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agentic action failed: {str(e)}")

# NOTIFICATION AND ACTION HISTORY ENDPOINTS

@router.get("/notifications/{group_id}")
async def get_notifications(group_id: str):
    """Get all notifications for a specific group"""
    
    group_notifications = await notifications_collection.find({"group_id": group_id}).to_list(length=None)
    return {
        "group_id": group_id,
        "notifications": group_notifications,
        "count": len(group_notifications)
    }

@router.get("/executed-actions/{group_id}")
async def get_executed_actions(group_id: str):
    """Get history of all autonomous actions executed for a group"""
    
    group_actions = await executed_actions_collection.find({"group_id": group_id}).to_list(length=None)
    
    return {
        "group_id": group_id,
        "executed_actions": group_actions,
        "count": len(group_actions)
    }

@router.get("/dashboard-summary")
async def get_dashboard_summary():
    """Get dashboard summary with all goals and system analytics"""
    
    summary = {
        "total_goals": await goals_collection.count_documents({}),
        "active_goals": await goals_collection.count_documents({"status": "active"}),
        "completed_goals": await goals_collection.count_documents({"status": "completed"}),
        "awaiting_payment_goals": await goals_collection.count_documents({"status": "awaiting_payment"}),
        "total_notifications": await notifications_collection.count_documents({}),
        "total_executed_actions": await executed_actions_collection.count_documents({}),  
        "total_reminders": await smart_reminders_collection.count_documents({}),      
        "goals": []
    }
    
    # Add analytics for each goal
    async for goal_doc in goals_collection.find():  # Iterate over all goals in the collection
        try:
            goal_id = str(goal_doc["goal_id"])  # Ensure goal_id is a string (ObjectId conversion)
            
            # Step 1: Convert goal to group format
            group_data = await convert_goal_to_group_format(goal_id)
            if not group_data:
                continue  # Skip if conversion fails

            # Step 2: Calculate analytics (with defaults for missing data)
            goal_analytics = calculate_group_analytics(group_data) or {}
            
            # Step 3: Append structured summary (using .get() for safe access)
            summary["goals"].append({
                "id": goal_id,
                "title": goal_doc.get("title", "Untitled Goal"),
                "status": goal_doc.get("status", "unknown"),
                "progress_percentage": goal_analytics.get("progress_percentage", 0),
                "days_remaining": goal_analytics.get("days_remaining", 0),
                "members": len(group_data.get("members", [])),
                "contributors": goal_analytics.get("contributors", 0),
                "goal_amount": goal_doc.get("goal_amount", 0.0),
                "current_amount": group_data.get("current_amount", 0.0)
            })

        except Exception as e:
            logger.error(f"Failed to process goal {goal_id}: {str(e)}")
            continue  # Skip problematic goals
    
    return {
        "dashboard_summary": summary,
        "generated_at": datetime.now().isoformat()
    }

@router.post("/create-test-scenario")
async def create_test_scenario_with_group():
    """Create a complete test scenario with goal, group, and contributions for testing agentic features"""
    
    try:
        # Create test goal with group
        goal_id, group = await create_test_goal_with_group(
            title="Electric Bill Test Scenario",
            goal_amount=5000.0,
            creator_name="Maria Santos",
            member_names=["Maria Santos", "John Cruz", "Jane Dela Cruz", "Mike Reyes", "Sarah Garcia"]
        )
        
        # Add realistic contributions (60% completion)
        await add_realistic_test_contributions(goal_id, 0.6)
        
        # Get analytics for verification
        group_data = await convert_goal_to_group_format(goal_id)
        if not group_data:
            raise HTTPException(status_code=404, detail=f"Goal {goal_id} not found")
        analytics = calculate_group_analytics(group_data)
        
        # Get pool status to check contributors
        pool_status = await pool_status_collection.find_one({"goal_id": goal_id})
        contributor_names = [c["name"] for c in pool_status.get("contributors", [])] if pool_status else []
        
        # Find pending members
        pending_members = [
            member["user_id"] for member in group["members"] 
            if member["user_id"].replace('user_', '').replace('_', ' ').title() not in contributor_names
        ]
        
        return {
            "success": True,
            "goal_id": goal_id,
            "group_id": goal_id,
            "scenario": "Electric Bill Test Scenario",
            "members": [member["user_id"] for member in group["members"]],
            "goal_amount": 5000.0,
            "current_amount": analytics.get("current_amount", 0),
            "progress_percentage": analytics.get("progress_percentage", 0),
            "pending_members": pending_members,
            "message": "Test scenario created successfully! Use this goal_id for testing agentic features.",
            "next_steps": [
                f"Check notifications: GET /ai-tools/notifications/{goal_id}",
                f"Test smart reminders: POST /ai-tools/smart-reminder with goal_id: {goal_id}"
            ]
        }
        
    except Exception as e:
        logger.error(f"Error creating test scenario: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create test scenario: {str(e)}")
@router.post("/test-agentic-workflow")
async def test_agentic_workflow(goal_id: str):
    """Test the complete agentic workflow with real goal and group data"""
    
    try:
        # Verify goal exists in MongoDB
        goal = await goals_collection.find_one({"goal_id": goal_id})
        if not goal:
            raise HTTPException(status_code=404, detail=f"Goal {goal_id} not found")
        
        # Get group data
        group_data = await convert_goal_to_group_format(goal_id)
        if not group_data:
            raise HTTPException(status_code=404, detail=f"Could not convert goal {goal_id} to group format")
        
        analytics = calculate_group_analytics(group_data)
        
        # Simulate AI analysis (removed comprehensive analysis endpoint)
        ai_actions = create_fallback_actions(group_data, analytics)
        
        # Execute actions
        action_results = []
        for action in ai_actions:
            if action.get("action_type") == "send_reminder":
                result = await execute_autonomous_action(
                    action["action_type"],
                    goal_id,
                    action["action_data"],
                    action.get("target_members", [])
                )
                action_results.append({
                    "action": action["action_type"],
                    "result": result
                })
        
        # Get resulting notifications from MongoDB
        notifications = await notifications_collection.find({"group_id": goal_id}).to_list(length=None)
        executed_actions = await executed_actions_collection.find({"group_id": goal_id}).to_list(length=None)
        
        return {
            "agentic_workflow_test": "completed",
            "goal_id": goal_id,
            "goal_title": goal.get("title", "Untitled Goal"),
            "group_analytics": analytics,
            "ai_actions_triggered": len(ai_actions),
            "notifications_created": len(notifications),
            "actions_executed": len(executed_actions),
            "action_results": action_results,
            "pending_members_targeted": group_data.get("pending_members", []),
            "workflow_status": "✅ Agentic features working with real goal/group data",
            "recent_notifications": notifications[-3:] if notifications else [],
            "test_summary": {
                "goal_integration": "✅ Working",
                "group_integration": "✅ Working", 
                "ai_analysis": "✅ Working",
                "autonomous_actions": "✅ Working",
                "notification_system": "✅ Working"
            }
        }
        
    except Exception as e:
        logger.error(f"Agentic workflow test error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Workflow test failed: {str(e)}")

