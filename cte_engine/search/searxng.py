import httpx
from util.config_loader import settings

class SearchEngine:
    async def search(self, query: str):
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"{settings.SEARXNG_URL}/search",
                    params={"q": query, "format": "json"}
                )
                if resp.status_code == 200:
                    return resp.json().get("results", [])[:3]
        except Exception:
            # Fallback logic logic would go here
            return []
        return []

search_engine = SearchEngine()