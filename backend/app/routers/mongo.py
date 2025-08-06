from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["ambag_database"]

users_collection = db["users"]
member_requests_collection = db["member_requests"]
# Add more collections as needed, like:
# goals_collection = db["goals"]
# plans_collection = db["plans"]
