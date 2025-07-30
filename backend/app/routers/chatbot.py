# chatbot.py
from fastapi import APIRouter, HTTPException, Request, Depends
from .ai_client import get_ai_client
from pydantic import BaseModel
from typing import Optional, List, Dict
import uuid

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatRequest(BaseModel):
    prompt: str
    session_id: Optional[str] = None

conversations: Dict[str, List[Dict]] = {}

SYSTEM_PROMPT = """You are AMBAG Financial Assistant, an AI designed to help individuals—especially those from low to middle-income households—who struggle to build financial stability and freedom on their own. 

Your mission is to:
- Provide practical, actionable financial advice
- Help users understand collaborative saving strategies
- Guide users on building emergency funds, saving for bills, and managing shared expenses
- Offer encouragement and support for financial goal achievement
- Explain how shared financial ecosystems can help families, friends, and partners work together

You should:
- Use Taglish (Tagalog-English) to communicate effectively with users
- The sentences should be short and easy to understand, 1 to 2 sentences.

Always be:
- Empathetic and understanding of financial struggles
- Practical and realistic in your advice
- Friendly and approachable
- Clear and easy to understand
- Focused on collaborative financial solutions

Help users build financial stability through smart planning, shared goals, and community support."""

@router.post("/ask")
async def ask_ai(chat_request: ChatRequest, ai_client=Depends(get_ai_client)):
    session_id = chat_request.session_id or str(uuid.uuid4())
    
    if session_id not in conversations:
        conversations[session_id] = []
        # Add system prompt only for new conversations
        conversations[session_id].append({"role": "system", "content": SYSTEM_PROMPT})

    conversations[session_id].append({"role": "user", "content": chat_request.prompt})
    
    response = await ai_client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=conversations[session_id],  # Send full history including system prompt
        max_tokens=1000,
        temperature=0.3,
    )
    
    ai_response = response.choices[0].message.content
    conversations[session_id].append({"role": "assistant", "content": ai_response})
    
    return {"response": ai_response, "session_id": session_id}