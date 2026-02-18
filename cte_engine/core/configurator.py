from llm_providers.gemini import llm
import json

class HyperparameterAgent:
    async def configure(self, task: str):
        prompt = f"""
        ROLE: High-Dimensional LLM Hyperparameter Engineer.
        TASK: {task}
        
        OBJECTIVE: 
        Analyze the nature of the task and strictly tune the LLM generation settings.
        
        AVAILABLE SETTINGS:
        1. Temperature (0.0 - 2.0): Randomness. High for creative, Low for factual/code.
        2. Top_P (0.0 - 1.0): Nucleus Sampling. Low for exactness, High for vocabulary range.
        3. Top_K (1 - 100): Hard cutoff of token possibilities.
        4. Presence_Penalty (-2.0 - 2.0): Higher prevents topic repetition.
        5. Frequency_Penalty (-2.0 - 2.0): Higher prevents word repetition.
        
        SCENARIO GUIDE:
        - CODE/MATH: Temp=0.2, Top_P=0.1, Top_K=10 (Strict, Deterministic)
        - CREATIVE WRITING: Temp=0.9, Top_P=0.95, Presence_Penalty=0.6 (High variance, no repetition)
        - MEDICAL/LEGAL: Temp=0.1, Top_P=0.2 (Zero hallucination tolerance)
        - STRATEGIC REASONING: Temp=0.6, Top_P=0.8 (Balanced analysis)
        
        OUTPUT JSON ONLY:
        {{
            "detected_nature": "e.g., Creative Exploratory | Strict Logical | Code Generation",
            "rationale": "One sentence explaining why these settings were chosen.",
            "config": {{
                "temperature": float,
                "top_p": float,
                "top_k": int,
                "presence_penalty": float,
                "frequency_penalty": float,
                "max_output_tokens": 8192
            }}
        }}
        """
        
        default_config = {
            "temperature": 0.7, "top_p": 0.9, "top_k": 40, 
            "presence_penalty": 0.0, "frequency_penalty": 0.0, "max_output_tokens": 8192
        }
        
        try:
            # We use a static config for the configurator itself to ensure valid JSON
            resp = await llm.generate(prompt, config={"temperature": 0.2}, json_mode=True)
            cleaned = resp.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)
            
            return {
                "detected_nature": data.get("detected_nature", "General Analysis"),
                "rationale": data.get("rationale", "Standard configuration applied."),
                "config": data.get("config", default_config)
            }
        except Exception as e:
            print(f"⚠️ Configurator Error: {e}")
            return {
                "detected_nature": "System Default",
                "rationale": "Agent failed, using fallback safe settings.",
                "config": default_config
            }

config_agent = HyperparameterAgent()