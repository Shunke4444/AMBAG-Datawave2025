from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Union
from datetime import datetime, timedelta
import logging
from uuid import uuid4

# Import AI client and data sources
from .ai_client import get_ai_client
from .goal import goals, pool_status
from .groups import group_db

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

# Simulation Database
simulation_results_db = []

# Helper Functions
def get_goal_baseline(goal_id: str) -> Optional[Dict]:
    """Get current goal state as baseline for simulations"""
    goal = goals.get(goal_id)
    if not goal:
        return None
    
    pool_data = pool_status.get(goal_id, {})
    
    return {
        "goal_id": goal_id,
        "title": goal.title,
        "current_goal_amount": goal.goal_amount,
        "current_amount": pool_data.get("current_amount", 0),
        "target_date": goal.target_date.isoformat(),
        "status": goal.status,
        "contributors": pool_data.get("contributors", []),
        "creator": goal.creator_name,
        "days_remaining": (goal.target_date - datetime.now().date()).days
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

async def generate_ai_explanation(impacts: List[Dict], baseline: Dict) -> Dict:
    """Generate AI explanations for scenario outcomes"""
    try:
        client = get_ai_client()
        if not client:
            return {"error": "AI client not available"}
        
        # Prepare context for AI
        scenarios_summary = []
        for impact in impacts:
            scenarios_summary.append({
                "type": impact["scenario_type"],
                "description": impact["description"],
                "key_changes": impact["changes"],
                "risks": impact["risks"],
                "opportunities": impact["opportunities"]
            })
        
        ai_prompt = f"""
        AMBAG Financial Simulation Analysis
        
        Goal: {baseline['title']}
        Current Amount: ₱{baseline['current_amount']:,.2f}
        Goal Amount: ₱{baseline['current_goal_amount']:,.2f}
        Days Remaining: {baseline['days_remaining']}
        Contributors: {len(baseline['contributors'])}
        
        Scenarios Analyzed:
        {chr(10).join([f"• {s['type']}: {s['description']}" for s in scenarios_summary])}
        
        For each scenario, provide:
        1. Plain language explanation of impact
        2. Financial implications in Filipino context
        3. Risk assessment (low/medium/high)
        4. Recommendations for the group
        
        Use Filipino-English mix (Taglish) and be practical about Filipino financial habits.
        Format as JSON with explanations, recommendations, and risk_levels for each scenario.
        """
        
        response = await client.chat.completions.create(
            model="deepseek/deepseek-chat",
            messages=[{"role": "user", "content": ai_prompt}],
            max_tokens=2000,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # Try to parse JSON response
        try:
            import json
            if ai_response:
                return json.loads(ai_response)
            else:
                return {"error": "Empty AI response"}
        except:
            # Fallback to text response
            return {"explanation": ai_response or "No explanation available", "type": "text"}
            
    except Exception as e:
        logger.error(f"AI explanation error: {str(e)}")
        return {"error": f"Failed to generate explanation: {str(e)}"}

async def generate_advisor_recommendations(baseline: Dict, impacts: List[Dict]) -> Dict:
    """Generate AI advisor recommendations based on historical data and patterns"""
    try:
        client = get_ai_client()
        if not client:
            return {"error": "AI advisor not available"}
        
        # Analyze historical patterns (simplified for demo)
        total_goals = len(goals)
        completed_goals = len([g for g in goals.values() if g.status == "completed"])
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

# API Endpoints

@router.post("/what-if-analysis")
async def what_if_analysis(request: SimulationRequest):
    """
    Run comprehensive what-if analysis with AI explanations and advisor recommendations
    """
    try:
        # Get baseline goal data
        baseline = get_goal_baseline(request.goal_id)
        if not baseline:
            raise HTTPException(status_code=404, detail=f"Goal {request.goal_id} not found")
        
        # Calculate impacts for each scenario
        scenario_impacts = []
        for scenario in request.scenarios:
            impact = calculate_scenario_impact(baseline, scenario)
            scenario_impacts.append(impact)
        
        # Generate AI explanations if requested
        ai_explanations = {}
        if request.explain_outcomes:
            ai_explanations = await generate_ai_explanation(scenario_impacts, baseline)
        
        # Generate advisor recommendations if requested
        advisor_recommendations = {}
        if request.advisor_mode:
            advisor_recommendations = await generate_advisor_recommendations(baseline, scenario_impacts)
        
        # Store simulation results
        simulation_result = {
            "id": f"sim_{request.goal_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "goal_id": request.goal_id,
            "baseline": baseline,
            "scenarios": request.scenarios,
            "impacts": scenario_impacts,
            "ai_explanations": ai_explanations,
            "advisor_recommendations": advisor_recommendations,
            "timestamp": datetime.now().isoformat()
        }
        
        simulation_results_db.append(simulation_result)
        
        # Prepare response
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
        
        if request.explain_outcomes:
            response["ai_explanations"] = ai_explanations
        
        if request.advisor_mode:
            response["advisor_recommendations"] = advisor_recommendations
        
        logger.info(f"What-if analysis completed for goal {request.goal_id} - {len(scenario_impacts)} scenarios")
        
        return response
        
    except Exception as e:
        logger.error(f"What-if analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/quick-scenario")
async def quick_scenario(
    goal_id: str,
    scenario_type: str,
    parameters: Dict,
    description: Optional[str] = None
):
    """
    Quick single scenario analysis for immediate feedback
    """
    try:
        baseline = get_goal_baseline(goal_id)
        if not baseline:
            raise HTTPException(status_code=404, detail=f"Goal {goal_id} not found")
        
        scenario = WhatIfScenario(
            scenario_type=scenario_type,
            description=description or f"Quick {scenario_type} scenario",
            parameters=parameters
        )
        
        impact = calculate_scenario_impact(baseline, scenario)
        
        # Generate quick AI explanation
        ai_explanation = await generate_ai_explanation([impact], baseline)
        
        return {
            "scenario": scenario,
            "impact": impact,
            "explanation": ai_explanation,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Quick scenario error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scenario analysis failed: {str(e)}")

@router.get("/scenarios/{goal_id}")
async def get_goal_scenarios(goal_id: str):
    """Get all simulation results for a specific goal"""
    
    goal_simulations = [s for s in simulation_results_db if s["goal_id"] == goal_id]
    
    return {
        "goal_id": goal_id,
        "simulations": goal_simulations,
        "count": len(goal_simulations)
    }

@router.get("/templates")
async def get_scenario_templates():
    """Get predefined scenario templates for common what-if questions"""
    
    templates = {
        "goal_amount_increase": {
            "scenario_type": "goal_amount",
            "description": "What if we increase the goal amount?",
            "parameters": {
                "new_goal_amount": "REPLACE_WITH_NEW_AMOUNT"
            }
        },
        "member_reduced_contribution": {
            "scenario_type": "member_contribution", 
            "description": "What if a member can only pay less?",
            "parameters": {
                "member_name": "REPLACE_WITH_MEMBER_NAME",
                "new_amount": "REPLACE_WITH_NEW_AMOUNT"
            }
        },
        "add_new_member": {
            "scenario_type": "add_member",
            "description": "What if we add a new contributor?",
            "parameters": {
                "member_name": "REPLACE_WITH_NEW_MEMBER_NAME",
                "expected_contribution": "REPLACE_WITH_EXPECTED_AMOUNT"
            }
        },
        "deadline_extension": {
            "scenario_type": "deadline_change",
            "description": "What if we extend the deadline?",
            "parameters": {
                "new_deadline": "REPLACE_WITH_NEW_DATE"
            }
        }
    }
    
    return {
        "templates": templates,
        "usage": "Replace REPLACE_WITH_* placeholders with actual values"
    }

@router.post("/batch-analysis")
async def batch_analysis(goal_id: str):
    """
    Run common scenario analysis automatically for comprehensive planning
    """
    try:
        baseline = get_goal_baseline(goal_id)
        if not baseline:
            raise HTTPException(status_code=404, detail=f"Goal {goal_id} not found")
        
        # Generate common scenarios automatically
        common_scenarios = []
        
        # Scenario 1: 20% goal increase
        common_scenarios.append(WhatIfScenario(
            scenario_type="goal_amount",
            description="20% goal increase scenario",
            parameters={"new_goal_amount": baseline["current_goal_amount"] * 1.2}
        ))
        
        # Scenario 2: 20% goal decrease
        common_scenarios.append(WhatIfScenario(
            scenario_type="goal_amount", 
            description="20% goal decrease scenario",
            parameters={"new_goal_amount": baseline["current_goal_amount"] * 0.8}
        ))
        
        # Scenario 3: Add new member
        common_scenarios.append(WhatIfScenario(
            scenario_type="add_member",
            description="Add new member scenario",
            parameters={
                "member_name": "New Member",
                "expected_contribution": baseline["current_goal_amount"] / (len(baseline["contributors"]) + 1)
            }
        ))
        
        # Scenario 4: Deadline extension
        new_deadline = (datetime.now() + timedelta(days=baseline["days_remaining"] + 14)).date()
        common_scenarios.append(WhatIfScenario(
            scenario_type="deadline_change",
            description="2-week deadline extension",
            parameters={"new_deadline": new_deadline.isoformat()}
        ))
        
        # Run full analysis
        request = SimulationRequest(
            goal_id=goal_id,
            scenarios=common_scenarios,
            explain_outcomes=True,
            advisor_mode=True
        )
        
        return await what_if_analysis(request)
        
    except Exception as e:
        logger.error(f"Batch analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch analysis failed: {str(e)}")

@router.delete("/scenarios/{simulation_id}")
async def delete_simulation(simulation_id: str):
    """Delete a specific simulation result"""
    
    global simulation_results_db
    simulation_results_db = [s for s in simulation_results_db if s["id"] != simulation_id]
    
    return {"message": f"Simulation {simulation_id} deleted successfully"}

@router.get("/dashboard")
async def simulation_dashboard():
    """Get overview of all simulation activity"""
    
    total_simulations = len(simulation_results_db)
    unique_goals = len(set(s["goal_id"] for s in simulation_results_db))
    
    # Count scenario types
    scenario_types = {}
    for sim in simulation_results_db:
        for scenario in sim["scenarios"]:
            scenario_type = scenario.scenario_type
            scenario_types[scenario_type] = scenario_types.get(scenario_type, 0) + 1
    
    return {
        "total_simulations": total_simulations,
        "unique_goals_analyzed": unique_goals,
        "scenario_type_breakdown": scenario_types,
        "recent_simulations": simulation_results_db[-5:] if simulation_results_db else [],
        "generated_at": datetime.now().isoformat()
    }