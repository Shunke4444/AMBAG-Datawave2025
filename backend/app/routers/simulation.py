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




simulation_results_db = []

def get_goal_baseline(goal_id: str) -> Optional[Dict]:
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


def create_master_prompt(baseline: Dict, user_prompt: str) -> str:
    """Creates the detailed prompt for the AI, instructing it on Taglish and specific recommendations."""
    return f'''
You are AMBAG AI, an expert Filipino financial assistant. Your task is to analyze a user's savings goal based on their "what-if" question.
Your entire response MUST be a single, valid JSON object. Do not include markdown like ```json or any text before or after the JSON object.

**Instructions:**
1.  **Language:** Respond in conversational **Taglish** (a mix of Tagalog and English). Be encouraging and friendly, like a helpful tita or tito.
2.  **Analyze the Scenario:** The user's goal is to save ₱{baseline['current_goal_amount']:,.2f}. They have ₱{baseline['current_amount']:,.2f} and {baseline['days_remaining']} days left. Their question is: "{user_prompt}".
3.  **Generate Narrative:** Write a short narrative explaining the situation. Start with a friendly greeting. If the user's question sounds negative (e.g., "what if I can't pay?", "paano kung kapusin?", "what if we're short?"), you MUST include a markdown section titled "**Recommendations:**" with a list of practical tips. Your recommendations MUST always include:
        - **Adjust your timeline:** Kung hindi kaya ng 90 days, extend mo ng konti para mas manageable yung daily savings mo.
        - **Cut unnecessary expenses:** Tingnan mo yung mga luho or unnecessary spending, baka pwede mong bawasan para makapag-save ka ng mas malaki.
        - **Find extra income:** Maghanap ng sideline or part-time work para dagdag sa savings mo.
        - **Prioritize your goal:** Lagyan mo ng priority yung savings mo para hindi ka ma-distract sa ibang gastos. Kaya mo yan!
        - **Loan options:** Suggest talking to group mates for help, or considering a formal loan (e.g., "You can also consider a personal loan. For example, a BPI Personal Loan can provide quick cash. This is a good option for urgent needs, but always check the interest rates and terms carefully.")
        Use bold, italics, and lists for clarity and design. Place this markdown list inside the narrative field after your analysis.
4.  **Generate Charts:** Create 1 to 4 charts that visualize the user's scenario. You may use any chart type supported by Chart.js (bar, line, pie, doughnut, radar, polarArea, scatter, bubble, etc.). For each chart, choose the type that best conveys the information. Try to use a variety of chart types (not just bar and pie) when appropriate. The charts should be simple and easy to understand.

**Chart Type Guidance:**
- **bar**: Compare values (e.g., goal vs. collected, contributors).
- **line**: Show trends over time (e.g., savings progress).
- **pie/doughnut/polarArea**: Show parts of a whole (e.g., contribution breakdown).
- **radar**: Compare multiple variables for a group (e.g., member strengths).
- **scatter/bubble**: Show relationships between two or three variables (e.g., amount vs. days, or amount vs. days vs. member).


**Data Structure Guidance:**
- For **scatter**: datasets should be arrays of objects with x and y (e.g., {{"x": 1, "y": 2}}).
- For **bubble**: datasets should be arrays of objects with x, y, and r (e.g., {{"x": 1, "y": 2, "r": 5}}).
- For **radar**: labels are axes, each dataset is a set of values for those axes.

5.  **Format Output:** Respond ONLY in the valid JSON format specified below.

**Required JSON Output Schema:**
{{
    "narrative": "A short, insightful analysis in Taglish. If recommendations are needed, include them as a markdown list in this field.",
    "charts": [
        {{
            "title": "string",
            "type": "bar|line|pie|doughnut|radar|polarArea|scatter|bubble",
            "labels": ["string", ...],
            "datasets": [
                {{
                    "label": "string",

                    "data": [number, ...] or [{{x:number, y:number}}] or [{{x:number, y:number, r:number}}],
                    "color": "#HEXCODE"
                }}
      ]
    }}
  ]
}}
'''

# async def generate_advisor_recommendations(baseline: Dict, impacts: List[Dict]) -> Dict:
#     """Generate AI advisor recommendations based on historical data and patterns"""
#     try:
#         client = get_ai_client()
#         if not client:
#             return {"error": "AI advisor not available"}
        
#         # Analyze historical patterns (simplified for demo)
#         total_goals = len(goals)
#         completed_goals = len([g for g in goals.values() if g.status == "completed"])
#         success_rate = (completed_goals / total_goals * 100) if total_goals > 0 else 0
        
#         ai_prompt = f"""
#         AMBAG Financial Advisor Analysis
        
#         Current Situation:
#         - Goal: {baseline['title']} 
#         - Progress: ₱{baseline['current_amount']:,.2f} / ₱{baseline['current_goal_amount']:,.2f}
#         - Days Left: {baseline['days_remaining']}
#         - Contributors: {len(baseline['contributors'])}
        
#         System Performance:
#         - Total Goals: {total_goals}
#         - Success Rate: {success_rate:.1f}%
        
#         Scenarios Impact Summary:
#         {chr(10).join([f"• {impact['scenario_type']}: {impact.get('changes', {})}" for impact in impacts])}
        
#         As a Filipino financial advisor, provide:
#         1. Optimal scenario recommendation with reasoning
#         2. Risk mitigation strategies
#         3. Cultural considerations for Filipino groups
#         4. Probability estimates for success
#         5. Alternative plans if primary scenario fails

#         Use Filipino-English mix (Taglish) and be practical about Filipino financial habits.
#         Be practical, culturally aware, and focus on group harmony and financial success.
#         Format as JSON with recommendations, probabilities, and action_steps.
#         The maximum response should be 5 sentences.
#         """
        
#         response = await client.chat.completions.create(
#             model="deepseek/deepseek-chat",
#             messages=[{"role": "user", "content": ai_prompt}],
#             max_tokens=2000,
#             temperature=0.6
#         )
        
#         ai_response = response.choices[0].message.content
        
#         try:
#             import json
#             if ai_response:
#                 return json.loads(ai_response)
#             else:
#                 return {"error": "Empty AI response"}
#         except:
#             return {"advisor_feedback": ai_response or "No advisor feedback available", "type": "text"}
            
#     except Exception as e:
#         logger.error(f"AI advisor error: {str(e)}")
#         return {"error": f"Failed to generate advisor recommendations: {str(e)}"}


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
        
        simulation_results_db.append(simulation_result)
        
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
    
    goal_simulations = [s for s in simulation_results_db if s["goal_id"] == goal_id]
    
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


# ===== AI-Driven Chart Generation =====

from typing import Union

from pydantic import field_validator, model_validator
from typing import Any

class ChartDataset(BaseModel):
    label: str
    data: List[Any]
    color: Optional[Union[str, List[str]]] = None

    @field_validator('data')
    @classmethod
    def validate_data(cls, v):
        # Accepts: list of numbers, list of dicts (for scatter/bubble), or list of lists (radar)
        if not isinstance(v, list):
            raise ValueError('data must be a list')
        if len(v) == 0:
            return v
        # Accept if all numbers
        if all(isinstance(i, (int, float)) for i in v):
            return v
        # Accept if all dicts with x/y (scatter) or x/y/r (bubble)
        if all(isinstance(i, dict) and ('x' in i and 'y' in i) for i in v):
            return v
        # Accept if all lists (radar, etc)
        if all(isinstance(i, list) for i in v):
            return v
        raise ValueError('data must be a list of numbers, dicts (with x/y), or lists')


class ChartSpec(BaseModel):
    title: str
    type: str  # line | bar | pie
    labels: List[str]
    datasets: List[ChartDataset]
    options: Optional[Dict] = None


class ChartGenerationRequest(BaseModel):
    goal_id: str
    prompt: str
    max_charts: int = 3


@router.post("/generate-charts")
async def generate_charts(req: ChartGenerationRequest):
    """
    Creates the detailed prompt for the AI, instructing it on Taglish and specific recommendations.
    """
    baseline = get_goal_baseline(req.goal_id)
    if not baseline:
        raise HTTPException(status_code=404, detail=f"Goal {req.goal_id} not found")

    # Guardrails
    max_charts = max(1, min(req.max_charts, 5))

    # Compose AI prompt using the master prompt function
    ai_instructions = create_master_prompt(baseline, req.prompt)

    charts_payload: Dict[str, Union[str, List[Dict]]] = {"narrative": "", "charts": []}
    ai_failed = False
    try:
        client = get_ai_client()
        if client:
            response = await client.chat.completions.create(
                model="deepseek/deepseek-chat",
                messages=[{"role": "user", "content": ai_instructions}],
                max_tokens=1200,
                temperature=0.5,
            )
            content = response.choices[0].message.content if response and response.choices else None
            logger.info(f"Raw AI response: {content}")
            # Strip markdown code block markers if present
            cleaned = content
            if cleaned:
                cleaned = cleaned.strip()
                if cleaned.startswith('```json'):
                    cleaned = cleaned[7:]
                if cleaned.startswith('```'):
                    cleaned = cleaned[3:]
                if cleaned.endswith('```'):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()
            if cleaned and cleaned.startswith('{'):
                import json
                try:
                    charts_payload = json.loads(cleaned)
                except Exception as e:
                    logger.warning(f"AI response could not be parsed as JSON. Error: {e}")
                    ai_failed = True
            else:
                logger.warning("AI response was empty or not JSON. Using fallback.")
                ai_failed = True
        else:
            logger.warning("AI client is not available.")
            ai_failed = True
    except Exception as e:
        logger.warning(f"AI chart generation failed, falling back. Error: {e}")
        ai_failed = True

    # Fallback if AI unavailable or malformed
    def fallback_charts(baseline: Dict) -> Dict:
        remaining = max(0.0, float(baseline["current_goal_amount"]) - float(baseline["current_amount"]))
        days = max(1, int(baseline.get("days_remaining", 30)))
        per_day_needed = remaining / days
        labels = [f"Day {i}" for i in range(1, 7)]
        required = [round(per_day_needed, 2)] * 6
        pace = [round(per_day_needed * (0.9 + 0.05 * i), 2) for i in range(6)]
        return {
            "narrative": "Nag-forecast ako ng pacing: eto yung daily requirement vs. current pace mo para maabot ang goal on time.",
            "charts": [
                {
                    "title": "Required vs Current Pace",
                    "type": "line",
                    "labels": labels,
                    "datasets": [
                        {"label": "Required per Day", "data": required, "color": "#830000"},
                        {"label": "Current Pace", "data": pace, "color": "#DDB440"},
                    ],
                },
                {
                    "title": "Contribution Breakdown",
                    "type": "pie",
                    "labels": [c['name'] for c in baseline['contributors']],
                    "datasets": [
                        {"label": "Contribution", "data": [c['amount'] for c in baseline['contributors']], "color": ["#830000", "#DDB440", "#4B5320", "#C0C0C0"]},
                    ],
                },
                {
                    "title": "Remaining Amount",
                    "type": "bar",
                    "labels": ["Remaining"],
                    "datasets": [
                        {"label": "Remaining", "data": [remaining], "color": "#830000"},
                    ],
                }
            ],
            "ai_failed": True
        }

    # Validate and normalize charts_payload
    try:
        # Basic structure
        if not isinstance(charts_payload, dict) or "charts" not in charts_payload:
            charts_payload = fallback_charts(baseline)
            ai_failed = True
        charts = charts_payload.get("charts", [])
        if not isinstance(charts, list) or len(charts) == 0:
            charts_payload = fallback_charts(baseline)
            ai_failed = True
            charts = charts_payload.get("charts", [])
        # Truncate to max
        charts_payload["charts"] = charts[:max_charts]
    except Exception:
        charts_payload = fallback_charts(baseline)
        ai_failed = True

    # Pydantic validation
    try:
        validated_charts = [ChartSpec(**c) for c in charts_payload.get("charts", [])]
        charts_payload["charts"] = [c.model_dump() for c in validated_charts]
    except Exception as e:
        logger.warning(f"Chart spec validation failed, using fallback. Error: {e}")
        charts_payload = fallback_charts(baseline)
        ai_failed = True

    result = {
        "baseline": baseline,
        "narrative": charts_payload.get("narrative", ""),
        "charts": charts_payload.get("charts", []),
        "recommendations": charts_payload.get("recommendations", []),
        "generated_at": datetime.now().isoformat(),
    }
    # Add ai_failed flag if fallback was used
    if ai_failed or charts_payload.get("ai_failed"):
        result["ai_failed"] = True
        result["narrative"] = (result["narrative"] + " (AI failed, fallback charts shown)").strip()
    return result