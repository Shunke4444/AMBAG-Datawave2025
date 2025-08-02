from fastapi import APIRouter, HTTPException
from .scheduler import trigger_manual_goal_analysis, get_scheduler_status
from pydantic import BaseModel

router = APIRouter(prefix="/scheduler", tags=["scheduler"])

class ManualAnalysisRequest(BaseModel):
    goal_id: str

@router.get("/status")
def scheduler_status():
    """Get current scheduler status and statistics"""
    return get_scheduler_status()

@router.post("/analyze-goal")
async def manual_goal_analysis(request: ManualAnalysisRequest):
    """Manually trigger AI analysis for a specific goal"""
    try:
        result = await trigger_manual_goal_analysis(request.goal_id)
        return {"message": result, "goal_id": request.goal_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

@router.get("/health")
def scheduler_health():
    """Check if scheduler is running properly"""
    return {
        "status": "healthy",
        "message": "AI Goal Monitoring Scheduler is operational",
        "features": [
            "Deadline monitoring",
            "Contribution pattern analysis", 
            "Near completion optimization",
            "Payment processing alerts",
            "Real-time goal optimization"
        ]
    }
