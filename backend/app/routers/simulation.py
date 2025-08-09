from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Union
from datetime import datetime, timedelta
import logging
from uuid import uuid4

# Import AI client and data sources
from .ai_client import get_ai_client
# from .goal import goals, pool_status
from .mongo import goals_collection, pool_status_collection, groups_collection, simulation_results_collection
# from .groups import group_db

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/simulation", tags=["simulation"])

# Simulation Models
class WhatIfScenario(BaseModel):
    scenario_type: str  # "goal_amount", "member_contribution", "add_member", "remove_member", "deadline_change"
    description: str
    parameters: Dict

class SimulationRequest(BaseModel):
    goal_id: str
    scenarios: List[WhatIfScenario]
    explain_outcomes: bool = True
    advisor_mode: bool = True

class MemberContributionScenario(BaseModel):
    member_name: str
    new_amount: float
    reason: Optional[str] = None

class GoalAmountScenario(BaseModel):
    new_goal_amount: float
    reason: Optional[str] = None

class NewMemberScenario(BaseModel):
    member_name: str
    expected_contribution: float
    join_date: Optional[str] = None

class DeadlineChangeScenario(BaseModel):
    new_deadline: str
    reason: Optional[str] = None


# simulation_results_db = []

async def get_goal_baseline(goal_id: str) -> Optional[Dict]:
    goal = await goals_collection.find_one({"goal_id": goal_id})
    if not goal:
        return None
    
    pool_data = await pool_status_collection.find_one({"goal_id": goal_id})
    
    return {
        "goal_id": goal_id,
        "title": goal['title'],
        "current_goal_amount": goal['goal_amount'],
        "current_amount": pool_data.get("current_amount", 0),
        "target_date": goal['target_date'].isoformat(),
        "status": goal['status'],
        "contributors": pool_data.get("contributors", []),
        "creator": goal['creator_name'],
        "days_remaining": (goal['target_date'] - datetime.now().date()).days
    }

def calculate_scenario_impact(baseline: Dict, scenario: WhatIfScenario) -> Dict:
    """Calculate the impact of a specific scenario"""
    impact = {
        "scenario_type": scenario.scenario_type,
        "description": scenario.description,
        "baseline": baseline.copy(),
        "projected": baseline.copy(),
        "changes": {},
        "risks": [],
        "opportunities": []
    }
    
    if scenario.scenario_type == "goal_amount":
        # Simulate changing the goal amount
        new_amount = scenario.parameters.get("new_goal_amount", baseline["current_goal_amount"])
        difference = new_amount - baseline["current_goal_amount"]
        
        impact["projected"]["current_goal_amount"] = new_amount
        impact["changes"]["goal_amount_change"] = difference
        impact["changes"]["new_per_member_target"] = new_amount / len(baseline["contributors"]) if baseline["contributors"] else new_amount
        
        # Calculate risks and opportunities
        if difference > 0:
            impact["risks"].append("Higher goal may reduce participation")
            impact["risks"].append("More time needed to collect additional funds")
        else:
            impact["opportunities"].append("Lower goal easier to achieve")
            impact["opportunities"].append("Faster completion possible")
    
    elif scenario.scenario_type == "member_contribution":
        # Simulate changing a member's contribution
        member_name = scenario.parameters.get("member_name")
        new_amount = scenario.parameters.get("new_amount", 0)
        
        # Find current contribution
        current_contrib = 0
        for contrib in baseline["contributors"]:
            if contrib["name"] == member_name:
                current_contrib = contrib["amount"]
                break
        
        difference = new_amount - current_contrib
        impact["projected"]["current_amount"] = baseline["current_amount"] + difference
        impact["changes"]["member"] = member_name
        impact["changes"]["contribution_change"] = difference
        impact["changes"]["new_remaining"] = baseline["current_goal_amount"] - impact["projected"]["current_amount"]
        
        if difference < 0:
            shortage = abs(difference)
            other_members = len(baseline["contributors"]) - 1
            if other_members > 0:
                additional_per_member = shortage / other_members
                impact["changes"]["additional_per_member"] = additional_per_member
                impact["risks"].append(f"Other members need to pay ₱{additional_per_member:.2f} more each")
        
    elif scenario.scenario_type == "add_member":
        # Simulate adding a new member
        new_member = scenario.parameters.get("member_name")
        expected_contrib = scenario.parameters.get("expected_contribution", 0)
        
        impact["projected"]["current_amount"] = baseline["current_amount"] + expected_contrib
        impact["changes"]["new_member"] = new_member
        impact["changes"]["additional_contribution"] = expected_contrib
        
        # Recalculate per-member amounts
        new_member_count = len(baseline["contributors"]) + 1
        remaining_after_new = baseline["current_goal_amount"] - impact["projected"]["current_amount"]
        if remaining_after_new > 0:
            new_per_member = remaining_after_new / new_member_count
            impact["changes"]["new_per_member_amount"] = new_per_member
        
        impact["opportunities"].append("Additional member reduces individual burden")
        impact["opportunities"].append("Faster goal completion possible")
    
    elif scenario.scenario_type == "deadline_change":
        # Simulate changing the deadline
        new_deadline = scenario.parameters.get("new_deadline")
        if new_deadline:
            try:
                new_date = datetime.fromisoformat(new_deadline).date()
                old_date = datetime.fromisoformat(baseline["target_date"]).date()
                
                impact["projected"]["target_date"] = new_deadline
                impact["changes"]["deadline_change_days"] = (new_date - old_date).days
                
                if new_date > old_date:
                    impact["opportunities"].append("More time to collect contributions")
                    impact["opportunities"].append("Reduced pressure on members")
                else:
                    impact["risks"].append("Less time to collect remaining amount")
                    impact["risks"].append("Increased urgency may stress members")
            except:
                impact["risks"].append("Invalid date format")
        else:
            impact["risks"].append("No deadline provided")
    
    return impact


async def generate_advisor_recommendations(baseline: Dict, impacts: List[Dict]) -> Dict:
    """Generate AI advisor recommendations based on historical data and patterns"""
    try:
        client = get_ai_client()
        if not client:
            return {"error": "AI advisor not available"}
        
        # Analyze historical patterns (simplified for demo)
        total_goals = await goals_collection.count_documents({})
        completed_goals = await goals_collection.count_documents({"status": "completed"})
        success_rate = (completed_goals / total_goals * 100) if total_goals > 0 else 0
        
        ai_prompt = f"""
        AMBAG Financial Advisor Analysis
        
        Current Situation:
        - Goal: {baseline['title']} 
        - Progress: ₱{baseline['current_amount']:,.2f} / ₱{baseline['current_goal_amount']:,.2f}
        - Days Left: {baseline['days_remaining']}
        - Contributors: {len(baseline['contributors'])}
        
        System Performance:
        - Total Goals: {total_goals}
        - Success Rate: {success_rate:.1f}%
        
        Scenarios Impact Summary:
        {chr(10).join([f"• {impact['scenario_type']}: {impact.get('changes', {})}" for impact in impacts])}
        
        As a Filipino financial advisor, provide:
        1. Optimal scenario recommendation with reasoning
        2. Risk mitigation strategies
        3. Cultural considerations for Filipino groups
        4. Probability estimates for success
        5. Alternative plans if primary scenario fails

        Use Filipino-English mix (Taglish) and be practical about Filipino financial habits.
        Be practical, culturally aware, and focus on group harmony and financial success.
        Format as JSON with recommendations, probabilities, and action_steps.
        The maximum response should be 5 sentences.
        """
        
        response = await client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[{"role": "user", "content": ai_prompt}],
            max_tokens=2000,
            temperature=0.6
        )
        
        ai_response = response.choices[0].message.content
        
        try:
            import json
            if ai_response:
                return json.loads(ai_response)
            else:
                return {"error": "Empty AI response"}
        except:
            return {"advisor_feedback": ai_response or "No advisor feedback available", "type": "text"}
            
    except Exception as e:
        logger.error(f"AI advisor error: {str(e)}")
        return {"error": f"Failed to generate advisor recommendations: {str(e)}"}

@router.post("/what-if-analysis")
async def what_if_analysis(request: SimulationRequest):
    """
    Run comprehensive what-if analysis with AI explanations and advisor recommendations
    """
    try:
        # Get baseline goal data
        baseline = await get_goal_baseline(request.goal_id)
        if not baseline:
            raise HTTPException(status_code=404, detail=f"Goal {request.goal_id} not found")
        
        # Calculate impacts for each scenario
        scenario_impacts = []
        for scenario in request.scenarios:
            impact = calculate_scenario_impact(baseline, scenario)
            scenario_impacts.append(impact)
        
        advisor_recommendations = {}
        if request.advisor_mode:
            advisor_recommendations = await generate_advisor_recommendations(baseline, scenario_impacts)
        
        simulation_result = {
            "id": f"sim_{request.goal_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "goal_id": request.goal_id,
            "baseline": baseline,
            "scenarios": request.scenarios,
            "impacts": scenario_impacts,
            "advisor_recommendations": advisor_recommendations,
            "timestamp": datetime.now().isoformat()
        }
        
        await simulation_results_collection.insert_one(simulation_result)
        
        response = {
            "simulation_id": simulation_result["id"],
            "goal_id": request.goal_id,
            "baseline": baseline,
            "scenario_impacts": scenario_impacts,
            "summary": {
                "scenarios_analyzed": len(scenario_impacts),
                "total_risks_identified": sum(len(impact["risks"]) for impact in scenario_impacts),
                "total_opportunities": sum(len(impact["opportunities"]) for impact in scenario_impacts)
            }
        }
        
        if request.advisor_mode:
            response["advisor_recommendations"] = advisor_recommendations
        
        logger.info(f"What-if analysis completed for goal {request.goal_id} - {len(scenario_impacts)} scenarios")
        
        return response
        
    except Exception as e:
        logger.error(f"What-if analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/scenarios/{goal_id}")
async def get_goal_scenarios(goal_id: str):
    """Get all simulation results for a specific goal"""
    
    goal_simulations = await simulation_results_collection.find({"goal_id": goal_id}).to_list(length=None)
    
    return {
        "goal_id": goal_id,
        "simulations": goal_simulations,
        "count": len(goal_simulations)
    }


@router.post("/create-test-goal")
async def create_test_goal():
    """Create a test goal with sample data for simulation testing"""
    
    test_goal_id = "test_goal_123"
    
    test_goal_data = {
        "id": test_goal_id,
        "title": "Family Vacation Fund",
        "goal_amount": 50000.0,
        "current_amount": 15000.0,
        "target_date": (datetime.now() + timedelta(days=90)).date(),
        "creator_name": "Juan Dela Cruz",
        "description": "Save for Boracay family trip",
        "creator_role": "manager",
        "status": "active",
        "created_at": datetime.now().isoformat(),
        "is_paid": False
    }
    
    from .goal import goal
    test_goal = goal(**test_goal_data)
    
    goals[test_goal_id] = test_goal
    
    pool_status[test_goal_id] = {
        "current_amount": 15000.0,
        "contributors": [
            {"name": "Juan Dela Cruz", "amount": 5000.0, "date": "2025-07-15"},
            {"name": "Maria Santos", "amount": 4000.0, "date": "2025-07-20"},
            {"name": "Pedro Garcia", "amount": 3000.0, "date": "2025-07-25"},
            {"name": "Ana Reyes", "amount": 3000.0, "date": "2025-07-30"}
        ],
        "last_updated": datetime.now().isoformat()
    }
    
    return {
        "message": "Test goal created successfully",
        "goal_id": test_goal_id,
        "goal_details": {
            "title": test_goal.title,
            "goal_amount": test_goal.goal_amount,
            "current_amount": 15000.0,
            "target_date": test_goal.target_date.isoformat(),
            "days_remaining": (test_goal.target_date - datetime.now().date()).days,
            "contributors": 4,
            "remaining_amount": 35000.0
        },
        "ready_for_simulation": True
    }

@router.get("/dashboard")
async def simulation_dashboard():
    """Get overview of all simulation activity"""
    
    total_simulations = await simulation_results_collection.count_documents({})
    unique_goals = len(await simulation_results_collection.distinct("goal_id"))
    
    # Count scenario types
    scenario_types = {}
    async for sim in simulation_results_collection.find():  # Note: async for
        for scenario in sim.get("scenarios", []):  # Safer .get() with default
            scenario_type = scenario["scenario_type"]
            scenario_types[scenario_type] = scenario_types.get(scenario_type, 0) + 1
    
    recent_simulations = await simulation_results_collection.find().sort("_id", -1).limit(5).to_list(length=None)

    return {
        "total_simulations": total_simulations,
        "unique_goals_analyzed": unique_goals,
        "scenario_type_breakdown": scenario_types,
        "recent_simulations": recent_simulations,
        "generated_at": datetime.now().isoformat()
    }