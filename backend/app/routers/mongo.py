from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = AsyncIOMotorClient(MONGO_URI)
db = client["ambag_database"]

users_collection = db["users"]
member_requests_collection = db["member_requests"]
groups_collection = db["groups"]
goals_collection = db["goals"]
pool_status_collection = db["pool_status"]
pending_goals_collection = db["pending_goals"]
auto_payment_queue_collection = db["auto_payment_queue"]
plans_collection = db["plans_collection"]
virtual_balances_collection = db["virtual_balances"]
request_collection = db["requests"]

smart_reminders_collection = db["smart_reminders"]
notifications_collection = db["notifications"]
executed_actions_collection = db["executed_actions"]

conversations_collection = db["conversations"]
simulation_results_collection = db["simulation_results"]