from llm_providers.gemini import llm
import json
import asyncio
import re

class MetaCritic:
    async def evaluate_plans(self, task: str, plans: list):
        async def review_single(plan):
            prompt = f"""
            ROLE: Draconian Logic Evaluator.
            TASK: {task}
            PLAN ID: {plan['id']} ({plan.get('perspective', 'General')})
            
            CONTENT:
            {plan['content']}
            
            INSTRUCTIONS:
            1. First, perform a ruthlessly honest **Internal Monologue** about the flaws, assumptions, and risks in this plan. Be harsh.
            2. Then, output the specific scoring JSON.
            3. Use the separator "---JSON_START---" between your thought and the JSON.
            
            JSON FORMAT:
            {{
                "logic": int (0-10),
                "assumptions": int (0-10), 
                "grounding": int (0-10),
                "risk": int (0-10),
                "rationale": "One specific sentence for the final report."
            }}
            """
            try:
                # Temperature 0.2 allows for some creative critique while keeping JSON valid
                resp = await llm.generate(prompt, config={"temperature": 0.2}, json_mode=False)
                
                thought = "Analysis unavailable."
                json_str = "{}"
                
                # Split Thought vs JSON
                if "---JSON_START---" in resp:
                    parts = resp.split("---JSON_START---")
                    thought = parts[0].strip()
                    json_str = parts[1].strip()
                else:
                    # Fallback regex to find start of JSON
                    match = re.search(r'\{.*\}', resp, re.DOTALL)
                    if match:
                        json_str = match.group(0)
                        thought = resp.replace(json_str, "").strip()
                
                # Clean JSON
                json_str = json_str.replace("```json", "").replace("```", "").strip()
                scores = json.loads(json_str)
                
                safe_scores = {
                    "logic": scores.get("logic", 0),
                    "assumptions": scores.get("assumptions", scores.get("adherence", 0)),
                    "grounding": scores.get("grounding", 0),
                    "risk": scores.get("risk", 0)
                }
                
                return { 
                    "plan_id": plan['id'], 
                    "thought": thought,
                    "scores": safe_scores, 
                    "rationale": scores.get("rationale", "No rationale provided.") 
                }
            except Exception as e:
                print(f"Critic Error on Plan {plan['id']}: {e}")
                return { 
                    "plan_id": plan['id'], 
                    "thought": f"Evaluation crashed: {str(e)}",
                    "scores": {"logic": 0, "assumptions": 0, "grounding": 0, "risk": 0}, 
                    "rationale": "Evaluation Failed." 
                }

        reviews = await asyncio.gather(*[review_single(p) for p in plans])
        return reviews

critic = MetaCritic()