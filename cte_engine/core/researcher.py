import asyncio
from search.manager import search_manager
from storage.vectordb import vector_db
import datetime
import re

class ResearchSwarm:
    def __init__(self):
        # Limit concurrent searches to 2 to prevent Thundering Herd
        self._semaphore = asyncio.Semaphore(2)

    async def launch_swarm(self, agent_configs: list):
        tasks = []
        for config in agent_configs:
            tasks.append(self._run_single_agent(config))
        
        results = await asyncio.gather(*tasks)
        
        flat_results = [item for sublist in results for item in sublist]
        return flat_results

    def _is_garbage_content(self, title: str, content: str) -> bool:
        """
        Heuristic filter to drop dictionary definitions, math homework, and captcha pages.
        """
        text = (title + " " + content).lower()
        
        # 1. Dictionary / Definition spam
        if "definition & meaning" in text or "merriam-webster" in text or "dictionary.com" in text:
            return True
        
        # 2. Homework / Math Spam (Brainly, etc)
        if "brainly" in text or "evaluate:" in text or "solve for x" in text or "show your work" in text:
            return True
            
        # 3. Technical junk
        if "captcha" in text or "access denied" in text or "click here" in text:
            return True
            
        return False

    async def _run_single_agent(self, config):
        query = config.get("focus_query", "")
        agent_type = config.get("type", "General")
        
        # Expand query if it's too short to avoid dictionary results
        if len(query.split()) < 3:
            query = f"{query} analysis and strategic context"

        # Acquire lock before searching
        async with self._semaphore:
            try:
                # Increased limit to allow for filtering
                raw_results = await search_manager.search(query, limit=5)
            except Exception as e:
                print(f"❌ Agent {agent_type} crashed: {e}")
                raw_results = []

        artifacts = []
        
        if not raw_results:
             return [{
                "id": str(datetime.datetime.now().timestamp()),
                "query": query,
                "content": f"SEARCH FAILED: Could not retrieve data for '{query}'.",
                "source_url": "internal://error",
                "source_type": "system_error",
                "contradiction_type": agent_type,
                "timestamp": datetime.datetime.utcnow().isoformat()
            }]

        for res in raw_results:
            title = res.get('title', '')
            content_snippet = res.get('content', '')
            
            # FILTER: Skip garbage before it enters the system
            if self._is_garbage_content(title, content_snippet):
                continue
                
            full_content = f"{title} - {content_snippet}"
            
            metadata = {
                "url": res['url'],
                "source_type": res['source'],
                "agent_type": agent_type,
                "contradiction_query": query
            }
            
            # Store in Vector DB for Semantic Retrieval later
            await vector_db.store_artifact(full_content, metadata)
            
            # Add to state (for logging/UI mostly, Synthesizer will use Vector DB)
            artifacts.append({
                "id": str(datetime.datetime.now().timestamp()),
                "query": query,
                "content": full_content,
                "source_url": res['url'],
                "source_type": res['source'],
                "contradiction_type": agent_type,
                "timestamp": datetime.datetime.utcnow().isoformat()
            })
            
        return artifacts

research_swarm = ResearchSwarm()