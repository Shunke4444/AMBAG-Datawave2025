from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Union
from datetime import datetime, timedelta
import logging
from uuid import uuid4

# Import AI client and data sources
from .ai_client import get_ai_client
# from .goal import goals, pool_status
# from .groups import group_db
from .mongo import simulation_results_collection, goals_collection, pool_status_collection, groups_collection

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/simulation-old", tags=["simulation"])

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

async def get_goal_baseline(goal_id: str) -> Optional[Dict]:
    goal = await goals_collection.find_one({"goal_id": goal_id})
    if not goal:
        return None

    pool_data = await pool_status_collection.find_one({"goal_id": goal_id})
    if not pool_data:
        pool_data = {}

    # Get contributors from group if available
    contributors = pool_data.get("contributors", [])
    group_id = goal.get("group_id")
    if group_id:
        group = await groups_collection.find_one({"group_id": group_id})
        if group and "members" in group:
            # If group members exist, use them as contributors
            # Each member: { name, amount, ... }
            contributors = [
                {"name": m.get("name", m.get("member_name", "Unknown")), "amount": m.get("amount", 0)}
                for m in group["members"]
            ]

    target_date = goal.get("target_date")
    if isinstance(target_date, str):
        try:
            target_date = datetime.fromisoformat(target_date).date()
        except:
            target_date = datetime.now().date()
    elif not hasattr(target_date, 'isoformat'):
        target_date = datetime.now().date()

    return {
        "goal_id": goal_id,
        "title": goal.get("title", "Untitled Goal"),
        "current_goal_amount": goal.get("goal_amount", 0),
        "current_amount": pool_data.get("current_amount", 0),
        "target_date": target_date.isoformat(),
        "status": goal.get("status", "active"),
        "contributors": contributors,
        "creator": goal.get("creator_name", "Unknown"),
        "days_remaining": ((target_date.date() if isinstance(target_date, datetime) else target_date) - datetime.now().date()).days
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
            except Exception:
                impact["risks"].append("Invalid date format")
        else:
            impact["risks"].append("No deadline provided")
    
    return impact


@router.post("/simulate")
async def run_simulation(req: SimulationRequest):
    """Run the what-if simulation with the given scenarios"""
    logger.info(f"[simulate] Received request: {req.dict()}")
    
    baseline = await get_goal_baseline(req.goal_id)
    if not baseline:
        logger.warning(f"[simulate] Goal not found: {req.goal_id}")
        raise HTTPException(status_code=404, detail=f"Goal {req.goal_id} not found")
    
    all_impacts = []
    for scenario in req.scenarios:
        impact = calculate_scenario_impact(baseline, scenario)
        all_impacts.append(impact)
    
    # Store simulation result in DB
    simulation_id = str(uuid4())
    simulation_result = {
        "simulation_id": simulation_id,
        "goal_id": req.goal_id,
        "scenarios": req.scenarios,
        "baseline": baseline,
        "impacts": all_impacts,
        "created_at": datetime.now(),
        "explain_outcomes": req.explain_outcomes,
        "advisor_mode": req.advisor_mode
    }
    await simulation_results_collection.insert_one(simulation_result)
    
    return {
        "simulation_id": simulation_id,
        "goal_id": req.goal_id,
        "impacts": all_impacts
    }



@router.get("/dashboard")
async def simulation_dashboard():
    """Get overview of all simulation activity"""
    
    total_simulations = await simulation_results_collection.count_documents({})
    unique_goals_list = await simulation_results_collection.distinct("goal_id")
    unique_goals = len(unique_goals_list)
    
    # Count scenario types 
    scenario_types = {}
    all_simulations = await simulation_results_collection.find({}).to_list(length=None)
    for sim in all_simulations:
        for scenario in sim.get("scenarios", []):
            scenario_type = scenario.get("scenario_type")
            if scenario_type:
                scenario_types[scenario_type] = scenario_types.get(scenario_type, 0) + 1


    recent_simulations = await simulation_results_collection.find({}).sort("_id", -1).limit(5).to_list(length=5)
    return {
        "total_simulations": total_simulations,
        "unique_goals_analyzed": unique_goals,
        "scenario_type_breakdown": scenario_types,
        "recent_simulations": recent_simulations,
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
            "title": "Chart Title",
            "type": "bar|line|pie|doughnut|radar|polarArea|scatter|bubble",
            "labels": ["Label1", "Label2", "Label3"],
            "datasets": [
                {{
                    "label": "Dataset Name",
                    "data": [1, 2, 3] or [{{"x": 1, "y": 2}}] for scatter/bubble,
                    "color": "#830000" or ["#830000", "#DDB440", "#4B5320"]
                }}
            ],
            "options": {{}}
        }}
    ]
}}

**Example Response:**
{{
    "narrative": "Kumusta! Tingnan natin yung situation mo... [analysis here]",
    "charts": [
        {{
            "title": "Goal Progress",
            "type": "bar",
            "labels": ["Current", "Remaining"],
            "datasets": [
                {{
                    "label": "Amount (PHP)",
                    "data": [{baseline['current_amount']}, {max(0, baseline['current_goal_amount'] - baseline['current_amount'])}],
                    "color": ["#DDB440", "#830000"]
                }}
            ]
        }}
    ]
}}
'''
def no_goal_selected_response(goal_list, user_prompt=None) -> str:
    """
    Returns a JSON-only prompt for the AI, including the user's goals
    formatted as a Slack-safe bullet list with a friendly Taglish narrative.
    """
    untitled_count = sum(
        1 for g in goal_list if g.get("title", "").lower() in ["untitled goal", "", None]
    )
    titles = [g.get("title", "Untitled Goal") for g in goal_list]
    untitled_note = (
        f"Note: Meron kang {untitled_count} 'Untitled Goal', baka gusto mong i-rename 😉"
        if untitled_count > 0
        else ""
    )
    prompt_line = f"User prompt: '{user_prompt}'" if user_prompt else ""

    return f'''
You are AMBAG AI, a friendly Filipino financial assistant.
The user did not select any goal. {prompt_line}
Respond ONLY with a single valid JSON object (no markdown, no extra text, no HTML tags).

**Instructions:**
1. **Language:** Use conversational Taglish. Be warm, supportive, and approachable.
2. **Narrative:** 
   - Tell the user they haven’t selected any goal yet in a friendly way.
   - Encourage them to choose one from their list.
   - Reference the user's goal list (provided as an array called "goal_titles") in your message, but do NOT format or style them—just mention them naturally in the narrative.
   - If applicable, add this note: "{untitled_note}"
   - Example narrative:  
     "It looks like you haven't sent a goal! Maybe you can check some of your goals here and tell me which one we should focus on!"
3. **Charts:** Always return an empty list for "charts".
4. **Format:** Output ONLY the JSON object below, and include the array of goal titles as "goal_titles".

{{
    "narrative": "Friendly Taglish message referencing the user's goals.",
    "goal_titles": {titles},
}}
'''




@router.post("/generate-charts")
async def generate_charts(req: ChartGenerationRequest):
    """
    Creates the detailed prompt for the AI, instructing it on Taglish and specific recommendations.
    """
    logger.info(f"[generate-charts] Received request: goal_id={req.goal_id}, prompt={req.prompt}, max_charts={req.max_charts}")
    # Conversational flow: If goal_id is missing or invalid, try to match goal title in prompt
    if not req.goal_id or req.goal_id.strip() == "" or req.goal_id.lower() == "none":
        all_goals = await goals_collection.find({}).to_list(length=None)
        prompt_lower = (req.prompt or "").lower()
        matched_goal = None
        for g in all_goals:
            title = str(g.get("title", "")).lower()
            if title and title in prompt_lower:
                matched_goal = g
                break
        if matched_goal:
            logger.info(f"[generate-charts] Found goal by title match: {matched_goal.get('title')} ({matched_goal.get('goal_id')})")
            req.goal_id = matched_goal.get("goal_id")
        else:
            goal_list = [
                {
                    "goal_id": g.get("goal_id"),
                    "title": g.get("title", "Untitled Goal"),
                    "goal_amount": g.get("goal_amount", 0),
                    "target_date": str(g.get("target_date")),
                    "status": g.get("status", "active"),
                }
                for g in all_goals
            ]
            # Use the new markdown bullet list prompt for the AI
            ai_prompt = no_goal_selected_response(goal_list, req.prompt)
            client = get_ai_client()
            try:
                response = await client.chat.completions.create(
                    model="deepseek/deepseek-chat",
                    messages=[{"role": "user", "content": ai_prompt}],
                    max_tokens=300,
                    temperature=0.7,
                )
                ai_message = response.choices[0].message.content if response and response.choices else "Please select a goal to analyze from the list."
            except Exception as e:
                logger.warning(f"AI message generation failed, using fallback. Error: {e}")
                ai_message = "Please select a goal to analyze from the list."
            logger.info(f"[generate-charts] No goal_id provided and no title match. Returning AI-generated message and list of {len(goal_list)} goals.")
            return {
                "goals": goal_list,
                "message": ai_message,
                "prompt_required": True
            }

    baseline = await get_goal_baseline(req.goal_id)
    if not baseline:
        logger.warning(f"[generate-charts] Goal not found: {req.goal_id}")
        all_goals = await goals_collection.find({}).to_list(length=None)
        goal_list = [
            {
                "goal_id": g.get("goal_id"),
                "title": g.get("title", "Untitled Goal"),
                "goal_amount": g.get("goal_amount", 0),
                "target_date": str(g.get("target_date")),
                "status": g.get("status", "active"),
            }
            for g in all_goals
        ]
        return {
            "goals": goal_list,
            "message": f"Goal '{req.goal_id}' not found. Please select a valid goal.",
            "prompt_required": True
        }

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
                max_tokens=900,
                temperature=0.5,
            )
            content = response.choices[0].message.content if response and response.choices else None
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
        contributors = baseline.get('contributors', [])
        pie_labels = [c['name'] for c in contributors] if contributors else ["No contributors"]
        pie_data = [c['amount'] for c in contributors] if contributors else [0]
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
                    "labels": pie_labels,
                    "datasets": [
                        {"label": "Contribution", "data": pie_data, "color": ["#830000", "#DDB440", "#4B5320", "#C0C0C0"]},
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

