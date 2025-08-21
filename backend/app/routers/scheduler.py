import asyncio
from datetime import datetime, date, timedelta
import logging
from .ai_tools_clean import smart_reminder, SmartReminderRequest
from fastapi import BackgroundTasks
import json

from .ai_client import get_ai_client
from .mongo import goals_collection, pool_status_collection, pending_goals_collection, groups_collection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SCHEDULER_CONFIG = {
    "monitoring_interval": 1800,  # 30 mins
    "api_timeout": 30.0,
    "max_retries": 3,
    "api_base_url": "http://localhost:8000"
}

def parse_date(dt):
    if isinstance(dt, date):
        return dt
    if isinstance(dt, str):
        try:
            return datetime.fromisoformat(dt).date()
        except Exception:
            pass
    return None

async def monitor_goals():
    ai_client = get_ai_client()
    logger.info("🤖 Production AI Goal Monitoring System Started")
    retry_count = 0
    max_retries = SCHEDULER_CONFIG["max_retries"]

    while True:
        try:
            now = datetime.now()
            logger.info(f"🔍 Running production goal monitoring at {now.strftime('%Y-%m-%d %H:%M:%S')}")
            active_goals_cursor = goals_collection.find({
                "status": {"$in": ["active", "awaiting_payment"]},
                "goal_id": {"$exists": True}
            })
            active_goals = await active_goals_cursor.to_list(length=None)
            logger.info(f"Monitoring {len(active_goals)} active goals")

            batch_size = 5
            for i in range(0, len(active_goals), batch_size):
                batch = active_goals[i:i + batch_size]
                tasks = [
                    analyze_single_goal_production(
                        goal.get("goal_id"),
                        goal,
                        ai_client,
                        now
                    )
                    for goal in batch if goal.get("goal_id")
                ]
                await asyncio.gather(*tasks, return_exceptions=True)
                await asyncio.sleep(1)

            await perform_system_optimization(ai_client)
            await generate_monitoring_report()
            logger.info(f"✅ Monitoring cycle completed. Next check in {SCHEDULER_CONFIG['monitoring_interval']}s")
            retry_count = 0

        except Exception as e:
            retry_count += 1
            logger.error(f"❌ Monitoring failed (attempt {retry_count}/{max_retries}): {str(e)}")
            if retry_count >= max_retries:
                logger.critical("🚨 Max retries reached")
                retry_count = 0
            await asyncio.sleep(min(300, 30 * retry_count))

        await asyncio.sleep(SCHEDULER_CONFIG["monitoring_interval"])

async def analyze_single_goal_production(goal_id: str, goal: dict, ai_client, now: datetime):
    target_date = parse_date(goal.get("target_date"))
    if not target_date:
        logger.warning(f"Missing or invalid target_date for goal {goal_id}")
        return
    days_remaining = (target_date - now.date()).days

    try:
        status = await pool_status_collection.find_one({"goal_id": goal_id}) or {}
        current_amount = float(status.get("current_amount", 0) or 0)
        goal_amount = float(goal.get("goal_amount", 0) or 0)
        progress_percentage = (current_amount / goal_amount) * 100 if goal_amount > 0 else 0
        logger.info(f"📊 Goal Analysis: {goal.get('title','')[:30]}... | Progress: {progress_percentage:.1f}% | Days: {days_remaining}")
        risk_factors = await assess_goal_risk(goal_id, goal, status, days_remaining, progress_percentage)
        if risk_factors.get("risk_level", "LOW") != "LOW":
            await trigger_ai_monitoring_call(goal_id, risk_factors, ai_client)
        await handle_milestone_events(goal_id, progress_percentage, ai_client)

        # --- Agentic Deadline Reminder Logic (using assess_goal_risk) ---
        if "deadline_week_insufficient_progress" in risk_factors.get("factors", []):
            last_reminder = status.get("last_deadline_reminder", None)
            today_str = now.strftime('%Y-%m-%d')
            if last_reminder != today_str:
                reminder_request = SmartReminderRequest(
                    group_id=goal_id,
                    reminder_type="deadline_approaching",
                    urgency="high",
                    auto_send=True
                )
                try:
                    await smart_reminder(reminder_request, BackgroundTasks())
                    logger.info(f"Agentic deadline reminder sent for goal {goal_id}")
                    await pool_status_collection.update_one(
                        {"goal_id": goal_id},
                        {"$set": {"last_deadline_reminder": today_str}}
                    )
                except Exception as e:
                    logger.error(f"Deadline reminder error: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Error in production analysis for goal {goal_id}: {str(e)}")

async def assess_goal_risk(goal_id: str, goal, status: dict, days_remaining: int, progress_percentage: float):
    risk_factors = {
        "risk_level": "LOW",
        "factors": [],
        "urgency": "NORMAL",
        "requires_intervention": False
    }
    if days_remaining <= 1:
        risk_factors.update({"risk_level": "CRITICAL", "urgency": "IMMEDIATE", "requires_intervention": True})
        risk_factors["factors"].append("deadline_immediate")
    elif days_remaining <= 3 and progress_percentage < 70:
        risk_factors.update({"risk_level": "HIGH", "urgency": "HIGH", "requires_intervention": True})
        risk_factors["factors"].append("deadline_approaching_low_progress")
    elif days_remaining <= 7 and progress_percentage < 50:
        risk_factors.update({"risk_level": "MEDIUM", "urgency": "MEDIUM"})
        risk_factors["factors"].append("deadline_week_insufficient_progress")

    contributors = status.get("contributors", [])
    if len(contributors) == 0:
        risk_factors.update({"risk_level": "HIGH", "requires_intervention": True})
        risk_factors["factors"].append("no_contributions")
    else:
        recent_contributions = [
            c for c in contributors
            if (datetime.now() - datetime.fromisoformat(c.get("timestamp", datetime.now().isoformat()))).days <= 14
        ]
        if len(recent_contributions) == 0:
            if risk_factors["risk_level"] == "LOW":
                risk_factors["risk_level"] = "MEDIUM"
            risk_factors["factors"].append("no_recent_activity")
    return risk_factors

async def trigger_ai_monitoring_call(goal_id: str, risk_factors: dict, ai_client):
    if not ai_client:
        return
    try:
        # Direct function call or log only (no httpx)
        logger.info(f"🤖 AI monitoring completed for goal {goal_id} - Risk: {risk_factors.get('risk_level', 'UNKNOWN')} (direct call placeholder)")
        monitoring_entry = {
            "timestamp": datetime.now().isoformat(),
            "risk_assessment": risk_factors,
            "ai_monitoring_result": {},
            "triggered_by": "production_scheduler"
        }
        await pool_status_collection.update_one(
            {"goal_id": goal_id},
            {
                "$push": {"scheduler_monitoring": monitoring_entry},
                "$setOnInsert": {"goal_id": goal_id}
            },
            upsert=True
        )
    except Exception as e:
        logger.error(f"AI monitoring call failed for goal {goal_id}: {str(e)}")

async def handle_milestone_events(goal_id: str, progress_percentage: float, ai_client):
    milestones = [25, 50, 75, 90, 100]
    current_milestone = None
    for milestone in milestones:
        if progress_percentage >= milestone:
            current_milestone = milestone
    status = await pool_status_collection.find_one({"goal_id": goal_id}) or {}
    last_milestone = status.get("last_milestone_reached", 0)
    if current_milestone and current_milestone > last_milestone:
        logger.info(f"🎯 Milestone achieved for goal {goal_id}: {current_milestone}%")
        milestone_entry = {
            "milestone": current_milestone,
            "timestamp": datetime.now().isoformat(),
            "progress_percentage": progress_percentage
        }
        await pool_status_collection.update_one(
            {"goal_id": goal_id},
            {
                "$set": {"last_milestone_reached": current_milestone},
                "$push": {"milestone_history": milestone_entry},
                "$setOnInsert": {"goal_id": goal_id}
            },
            upsert=True
        )
        if current_milestone == 75:
            await trigger_optimization_call(goal_id, ai_client)
        elif current_milestone == 100:
            await trigger_completion_workflow(goal_id, ai_client)

async def trigger_optimization_call(goal_id: str, ai_client):
    # Direct function call or log only (no httpx)
    try:
        goal_item = await goals_collection.find_one({"goal_id": goal_id})
        if not goal_item:
            logger.warning(f"Goal {goal_id} not found for optimization trigger")
            return
        logger.info(f"🚀 Optimization analysis triggered for goal {goal_id} (direct call placeholder)")
    except Exception as e:
        logger.error(f"Optimization trigger failed for goal {goal_id}: {str(e)}")

async def trigger_completion_workflow(goal_id: str, ai_client):
    try:
        completion_request = SmartReminderRequest(
            group_id=goal_id,
            reminder_type="goal_completed",
            urgency="high",
            custom_message="Goal completed - processing fund transfer",
            auto_send=True
        )
        await smart_reminder(completion_request, BackgroundTasks())
        logger.info(f"💰 Completion workflow triggered for goal {goal_id} (direct call)")
    except Exception as e:
        logger.error(f"Completion workflow trigger failed for goal {goal_id}: {str(e)}")

async def perform_system_optimization(ai_client):
    try:
        total_goals_cursor = goals_collection.find({})
        total_goals = await total_goals_cursor.to_list(length=None)
        active_goals = [g for g in total_goals if g.get("status") == "active"]
        completed_goals = [g for g in total_goals if g.get("status") == "completed"]
        at_risk_goals = 0
        for goal in active_goals:
            goal_id = goal.get("goal_id")
            if not goal_id:
                continue
            status = await pool_status_collection.find_one({"goal_id": goal_id}) or {}
            current_amount = float(status.get("current_amount", 0) or 0)
            goal_amount = float(goal.get("goal_amount", 0) or 0)
            target_date = parse_date(goal.get("target_date"))
            if target_date and goal_amount > 0:
                progress = (current_amount / goal_amount) * 100
                days_remaining = (target_date - datetime.now().date()).days
                if days_remaining <= 7 and progress < 50:
                    at_risk_goals += 1
        total_goals_count = len(total_goals)
        active_goals_count = len(active_goals)
        completed_goals_count = len(completed_goals)
        logger.info(f"📈 System Stats - Total: {total_goals_count}, Active: {active_goals_count}, Completed: {completed_goals_count}, At Risk: {at_risk_goals}")
        if active_goals_count > 0 and at_risk_goals > (active_goals_count * 0.3):
            logger.warning(f"🚨 System alert: {at_risk_goals} goals at risk (>{30}% of active goals)")
    except Exception as e:
        logger.error(f"System optimization failed: {str(e)}")

async def generate_monitoring_report():
    try:
        total_goals_cursor = goals_collection.find({})
        total_goals = await total_goals_cursor.to_list(length=None)
        report = {
            "timestamp": datetime.now().isoformat(),
            "total_goals_monitored": len(total_goals),
            "ai_interventions_triggered": 0,
            "risk_assessments_performed": 0,
            "system_health": "HEALTHY"
        }
        pool_status_cursor = pool_status_collection.find({})
        pool_status_docs = await pool_status_cursor.to_list(length=None)
        for status_doc in pool_status_docs:
            monitoring_entries = status_doc.get("scheduler_monitoring", [])
            recent_entries = [
                entry for entry in monitoring_entries
                if (datetime.now() - datetime.fromisoformat(entry.get("timestamp", datetime.now().isoformat()))).seconds < SCHEDULER_CONFIG["monitoring_interval"]
            ]
            report["ai_interventions_triggered"] += len(recent_entries)
            report["risk_assessments_performed"] += len(recent_entries)
        logger.info(f"📋 Monitoring Report: {report['ai_interventions_triggered']} AI interventions, {report['risk_assessments_performed']} risk assessments")
    except Exception as e:
        logger.error(f"Monitoring report generation failed: {str(e)}")

def start_scheduler():
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    print("🚀 Starting AI Goal Monitoring Scheduler...")
    loop.create_task(monitor_goals())
    print("✅ Scheduler task created successfully!")

async def trigger_manual_goal_analysis(goal_id: str):
    ai_client = get_ai_client()
    goal = await goals_collection.find_one({"goal_id": goal_id})
    if goal:
        await analyze_single_goal_production(goal_id, goal, ai_client, datetime.now())
        return f"AI analysis triggered for goal {goal_id}"
    else:
        return f"Goal {goal_id} not found"

async def get_scheduler_status():
    """Get current scheduler status and statistics"""
    try:
        total_goals_cursor = goals_collection.find({})
        total_goals = await total_goals_cursor.to_list(length=None)
        
        active_goals = [g for g in total_goals if g.get("status") == "active"]
        awaiting_payment_goals = [g for g in total_goals if g.get("status") == "awaiting_payment"]
        
        return {
            "status": "running",
            "total_goals": len(total_goals),
            "active_goals": len(active_goals),
            "goals_awaiting_payment": len(awaiting_payment_goals),
            "last_check": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Failed to get scheduler status: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "last_check": datetime.now().isoformat()
        }