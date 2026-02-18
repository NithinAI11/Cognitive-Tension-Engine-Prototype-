import google.generativeai as genai
from util.config_loader import settings
import json
import asyncio
import random
import traceback
from google.generativeai.types import HarmCategory, HarmBlockThreshold, GenerationConfig

class GeminiProvider:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.DEFAULT_MODEL
        self.is_mock = False
        # Semaphore to prevent hitting rate limits too aggressively in parallel
        self._semaphore = asyncio.Semaphore(2) 

        if not self.api_key:
            print("⚠️ GeminiProvider: API Key missing. Switching to MOCK MODE.")
            self.is_mock = True
        else:
            try:
                genai.configure(api_key=self.api_key)
            except Exception as e:
                print(f"⚠️ Gemini Configuration Error: {e}")
                self.is_mock = True

    async def generate(self, prompt: str, config: dict = None, json_mode: bool = False, **kwargs):
        """
        Generates content with robust error handling for Safety Blocks and Rate Limits.
        """
        # --- 1. Handle Mock Mode ---
        if self.is_mock:
            await asyncio.sleep(0.5)
            if json_mode: return json.dumps({"decision": "synthesize", "rationale": "Mock Response"})
            return "Mock response from CTE Engine."

        # --- 2. Configuration Setup ---
        if config is None: config = {}
        # Allow kwargs to override config
        if 'temperature' in kwargs: config['temperature'] = kwargs['temperature']

        try:
            generation_config = GenerationConfig(
                temperature=config.get("temperature", 0.7),
                top_p=config.get("top_p", 0.95),
                top_k=config.get("top_k", 40),
                max_output_tokens=config.get("max_output_tokens", 8192),
                presence_penalty=config.get("presence_penalty", 0.0),
                frequency_penalty=config.get("frequency_penalty", 0.0),
                stop_sequences=config.get("stop_sequences", []),
                response_mime_type="application/json" if json_mode else "text/plain"
            )
        except Exception:
            # Fallback if specific config params are invalid for the model version
            generation_config = GenerationConfig(
                temperature=0.7,
                max_output_tokens=8192,
                response_mime_type="application/json" if json_mode else "text/plain"
            )

        # --- 3. Safety Settings ---
        # We attempt to allow everything, but Gemini may still block extreme content.
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        model = genai.GenerativeModel(
            self.model_name, 
            generation_config=generation_config, 
            safety_settings=safety_settings
        )

        # --- 4. Execution Loop with Retries ---
        max_retries = 3
        attempt = 0
        
        # Define the Fallback response here to ensure consistency
        fallback_json = json.dumps({
            "error": "Safety Block", 
            "rationale": "The strategic plan was flagged by safety filters.",
            "decision": "refine", # Safe default for router
            "content": "Content Redacted due to Safety Policies."
        })
        fallback_text = "⚠️ [SYSTEM REDACTED] The generated content was flagged by safety filters. Please refine the directive."

        async with self._semaphore:
            while attempt < max_retries:
                try:
                    # Exponential Backoff with Jitter
                    if attempt > 0:
                        wait_time = (2 ** attempt) + random.uniform(0, 1)
                        print(f"⏳ Gemini Rate Limit hit. Retrying in {wait_time:.2f}s...")
                        await asyncio.sleep(wait_time)

                    response = await model.generate_content_async(prompt)
                    
                    # --- CRITICAL SAFETY CHECK START ---
                    
                    # Check 1: Prompt Feedback (Did the prompt itself trigger a block?)
                    if response.prompt_feedback and response.prompt_feedback.block_reason:
                        print(f"🛑 Prompt Blocked! Reason: {response.prompt_feedback.block_reason}")
                        return fallback_json if json_mode else fallback_text

                    # Check 2: No Candidates Returned
                    if not response.candidates:
                        print("⚠️ Gemini returned no candidates (Empty Response).")
                        return fallback_json if json_mode else fallback_text

                    candidate = response.candidates[0]

                    # Check 3: Finish Reason
                    # 1 = STOP (Success), 2 = MAX_TOKENS (Success but cut off)
                    # 3 = SAFETY, 4 = RECITATION (Copyright)
                    # See: https://ai.google.dev/api/python/google/generativeai/types/FinishReason
                    if candidate.finish_reason not in [1, 2]:
                        print(f"⚠️ Gemini Generation Blocked. Finish Reason: {candidate.finish_reason} (3=Safety)")
                        # DO NOT RETRY on safety blocks (it will just block again)
                        return fallback_json if json_mode else fallback_text

                    # Check 4: Valid Parts (The specific error you faced)
                    if not candidate.content or not candidate.content.parts:
                        print("⚠️ Gemini Candidate has no content parts (Ghost Block).")
                        return fallback_json if json_mode else fallback_text

                    # --- CRITICAL SAFETY CHECK END ---

                    # If we passed all checks, it is safe to access .text
                    return response.text

                except Exception as e:
                    error_str = str(e).lower()
                    
                    # Retry only on specific transient errors
                    is_transient = any(x in error_str for x in ["429", "503", "quota", "resource exhausted", "internal error"])
                    
                    if is_transient:
                        attempt += 1
                        continue
                    else:
                        print(f"❌ Gemini Critical Error: {str(e)}")
                        traceback.print_exc()
                        return fallback_json if json_mode else f"System Error: {str(e)}"
            
            # If loop finishes without success
            print("❌ Gemini Max Retries Exceeded.")
            return fallback_json if json_mode else "Error: Service unavailable (Timeout)."

llm = GeminiProvider()