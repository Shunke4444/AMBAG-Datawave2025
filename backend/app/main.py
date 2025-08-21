from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from routers import (
    groups,
    goal,
    chatbot,
    scheduler_api,
    ai_tools_clean,
    simulation_old,
    users,
    request,
    balance,
    allocate,
)
from routers.scheduler import start_scheduler
from typing import List
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Goofy augh AMBAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(users.router)
app.include_router(groups.router)
app.include_router(goal.router)
app.include_router(chatbot.router)
app.include_router(scheduler_api.router)
app.include_router(ai_tools_clean.router)
app.include_router(simulation_old.router)
app.include_router(request.router)
app.include_router(balance.router)
app.include_router(allocate.router)

group_balances = {}
transactions = []

@app.on_event("startup")
async def startup_event():
    start_scheduler()  # Start the background scheduler

@app.get("/")
def read_root():
    return Response("working na to")


