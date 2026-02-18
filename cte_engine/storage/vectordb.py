from qdrant_client import QdrantClient, models
from util.config_loader import settings
from llm_providers.embeddings import embedder
import uuid
import datetime
import asyncio

class VectorDBManager:
    def __init__(self):
        self.client = QdrantClient(url=settings.QDRANT_URL)
        self.collection_name = "reasoning_evidence"
        self.vector_size = embedder.vector_size
        self._ensure_collection()

    def _ensure_collection(self):
        try:
            collections = self.client.get_collections()
            if self.collection_name not in [c.name for c in collections.collections]:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=models.VectorParams(
                        size=self.vector_size, 
                        distance=models.Distance.COSINE
                    )
                )
        except Exception as e:
            print(f"⚠️ VectorDB Init Error: {e}")

    async def store_artifact(self, text: str, metadata: dict):
        try:
            vector = await embedder.embed_text(text)
            point_id = str(uuid.uuid4())
            
            # Run sync client in thread
            await asyncio.to_thread(
                self.client.upsert,
                collection_name=self.collection_name,
                points=[
                    models.PointStruct(
                        id=point_id,
                        vector=vector,
                        payload={
                            "content": text,
                            "timestamp": datetime.datetime.utcnow().isoformat(),
                            **metadata
                        }
                    )
                ]
            )
            return point_id
        except Exception as e:
            print(f"❌ Vector Store Error: {e}")
            return None

    async def search_relevant(self, query: str, limit: int = 5):
        """
        Performs semantic search to find the most relevant evidence chunks.
        """
        try:
            # Generate embedding for the search query (Task + Plan context)
            query_vector = await embedder.embed_text(query)
            
            results = await asyncio.to_thread(
                self.client.search,
                collection_name=self.collection_name,
                query_vector=query_vector,
                limit=limit,
                score_threshold=0.40  # Filter out completely irrelevant noise (low cosine sim)
            )
            
            cleaned_results = []
            for hit in results:
                payload = hit.payload
                # Fallback if metadata is missing
                meta = {k:v for k,v in payload.items() if k != "content"}
                if "url" not in meta: meta["url"] = "internal_memory"
                
                cleaned_results.append({
                    "content": payload.get("content", ""),
                    "metadata": meta,
                    "score": hit.score
                })
                
            return cleaned_results
            
        except Exception as e:
            print(f"❌ Vector Search Error: {e}")
            return []

vector_db = VectorDBManager()