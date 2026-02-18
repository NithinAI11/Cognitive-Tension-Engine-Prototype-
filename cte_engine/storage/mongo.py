from motor.motor_asyncio import AsyncIOMotorClient
from util.config_loader import settings
from bson import ObjectId

class MongoManager:
    def __init__(self):
        self.client = None
        self.db = None

    async def connect(self):
        if self.client is not None:
            return

        print(f"🔌 Connecting to MongoDB at {settings.MONGO_URI}...")
        try:
            self.client = AsyncIOMotorClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=2000 
            )
            await self.client.server_info()
            self.db = self.client.cte_engine
            print(f"✅ MongoDB Connected successfully")
        except Exception as e:
            print(f"❌ MongoDB Connection Failed: {e}")
            self.client = None
            self.db = None

    async def save_run(self, run_data: dict):
        if self.db is None:
            await self.connect()
            if self.db is None:
                return "error_no_db"
        
        try:
            result = await self.db.runs.insert_one(run_data)
            return str(result.inserted_id)
        except Exception as e:
            print(f"⚠️ Insert Failed: {e}")
            return "error_insert_failed"

    async def get_recent_runs(self, limit: int = 20):
        if self.db is None:
            await self.connect()
            if self.db is None: return []
            
        try:
            # Projection to save bandwidth (exclude huge fields like raw plans if just listing)
            cursor = self.db.runs.find(
                {}, 
                {"task": 1, "timestamp": 1, "metrics": 1, "synthesis": 1}
            ).sort("timestamp", -1).limit(limit)
            
            runs = await cursor.to_list(length=limit)
            for run in runs:
                run["id"] = str(run["_id"])
                del run["_id"]
            return runs
        except Exception as e:
            print(f"⚠️ Mongo Fetch Error: {e}")
            return []

    async def get_run(self, run_id: str):
        if self.db is None:
            await self.connect()
        
        try:
            run = await self.db.runs.find_one({"_id": ObjectId(run_id)})
            if run:
                run["id"] = str(run["_id"])
                del run["_id"]
            return run
        except Exception as e:
            print(f"⚠️ Mongo Get Details Error: {e}")
            return None

mongo_db = MongoManager()