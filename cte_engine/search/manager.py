import httpx
from util.config_loader import settings
import asyncio
import random
from llm_providers.gemini import llm

class SearchManager:
    def __init__(self):
        self.searx_url = settings.SEARXNG_URL
        self.tavily_key = settings.TAVILY_API_KEY
        self.client = httpx.AsyncClient(timeout=15.0)
        
        # Engines to rotate through if one fails (avoiding DDG as primary if it's blocking)
        self.engines = ["google", "bing", "brave", "qwant", "duckduckgo", "wikipedia"]

    async def search(self, query: str, limit: int = 5):
        # 1. Try SearxNG with Engine Rotation
        try:
            # Shuffle engines to distribute load
            rotation = random.sample(self.engines, len(self.engines))
            
            for engine in rotation:
                try:
                    # Add Jitter (Human-like delay) to prevent rate limits
                    await asyncio.sleep(random.uniform(0.5, 1.5))
                    
                    print(f"🔍 Attempting search via {engine}...")
                    results = await self._search_searxng(query, limit, engine)
                    
                    if results:
                        return results
                        
                except Exception as e:
                    # If this engine fails (CAPTCHA), continue to the next loop
                    print(f"⚠️ Engine '{engine}' failed: {str(e)}. Rotating...")
                    continue
                    
        except Exception as e:
            print(f"⚠️ SearxNG All Engines Failed: {e}")

        # 2. Try Tavily Fallback
        if self.tavily_key:
            try:
                print(f"🔄 Switching to Tavily for query: {query[:20]}...")
                results = await self._search_tavily(query, limit)
                if results: return results
            except Exception as e:
                print(f"❌ Tavily failed: {e}")
        
        # 3. CRITICAL FALLBACK: LLM Simulation
        print(f"⚠️ ALL SEARCH ENGINES FAILED. Engaging Semantic Simulation.")
        return await self._simulate_search_result(query)

    async def _search_searxng(self, query: str, limit: int, engine: str):
        # Explicitly request specific engine to bypass blocked ones
        params = {
            "q": query, 
            "format": "json", 
            "engines": engine,
            "language": "en-US"
        }
        
        resp = await self.client.get(f"{self.searx_url}/search", params=params)
        
        # Check for CAPTCHA/Rate Limit HTML responses disguised as 200 OK
        if "CAPTCHA" in resp.text or "rate limit" in resp.text.lower():
            raise Exception("Rate Limit/Captcha detected")
            
        resp.raise_for_status()
        data = resp.json()
        
        normalized = []
        for res in data.get("results", [])[:limit]:
            normalized.append({
                "title": res.get("title", "No Title"),
                "url": res.get("url", "#"),
                "content": res.get("content", ""),
                "source": f"searxng-{engine}"
            })
        return normalized

    async def _search_tavily(self, query: str, limit: int):
        payload = {
            "api_key": self.tavily_key,
            "query": query,
            "search_depth": "basic",
            "max_results": limit
        }
        resp = await self.client.post(
            "https://api.tavily.com/search",
            json=payload
        )
        resp.raise_for_status()
        data = resp.json()
        
        normalized = []
        for res in data.get("results", [])[:limit]:
            normalized.append({
                "title": res.get("title", "No Title"),
                "url": res.get("url", "#"),
                "content": res.get("content", ""),
                "source": "tavily"
            })
        return normalized

    async def _simulate_search_result(self, query: str):
        prompt = f"""
        TASK: Simulate a search engine result snippet for: "{query}"
        CONTEXT: The search API is down. Provide a realistic, factual paragraph 
        that represents what a search engine would likely return.
        Mark it clearly as [SIMULATED KNOWLEDGE].
        """
        try:
            content = await llm.generate(prompt, config={"temperature": 0.3})
            return [{
                "title": f"Simulated Result: {query}",
                "url": "internal://simulation",
                "content": content,
                "source": "llm_simulation"
            }]
        except Exception:
            return [{
                "title": "System Failure",
                "url": "internal://error",
                "content": "Search infrastructure unreachable.",
                "source": "system"
            }]

search_manager = SearchManager()