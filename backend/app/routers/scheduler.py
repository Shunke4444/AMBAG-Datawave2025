import asyncio
from datetime import datetime, timedelta
from .goal import goals, pool_status, pending_goals  # Fixed relative import
from .groups import group_db
from .ai_client import get_ai_client
import json
import logging
import httpx

# Production logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Production configuration
SCHEDULER_CONFIG = {
    "monitoring_interval": 1800,  # 3 mins in production
    "api_timeout": 30.0,
    "max_retries": 3,
    "api_base_url": "http://localhost:8000" 
}



async def monitor_goals():
    """Production AI-powered goal monitoring with comprehensive analysis"""
    ai_client = get_ai_client()
    logger.info("🤖 Production AI Goal Monitoring System Started")
    
    retry_count = 0
    max_retries = SCHEDULER_CONFIG["max_retries"]
    
    while True:
        try:
            now = datetime.now()
            logger.info(f"🔍 Running production goal monitoring at {now.strftime('%Y-%m-%d %H:%M:%S')}")
            
            active_goals = [goal for goal in goals.values() if goal.status in ["active", "awaiting_payment"]]
            logger.info(f"Monitoring {len(active_goals)} active goals")
            
            # Production: Process goals in batches to avoid overwhelming the system
            batch_size = 5
            for i in range(0, len(list(goals.items())), batch_size):
                batch = list(goals.items())[i:i + batch_size]
                
                # Process batch concurrently
                tasks = [
                    analyze_single_goal_production(goal_id, goal, ai_client, now)
                    for goal_id, goal in batch
                ]
                
                await asyncio.gather(*tasks, return_exceptions=True)
                
                # Small delay between batches
                await asyncio.sleep(1)
            
            # Production: System-wide optimization analysis
            await perform_system_optimization(ai_client)
            
            # Production: Generate monitoring report
            await generate_monitoring_report()
            
            logger.info(f"✅ Production goal monitoring cycle completed. Next check in {SCHEDULER_CONFIG['monitoring_interval']} seconds")
            retry_count = 0  # Reset retry count on successful cycle
            
        except Exception as e:
            retry_count += 1
            logger.error(f"❌ Production monitoring cycle failed (attempt {retry_count}/{max_retries}): {str(e)}")
            
            if retry_count >= max_retries:
                logger.critical("🚨 Maximum retry attempts reached. Scheduler will continue but with reduced functionality.")
                retry_count = 0
            
            # Exponential backoff for retries
            await asyncio.sleep(min(300, 30 * retry_count))
        
        await asyncio.sleep(SCHEDULER_CONFIG["monitoring_interval"])

async def analyze_single_goal_production(goal_id: str, goal, ai_client, now: datetime):
    """Production analysis for individual goals with comprehensive AI integration"""
    try:
        status = pool_status.get(goal_id, {})
        current_amount = status.get("current_amount", 0)
        contributors = status.get("contributors", [])
        
        # Calculate production metrics
        days_remaining = (goal.target_date - now.date()).days
        progress_percentage = (current_amount / goal.goal_amount) * 100 if goal.goal_amount > 0 else 0
        
        logger.info(f"📊 Goal Analysis: {goal.title[:30]}... | Progress: {progress_percentage:.1f}% | Days: {days_remaining}")
        
        # Production: Risk-based AI analysis triggers
        risk_factors = await assess_goal_risk(goal_id, goal, status, days_remaining, progress_percentage)
        
        if risk_factors["risk_level"] != "LOW":
            await trigger_ai_monitoring_call(goal_id, risk_factors, ai_client)
        
        # Production: Proactive milestone management
        await handle_milestone_events(goal_id, goal, status, progress_percentage, ai_client)
        
    except Exception as e:
        logger.error(f"❌ Error in production analysis for goal {goal_id}: {str(e)}")

async def assess_goal_risk(goal_id: str, goal, status: dict, days_remaining: int, progress_percentage: float):
    """Production risk assessment algorithm"""
    risk_factors = {
        "risk_level": "LOW",
        "factors": [],
        "urgency": "NORMAL",
        "requires_intervention": False
    }
    
    # Timeline risk assessment
    if days_remaining <= 1:
        risk_factors["risk_level"] = "CRITICAL"
        risk_factors["urgency"] = "IMMEDIATE"
        risk_factors["factors"].append("deadline_immediate")
        risk_factors["requires_intervention"] = True
    elif days_remaining <= 3 and progress_percentage < 70:
        risk_factors["risk_level"] = "HIGH"
        risk_factors["urgency"] = "HIGH"
        risk_factors["factors"].append("deadline_approaching_low_progress")
        risk_factors["requires_intervention"]  = True
    elif days_remaining <= 7 and progress_percentage < 50:
        risk_factors["risk_level"] = "MEDIUM"
        risk_factors["urgency"] = "MEDIUM"
        risk_factors["factors"].append("deadline_week_insufficient_progress")
    
    # Activity risk assessment
    contributors = status.get("contributors", [])
    if len(contributors) == 0:
        risk_factors["risk_level"] = "HIGH"
        risk_factors["factors"].append("no_contributions")
        risk_factors["requires_intervention"] = True
    else:
        # Check for recent activity
        recent_contributions = [
            c for c in contributors 
            if (datetime.now() - datetime.fromisoformat(c["timestamp"])).days <= 14
        ]
        
        if len(recent_contributions) == 0:
            if risk_factors["risk_level"] == "LOW":
                risk_factors["risk_level"] = "MEDIUM"
            risk_factors["factors"].append("no_recent_activity")
    
    return risk_factors

async def trigger_ai_monitoring_call(goal_id: str, risk_factors: dict, ai_client):
    """Production: Trigger AI monitoring via internal API call"""
    if not ai_client:
        return
    
    try:
        # Use the correct comprehensive analysis endpoint
        analysis_request = {
            "group_id": goal_id,
            "analysis_types": ["progress_tracking", "risk_assessment"],
            "auto_execute": True  # This enables autonomous actions
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SCHEDULER_CONFIG['api_base_url']}/ai-tools/comprehensive-analysis",
                json=analysis_request,
                timeout=SCHEDULER_CONFIG["api_timeout"]
            )
            
            if response.status_code == 200:
                monitoring_result = response.json()
                logger.info(f"🤖 AI monitoring completed for goal {goal_id} - Risk: {monitoring_result.get('risk_level', 'UNKNOWN')}")
                
                # Store monitoring results for production analytics
                if "scheduler_monitoring" not in pool_status.get(goal_id, {}):
                    pool_status[goal_id]["scheduler_monitoring"] = []
                
                pool_status[goal_id]["scheduler_monitoring"].append({
                    "timestamp": datetime.now().isoformat(),
                    "risk_assessment": risk_factors,
                    "ai_monitoring_result": monitoring_result,
                    "triggered_by": "production_scheduler"
                })
                
            else:
                logger.error(f"AI monitoring API call failed for goal {goal_id}: HTTP {response.status_code}")
                
    except httpx.TimeoutException:
        logger.error(f"AI monitoring timeout for goal {goal_id}")
    except Exception as e:
        logger.error(f"AI monitoring call failed for goal {goal_id}: {str(e)}")

async def handle_milestone_events(goal_id: str, goal, status: dict, progress_percentage: float, ai_client):
    """Production milestone event handling with AI integration"""
    
    # Define production milestones
    milestones = [25, 50, 75, 90, 100]
    current_milestone = None
    
    for milestone in milestones:
        if progress_percentage >= milestone:
            current_milestone = milestone
    
    # Check if milestone was recently achieved
    last_milestone = status.get("last_milestone_reached", 0)
    
    if current_milestone and current_milestone > last_milestone:
        logger.info(f"🎯 Milestone achieved for goal {goal_id}: {current_milestone}%")
        
        # Update milestone tracking
        status["last_milestone_reached"] = current_milestone
        status["milestone_history"] = status.get("milestone_history", [])
        status["milestone_history"].append({
            "milestone": current_milestone,
            "timestamp": datetime.now().isoformat(),
            "progress_percentage": progress_percentage
        })
        
        # Trigger appropriate AI analysis based on milestone
        if current_milestone == 75:
            await trigger_optimization_call(goal_id, ai_client)
        elif current_milestone == 100:
            await trigger_completion_workflow(goal_id, ai_client)

async def trigger_optimization_call(goal_id: str, ai_client):
    """Production: Trigger optimization analysis via internal API"""
    try:
        goal_item = goals.get(goal_id)
        if not goal_item:
            logger.warning(f"Goal {goal_id} not found for optimization trigger")
            return
            
        # Use the comprehensive analysis endpoint with optimization focus
        optimization_request = {
            "group_id": goal_id,
            "analysis_types": ["optimization", "predictions"],
            "auto_execute": True
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SCHEDULER_CONFIG['api_base_url']}/ai-tools/comprehensive-analysis",
                json=optimization_request,
                timeout=SCHEDULER_CONFIG["api_timeout"]
            )
            
            if response.status_code == 200:
                logger.info(f"🚀 Optimization analysis triggered for goal {goal_id}")
            else:
                logger.error(f"Optimization API call failed: HTTP {response.status_code}")
                
    except Exception as e:
        logger.error(f"Optimization trigger failed for goal {goal_id}: {str(e)}")

async def trigger_completion_workflow(goal_id: str, ai_client):
    """Production: Trigger completion workflow via internal API"""
    try:
        # Use smart reminder for completion notifications
        completion_request = {
            "group_id": goal_id,
            "reminder_type": "goal_completed",
            "urgency": "high",
            "custom_message": "Goal completed - processing fund transfer",
            "auto_send": True
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{SCHEDULER_CONFIG['api_base_url']}/ai-tools/smart-reminder",
                json=completion_request,
                timeout=SCHEDULER_CONFIG["api_timeout"]
            )
            
            if response.status_code == 200:
                logger.info(f"💰 Completion workflow triggered for goal {goal_id}")
            else:
                logger.error(f"Completion workflow API call failed: HTTP {response.status_code}")
                
    except Exception as e:
        logger.error(f"Completion workflow trigger failed for goal {goal_id}: {str(e)}")

async def perform_system_optimization(ai_client):
    """Production: System-wide optimization and analytics"""
    try:
        # System-wide metrics
        total_goals = len(goals)
        active_goals = len([g for g in goals.values() if g.status == "active"])
        completed_goals = len([g for g in goals.values() if g.status == "completed"])
        at_risk_goals = 0
        
        # Count at-risk goals
        for goal_id, goal in goals.items():
            status = pool_status.get(goal_id, {})
            progress = (status.get("current_amount", 0) / goal.goal_amount) * 100
            days_remaining = (goal.target_date - datetime.now().date()).days
            
            if days_remaining <= 7 and progress < 50:
                at_risk_goals += 1
        
        logger.info(f"📈 System Stats - Total: {total_goals}, Active: {active_goals}, Completed: {completed_goals}, At Risk: {at_risk_goals}")
        
        # System-wide AI optimization if needed
        if at_risk_goals > (active_goals * 0.3):  # More than 30% at risk
            logger.warning(f"🚨 System alert: {at_risk_goals} goals at risk (>{30}% of active goals)")
            # Could trigger system-wide optimization here
        
    except Exception as e:
        logger.error(f"System optimization failed: {str(e)}")

async def generate_monitoring_report():
    """Production: Generate comprehensive monitoring report"""
    try:
        report = {
            "timestamp": datetime.now().isoformat(),
            "total_goals_monitored": len(goals),
            "ai_interventions_triggered": 0,
            "risk_assessments_performed": 0,
            "system_health": "HEALTHY"
        }
        
        # Count AI interventions from this monitoring cycle
        for goal_id, status in pool_status.items():
            monitoring_entries = status.get("scheduler_monitoring", [])
            recent_entries = [
                entry for entry in monitoring_entries
                if (datetime.now() - datetime.fromisoformat(entry["timestamp"])).seconds < SCHEDULER_CONFIG["monitoring_interval"]
            ]
            report["ai_interventions_triggered"] += len(recent_entries)
            report["risk_assessments_performed"] += len(recent_entries)
        
        logger.info(f"📋 Monitoring Report: {report['ai_interventions_triggered']} AI interventions, {report['risk_assessments_performed']} risk assessments")
        
    except Exception as e:
        logger.error(f"Monitoring report generation failed: {str(e)}")

async def analyze_single_goal(goal_id: str, goal, ai_client, now: datetime):
    """Analyze individual goal and trigger AI suggestions"""
    status = pool_status.get(goal_id, {})
    current_amount = status.get("current_amount", 0)
    contributors = status.get("contributors", [])
    
    # Calculate key metrics
    days_remaining = (goal.target_date - now.date()).days
    progress_percentage = (current_amount / goal.goal_amount) * 100 if goal.goal_amount > 0 else 0
    
    print(f"📊 Goal: {goal.title} | Progress: {progress_percentage:.1f}% | Days left: {days_remaining}")
    
    # 1. DEADLINE MONITORING
    if days_remaining <= 7 and not goal.is_paid:
        await handle_deadline_approaching(goal_id, goal, status, days_remaining, progress_percentage, ai_client)
    
    # 2. CONTRIBUTION PATTERN ANALYSIS
    if len(contributors) > 0:
        await analyze_contribution_patterns(goal_id, goal, contributors, ai_client)
    
    # 3. PROGRESS MILESTONE CHECKS
    if progress_percentage >= 75 and progress_percentage < 100:
        await handle_near_completion(goal_id, goal, status, ai_client)
    
    # 4. AWAITING PAYMENT STATUS
    if goal.status == "awaiting_payment":
        await handle_awaiting_payment(goal_id, goal, ai_client)

async def handle_deadline_approaching(goal_id: str, goal, status: dict, days_remaining: int, progress_percentage: float, ai_client):
    """Handle goals with approaching deadlines"""
    urgency_level = "CRITICAL" if days_remaining <= 1 else "HIGH" if days_remaining <= 3 else "MEDIUM"
    
    print(f"🚨 {urgency_level} ALERT: Goal '{goal.title}' deadline in {days_remaining} days with {progress_percentage:.1f}% progress")
    
    if ai_client:
        try:
            # Call AI analysis for deadline pressure
            analysis_prompt = f"""
            URGENT GOAL ANALYSIS NEEDED:
            
            Goal: {goal.title}
            Target Amount: ₱{goal.goal_amount}
            Current Amount: ₱{status.get("current_amount", 0)}
            Progress: {progress_percentage:.1f}%
            Days Remaining: {days_remaining}
            Contributors: {len(status.get("contributors", []))}
            
            This goal has {urgency_level} urgency. Provide:
            1. Immediate action items
            2. Who to contact urgently
            3. Fallback strategies if goal can't be met
            4. Communication messages for group members
            """
            
            response = await ai_client.chat.completions.create(
                model="deepseek/deepseek-chat",  # Fixed model name
                messages=[{"role": "user", "content": analysis_prompt}],
                max_tokens=800,
                temperature=0.3,
            )
            
            ai_suggestion = response.choices[0].message.content
            print(f"🤖 AI URGENT SUGGESTION for {goal.title}:")
            print(ai_suggestion)
            
            # Store suggestion for later retrieval
            if "ai_suggestions" not in status:
                status["ai_suggestions"] = []
            status["ai_suggestions"].append({
                "type": "deadline_alert",
                "urgency": urgency_level,
                "suggestion": ai_suggestion,
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            print(f"❌ AI analysis failed for deadline alert: {e}")

async def analyze_contribution_patterns(goal_id: str, goal, contributors: list, ai_client):
    """Analyze contribution patterns and detect issues"""
    if not ai_client or len(contributors) < 2:
        return
    
    # Analyze contribution timing and amounts
    recent_contributions = [c for c in contributors if 
                          (datetime.now() - datetime.fromisoformat(c["timestamp"])).days <= 7]
    
    if len(recent_contributions) == 0 and len(contributors) > 0:
        # No recent contributions - potential stagnation
        print(f"⚠️  No recent contributions for goal '{goal.title}' in past 7 days")
        
        try:
            pattern_prompt = f"""
            Analyze this contribution pattern for goal '{goal.title}':
            
            Total Contributors: {len(contributors)}
            Recent Contributors (7 days): {len(recent_contributions)}
            Last Contribution: {contributors[-1]["timestamp"] if contributors else "None"}
            
            Contributors data: {json.dumps(contributors[-5:], indent=2)}
            
            Detect patterns and suggest:
            1. Why contributions might have slowed
            2. Strategies to re-engage contributors
            3. Optimal reminder timing
            4. Group motivation techniques
            """
            
            response = await ai_client.chat.completions.create(
                model="deepseek/deepseek-chat",
                messages=[{"role": "user", "content": pattern_prompt}],
                max_tokens=600,
                temperature=0.3,
            )
            
            print(f"🔍 CONTRIBUTION PATTERN ANALYSIS for {goal.title}:")
            print(response.choices[0].message.content)
            
        except Exception as e:
            print(f"❌ Contribution pattern analysis failed: {e}")

async def handle_near_completion(goal_id: str, goal, status: dict, ai_client):
    """Handle goals that are near completion (75%+)"""
    if not ai_client:
        return
    
    print(f"🎯 Goal '{goal.title}' is near completion - triggering final push analysis")
    
    try:
        completion_prompt = f"""
        Goal '{goal.title}' is near completion:
        
        Progress: 75%+ achieved
        Remaining Amount: ₱{goal.goal_amount - status.get("current_amount", 0)}
        Target Date: {goal.target_date}
        
        Provide final push strategies:
        1. How to secure the remaining amount quickly
        2. Risk mitigation if final amount isn't reached
        """
        
        response = await ai_client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[{"role": "user", "content": completion_prompt}],
            max_tokens=500,
            temperature=0.3,
        )
        
        print(f"🚀 FINAL PUSH STRATEGY for {goal.title}:")
        print(response.choices[0].message.content)
        
    except Exception as e:
        print(f"❌ Final push analysis failed: {e}")

async def handle_awaiting_payment(goal_id: str, goal, ai_client):
    """Handle goals that reached target and await payment"""
    if not ai_client:
        return
    
    print(f"💰 Goal '{goal.title}' awaiting payment - triggering manager notification")
    
    try:
        payment_prompt = f"""
        Goal '{goal.title}' has reached its target and is awaiting manager payment approval.
        
        Generate:
        1. Professional notification message for the manager
        2. Celebration message for contributors
        3. Next steps and timeline
        4. Payment processing checklist
        """
        
        response = await ai_client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[{"role": "user", "content": payment_prompt}],
            max_tokens=400,
            temperature=0.3,
        )
        
        print(f"📋 PAYMENT PROCESSING GUIDE for {goal.title}:")
        print(response.choices[0].message.content)
        
    except Exception as e:
        print(f"❌ Payment processing analysis failed: {e}")

async def check_goal_optimization_needs(ai_client):
    """Check if any goals need optimization based on overall patterns"""
    if not ai_client or len(goals) == 0:
        return
    
    # Analyze overall goal performance
    active_goals = [g for g in goals.values() if g.status == "active"]
    struggling_goals = []
    
    for goal in active_goals:
        status = pool_status.get(goal.id, {})
        progress = (status.get("current_amount", 0) / goal.goal_amount) * 100 if goal.goal_amount > 0 else 0
        days_remaining = (goal.target_date - datetime.now().date()).days
        
        # Identify struggling goals
        if days_remaining > 0 and progress < (100 - (days_remaining * 5)):  # Expected progress formula
            struggling_goals.append(goal.title)
    
    if struggling_goals:
        print(f"📈 OPTIMIZATION CHECK: {len(struggling_goals)} goals may need optimization")
        print(f"Goals needing attention: {', '.join(struggling_goals)}")
        
        # This could trigger more detailed AI analysis for optimization

def start_scheduler():
    """Start the AI-powered goal monitoring scheduler"""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    print("🚀 Starting AI Goal Monitoring Scheduler...")
    loop.create_task(monitor_goals())
    print("✅ Scheduler task created successfully!")

# Additional utility functions for manual triggers
async def trigger_manual_goal_analysis(goal_id: str):
    """Manually trigger AI analysis for a specific goal"""
    ai_client = get_ai_client()
    if goal_id in goals:
        goal = goals[goal_id]
        await analyze_single_goal(goal_id, goal, ai_client, datetime.now())
        return f"AI analysis triggered for goal {goal_id}"
    return f"Goal {goal_id} not found"

def get_scheduler_status():
    """Get current scheduler status and statistics"""
    return {
        "status": "running",
        "total_goals": len(goals),
        "active_goals": len([g for g in goals.values() if g.status == "active"]),
        "goals_awaiting_payment": len([g for g in goals.values() if g.status == "awaiting_payment"]),
        "last_check": datetime.now().isoformat()
    }