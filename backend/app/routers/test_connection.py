# test_connection.py
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
async def test_connection():
    client = AsyncIOMotorClient(MONGO_URI)
    try:
        await client.admin.command('ping')
        print("Successfully connected to MongoDB!")
        
        # List databases
        db_list = await client.list_database_names()
        print(f"Available databases: {db_list}")
        
    except Exception as e:
        print(f"Connection failed: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test_connection())