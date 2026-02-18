# FILE: cte_engine/core/router.py
import random

class DecisionRouter:
    async def decide(self, state: dict) -> str:
        """
        Deterministic OODA Loop Logic with HITL Awareness.
        """
        divergence = state.get("divergence_score", 0.0)
        iteration = state.get("iteration_count", 0)
        max_iter = state.get("max_iterations", 2)
        evidence = state.get("research_evidence", [])
        hitl_on = state.get("hitl_enabled", False)
        last_feedback = state.get("human_feedback", "")

        # 1. HARD STOP
        if iteration >= max_iter:
            return "synthesize"

        # 2. DATA STARVATION CHECK
        if len(evidence) == 0:
            return "chaos_injection"

        # 3. CRITICAL HITL INTERVENTION CHECK
        # Only trigger if:
        # A. HITL is ON
        # B. We are NOT in the very first iteration (too early to interrupt)
        # C. Divergence is in the "Ambiguity Zone" (0.45 - 0.75) where automation struggles
        # D. We haven't just received feedback (avoids loop)
        
        is_ambiguous = 0.45 <= divergence <= 0.75
        is_critical_iteration = iteration > 0 
        
        if hitl_on and is_ambiguous and is_critical_iteration and not last_feedback:
            print(f"✋ Router: Critical Ambiguity ({divergence:.2f}). Requesting Human Review.")
            return "human_review"

        # 4. STANDARD AUTOMATION LOGIC
        if iteration == 0:
            if divergence < 0.5:
                return "chaos_injection"
            else:
                return "refine"

        # Groupthink Check
        if divergence < 0.40:
            print(f"Router: Divergence {divergence:.2f} too low (Groupthink). Injecting Chaos.")
            return "chaos_injection"

        # Confusion Check
        if divergence > 0.85:
            print(f"Router: Divergence {divergence:.2f} too high (Confusion). Refining.")
            return "refine"
            
        print(f"✅ Router: Stable Dialectic ({divergence:.3f}). Proceeding to Synthesis.")
        return "synthesize"

decision_router = DecisionRouter()