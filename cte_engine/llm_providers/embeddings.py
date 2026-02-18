# FILE: cte_engine/llm_providers/embeddings.py
from fastembed import TextEmbedding
import numpy as np
from typing import List

class LocalEmbeddingProvider:
    def __init__(self):
        # Uses standard "all-MiniLM-L6-v2" which is fast and free
        # First run will download model (~80MB) to local cache
        print("📥 Loading Local Embedding Model (all-MiniLM-L6-v2)...")
        self.model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5") 
        self.vector_size = 384
        print("✅ Embedding Model Loaded.")

    async def embed_text(self, text: str) -> List[float]:
        """Generates embeddings locally on CPU."""
        try:
            # FastEmbed generators return numpy arrays
            embeddings = list(self.model.embed([text]))
            return embeddings[0].tolist()
        except Exception as e:
            print(f"❌ Embedding Error: {e}")
            return [0.0] * self.vector_size

    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        try:
            embeddings = list(self.model.embed(texts))
            return [e.tolist() for e in embeddings]
        except Exception as e:
            print(f"❌ Batch Embedding Error: {e}")
            return [[0.0] * self.vector_size for _ in texts]

embedder = LocalEmbeddingProvider()