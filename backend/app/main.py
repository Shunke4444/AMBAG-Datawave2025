from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from routers import groups, goal
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


group_balances = {}
transactions = []

@app.get("/")
def read_root():
    return Response("working na to")


