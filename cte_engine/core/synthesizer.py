from llm_providers.gemini import llm
from storage.vectordb import vector_db
import json
import asyncio

class Synthesizer:
    async def synthesize(self, task: str, plans: list, reviews: list, divergence: float, template: str, evidence: list = None):
        # 1. Prepare Plan Context
        plans_text = ""
        for p in plans:
            role = p.get('perspective', 'Unknown Role')
            plans_text += f"PLAN {p['id']} [{role}]:\n{p['content']}\n\n"
            
        # 2. SEMANTIC FILTERING (FIXED)
        # Instead of dumping the raw 'evidence' list (which contains noise), 
        # we query the Vector DB for the most relevant chunks regarding the task.
        
        # We search for the task itself + keywords from the best plan
        search_query = f"{task}"
        if plans:
            # Append the first 100 chars of the first plan to ground the search
            search_query += f" {plans[0]['content'][:100]}"

        print(f"⚗️ Synthesizer: Performing Semantic Search for context filtering...")
        
        # Retrieve top 15 most semantically relevant chunks to exclude dictionary definitions/noise
        relevant_artifacts = await vector_db.search_relevant(search_query, limit=15)
        
        evidence_text = ""
        if relevant_artifacts:
            evidence_list = []
            for idx, e in enumerate(relevant_artifacts):
                # Clean content to remove newlines for compact prompting
                clean_content = e['content'].replace('\n', ' ').strip()
                source = e.get('metadata', {}).get('url', 'Unknown Source')
                evidence_list.append(f"REF_ID [[{idx+1}]]: {clean_content[:500]}... (Source: {source})")
            
            evidence_text = "\n\n".join(evidence_list)
        else:
            evidence_text = "No relevant external evidence found in Vector DB."

        # 3. Handle Template Fallback
        if not template or len(template) < 20:
            template = """
            # 🏁 Strategic Brief
            ## ⚡ Executive Verdict
            [Verdict]
            ## 🌍 Situational Analysis
            [Analysis]
            ## 🛡️ Critical Risks
            [Risk Table]
            ## 🚀 Directives
            [Action Plan]
            ## 8. Data & Evidence
            [Citations]
            """

        # 4. Construct Prompt
        prompt = f"""
        ROLE: Expert Strategic Synthesizer.
        TASK: {task}
        
        INPUT PLANS (Internal Dialectic):
        {plans_text}
        
        VERIFIED EVIDENCE (Use REF_IDs [[1]], [[2]]... for citations):
        {evidence_text}
        
        INSTRUCTIONS:
        1. Fill out the TEMPLATE below comprehensively.
        2. **CRITICAL**: You must ONLY use the provided VERIFIED EVIDENCE for the "Data & Evidence" section. Do NOT include dictionary definitions or irrelevant math problems.
        3. If the evidence provided is weak, rely on the PLANS (Internal Dialectic) and your own knowledge, but do not hallucinate citations.
        4. Cite sources strictly as `[[1]]`, `[[2]]` etc. inline where relevant.
        5. Ensure the report is complete and does not cut off.
        
        --- TEMPLATE ---
        {template}
        --- END TEMPLATE ---
        """
        
        try:
            # High output tokens to prevent truncation
            print("⚗️ Synthesizer: Generating final report...")
            response = await llm.generate(prompt, config={"temperature": 0.3, "max_output_tokens": 8192})
            return response
        except Exception as e:
            return f"# ⚠️ Synthesis Failed\n\nError: {str(e)}"

synthesizer = Synthesizer()