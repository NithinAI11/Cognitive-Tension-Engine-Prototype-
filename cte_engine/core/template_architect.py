from llm_providers.gemini import llm
import json

class TemplateArchitect:
    async def design_template(self, task: str, nature: str, plans: list):
        """
        Dynamically designs a markdown report structure based on the task nature.
        """
        prompt = f"""
        ROLE: Senior Information Architect.
        TASK: {task}
        DETECTED NATURE: {nature}
        
        OBJECTIVE:
        Design the perfect Markdown structure (Skeleton) for the final report.
        Do NOT write the content. Just define the Headers and the *Type* of content that goes there.
        
        REQUIREMENTS:
        1. Tailor the structure to the domain (e.g., Financial tasks need Data Tables, Coding tasks need Architecture blocks).
        2. Include a specific section for "Data & Evidence" where citations will be aggregated.
        3. Ensure there is an "Executive Verdict" at the top.
        
        OUTPUT FORMAT (Return the raw Markdown string that the writer will fill):
        
        # 🏁 [Dynamic Title based on task]
        
        ## ⚡ Executive Verdict
        {{Synthesize the final decision here}}
        
        ## [Section 2 Title]
        {{Instructions for writer...}}
        
        ...
        """
        
        try:
            # We want a creative structure, so slightly higher temp
            template = await llm.generate(prompt, config={"temperature": 0.5})
            return template
        except Exception as e:
            print(f"⚠️ Architect Error: {e}")
            # Fallback Template
            return """
            # 🏁 Strategic Intelligence Brief
            ## ⚡ Executive Verdict
            {Verdict}
            ## 🌍 Situational Analysis
            {Analysis}
            ## 🛡️ Critical Risks
            {Risks}
            ## 🚀 Directives
            {Actions}
            """

template_architect = TemplateArchitect()