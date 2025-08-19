# Script to sync pool_status_collection with goals_collection
# For each goal in goals_collection, ensure a corresponding pool_status_collection entry exists.

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

MONGO_URI = "mongodb://localhost:27017"  # Update if needed
db_name = "ambag"  # Update if your DB name is different

goals_collection_name = "goals"
pool_status_collection_name = "pool_status"

async def sync_pool_status():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[db_name]
    goals_collection = db[goals_collection_name]
    pool_status_collection = db[pool_status_collection_name]

    async for goal in goals_collection.find({}):
        goal_id = goal.get("goal_id")
        if not goal_id:
            continue
        pool = await pool_status_collection.find_one({"goal_id": goal_id})
        if not pool:
            # Create initial pool status for this goal
            pool_doc = {
                "goal_id": goal_id,
                "current_amount": 0.0,
                "contributors": [],
                "created_at": datetime.now().isoformat()
            }
            await pool_status_collection.insert_one(pool_doc)
            print(f"Created pool status for goal_id: {goal_id}")
        else:
            print(f"Pool status already exists for goal_id: {goal_id}")
    print("Sync complete.")
    client.close()

if __name__ == "__main__":
    asyncio.run(sync_pool_status())
