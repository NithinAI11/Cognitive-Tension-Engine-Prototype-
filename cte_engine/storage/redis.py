import redis.asyncio as redis
from util.config_loader import settings
import json

class RedisManager:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL, decode_responses=True)

    async def cache_plan(self, key: str, plan_data: dict, ttl: int = 3600):
        await self.redis.setex(key, ttl, json.dumps(plan_data))

    async def get_cached_plan(self, key: str):
        data = await self.redis.get(key)
        return json.loads(data) if data else None

redis_client = RedisManager()