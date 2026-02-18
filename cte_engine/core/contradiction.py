from llm_providers.gemini import llm
import json

class ContradictionEstimator:
    async def analyze(self, task: str, plans: list):
        plan_summary = "\n".join([f"Perspective {p['perspective']}: {p['content'][:300]}..." for p in plans])
        
        prompt = f"""
        ROLE: System 2 Conflict Analyzer.
        TASK: {task}
        
        INITIAL PLANS:
        {plan_summary}
        
        INSTRUCTIONS:
        Analyze implicit conflicts. Determine required specialist agents.
        
        AVAILABLE TYPES:
        - "Factual": Disagreement on hard data.
        - "Causal": Disagreement on predictions (X leads to Y).
        - "Safety": Risks or ethical violations.
        - "Resource": Cost or feasibility.
        
        OUTPUT JSON ONLY:
        {{
            "required_agents": [
                {{ "type": "Factual", "priority": 0.9, "focus_query": "specific question" }}
            ]
        }}
        """
        
        try:
            # Low temp for logic extraction
            resp = await llm.generate(prompt, config={"temperature": 0.2}, json_mode=True)
            cleaned = resp.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)
            return data.get("required_agents", [])
        except Exception as e:
            print(f"❌ Contradiction Analysis Failed: {e}")
            # Fallback
            return [{"type": "Factual", "priority": 1.0, "focus_query": task}]

contradiction_analyzer = ContradictionEstimator()