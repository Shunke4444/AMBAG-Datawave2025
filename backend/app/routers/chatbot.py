from fastapi import APIRouter, HTTPException, Request, Depends
from .ai_client import get_ai_client
from pymongo import ReturnDocument
from .mongo import conversations_collection
from datetime import datetime
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
    # Get or create session ID
    session_id = chat_request.session_id or str(uuid.uuid4())
    
    # Find or initialize conversation in MongoDB
    conversation = await conversations_collection.find_one_and_update(
        {"session_id": session_id},
        {
            "$setOnInsert": {  # Only set these fields if document doesn't exist
                "session_id": session_id,
                "messages": [{"role": "system", "content": SYSTEM_PROMPT}],
                "created_at": datetime.now()
            }
        },
        upsert=True,
        return_document=ReturnDocument.AFTER
    )
    
    # Add user message
    user_message = {
        "role": "user", 
        "content": chat_request.prompt,
        "timestamp": datetime.utcnow()
    }
    
    await conversations_collection.update_one(
        {"session_id": session_id},
        {"$push": {"messages": user_message}}
    )
    
    # Get updated conversation with user message
    updated_conversation = await conversations_collection.find_one(
        {"session_id": session_id}
    )
    
    # Generate AI response
    response = await ai_client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=[{k: m[k] for k in ("role", "content")} for m in updated_conversation["messages"]],
        max_tokens=1000,
        temperature=0.3,
    )
    
    # Add AI response to conversation
    ai_message = {
        "role": "assistant",
        "content": response.choices[0].message.content,
        "timestamp": datetime.utcnow()
    }
    
    await conversations_collection.update_one(
        {"session_id": session_id},
        {"$push": {"messages": ai_message}}
    )
    
    return {
        "response": ai_message["content"],
        "session_id": session_id
    }