from core.math_engine import math_engine
from llm_providers.embeddings import embedder
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import asyncio

class AdvancedScoring:
    def __init__(self):
        self.alpha = 2.0  
        self.gamma = 1.0  
        self.lam = 0.5    
        self.mu = 1.0     
        
    async def batch_score(self, plans: list, reviews: list, evidence: list):
        """
        Scores all plans. Guarantees a result for every plan ID.
        """
        results = {}
        if not plans: return results

        try:
            # 1. Embeddings & Graph (Safe Mode)
            try:
                plan_texts = [p.get('content', '')[:1000] for p in plans]
                plan_embeddings = await embedder.embed_batch(plan_texts)
                
                evidence_embeddings = []
                if evidence:
                    ev_texts = [e.get('content', '')[:500] for e in evidence]
                    evidence_embeddings = await embedder.embed_batch(ev_texts)
                
                # Build Graph
                nodes = [p['id'] for p in plans]
                edges = []
                for i in range(len(plans)):
                    for j in range(i + 1, len(plans)):
                        sim = cosine_similarity([plan_embeddings[i]], [plan_embeddings[j]])[0][0]
                        dist = 1.0 - sim
                        if dist > 0.05: 
                            edges.append((plans[i]['id'], plans[j]['id'], float(dist)))
                
                spectral_scores = math_engine.compute_spectral_score(nodes, edges)
            except Exception as e:
                print(f"⚠️ Scoring Vector/Graph Error: {e}")
                plan_embeddings = None
                evidence_embeddings = None
                spectral_scores = {}
                edges = []

            # 2. Score Each Plan
            for idx, plan in enumerate(plans):
                p_id = plan['id']
                
                # Defaults
                E_U, I_p, R_risk, S_spec, C_p = 0.5, 0.0, 0.5, 0.0, 0.0

                try:
                    # A. Utility
                    plan_reviews = [r for r in reviews if r['plan_id'] == p_id]
                    if plan_reviews:
                        raw_logic = np.mean([r['scores'].get('logic', 0) for r in plan_reviews])
                        raw_risk = np.mean([r['scores'].get('risk', 0) for r in plan_reviews])
                        E_U = raw_logic / 10.0
                        R_risk = math_engine.compute_cvar([raw_risk], alpha=0.1)
                    
                    # B. Info Gain
                    if evidence_embeddings and plan_embeddings:
                        sim_matrix = cosine_similarity([plan_embeddings[idx]], evidence_embeddings)[0]
                        I_p = math_engine.compute_information_gain(sim_matrix.tolist())

                    # C. Spectral & Conflict
                    S_spec = spectral_scores.get(p_id, 0.0)
                    my_edges = [w for u, v, w in edges if u == p_id or v == p_id]
                    C_p = np.mean(my_edges) if my_edges else 0.0

                except Exception as inner_e:
                    print(f"⚠️ Scoring Calculation Error for {p_id}: {inner_e}")

                # Final Calc
                final_score = E_U + (self.alpha * I_p) - (self.gamma * R_risk) - (self.lam * C_p) + (self.mu * S_spec)
                
                results[p_id] = {
                    "total": float(final_score),
                    "components": {
                        "Utility": float(E_U),
                        "InfoGain": float(self.alpha * I_p),
                        "RiskPenalty": float(-(self.gamma * R_risk)),
                        "Conflict": float(-(self.lam * C_p)),
                        "Spectral": float(self.mu * S_spec)
                    },
                    "metrics": {
                        "E_U": float(E_U),
                        "I_p": float(I_p),
                        "CVaR": float(R_risk),
                        "S_spec": float(S_spec),
                        "Conflict": float(C_p)
                    }
                }

        except Exception as e:
            print(f"❌ Critical Scoring Failure: {e}")
            # Emergency Fallback
            for p in plans:
                results[p['id']] = { "total": 0.0, "components": {}, "metrics": {} }

        return results

advanced_scorer = AdvancedScoring()