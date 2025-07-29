from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from uuid import uuid4 #generate unique IDs

router = APIRouter(
    prefix="/groups",
    tags=["groups"]
)

group_db = {} 

class GroupBase(BaseModel):
    name: str
    description: str = ""

class GroupCreate(GroupBase):
    name: str
    manager_id: str

class Group(GroupBase):
    id: str
    members: List[str] 


@router.post("/", response_model=Group)
def create_group(group: GroupCreate):
    group_id = str(uuid4())
    new_group = Group(id=group_id, **group.dict(), members=[group.manager_id])
    #update to DB
    return new_group

@router.get("/", response_model=List[Group])
def get_groups(group_id: str):
    group = group_db.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

    #for db

@router.get("/{group_id}", response_model=Group)
def get_group(group_id: str):
    group = group_db.get(group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@router.delete("/{group_id}", response_model=Group)
def del_group(group_id: str):
    if group_id not in group_db:
        raise HTTPException(status_code=404, detail="Group not found")
    del group_db[group_id]
    return {"detail": "Group deleted successfully"}