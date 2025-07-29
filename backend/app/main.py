from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from routers import groups, goal, chatbot, ai_tools  # Add ai_tools
from routers.scheduler import start_scheduler
from typing import List
from pydantic import BaseModel

app = FastAPI(title="Goofy augh AMBAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(groups.router)
app.include_router(goal.router)
app.include_router(chatbot.router)
app.include_router(ai_tools.router) # for Agentic  # still on the process of implementing


group_balances = {}
transactions = []

@app.on_event("startup")
async def startup_event():
    start_scheduler() # Start the background scheduler # still on the process of implementing

@app.get("/")
def read_root():
    return Response("working na to")


