# FILE: cte_engine/core/workflow.py
from langgraph.graph import StateGraph, END
from core.state import CTEState
from core.planner import planner
from core.meta_critic import critic
from core.scoring import advanced_scorer
from core.provenance import provenance_engine
from core.synthesizer import synthesizer
from core.contradiction import contradiction_analyzer
from core.researcher import research_swarm
from core.router import decision_router
from core.configurator import config_agent
from core.template_architect import template_architect
from storage.mongo import mongo_db
import asyncio
import numpy as np
import traceback
import datetime

_human_input_queue = None

def set_human_input_queue(q: asyncio.Queue):
    global _human_input_queue
    _human_input_queue = q

def generate_runbook(task, plans, reviews, divergence, synthesis, status, provenance=None):
    return {
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "task": task,
        "status": status,
        "metrics": {"divergence": divergence, "plan_count": len(plans)},
        "provenance": provenance,
        "synthesis": synthesis,
        "details": {"plans": plans, "reviews": reviews}
    }

async def node_configurator(state: CTEState):
    # 1. Run the Auto-Configurator first to get nature detection
    result = await config_agent.configure(state["task"])
    
    final_config = result["config"]
    nature = result["detected_nature"]
    rationale = result["rationale"]
    
    # 2. Apply Manual Temperature Overrides if User Selected One
    manual_mode = state.get("manual_temp_mode")
    
    if manual_mode:
        if manual_mode == "precise":
            final_config["temperature"] = 0.2
            final_config["top_p"] = 0.1
            nature = f"{nature} (Overridden: Precise)"
            rationale = "User enforced Low Temperature for maximum determinism."
        elif manual_mode == "balanced":
            final_config["temperature"] = 0.7
            nature = f"{nature} (Overridden: Balanced)"
            rationale = "User enforced Standard Temperature."
        elif manual_mode == "creative":
            final_config["temperature"] = 1.0
            final_config["top_p"] = 0.95
            nature = f"{nature} (Overridden: Creative)"
            rationale = "User enforced High Temperature for lateral thinking."
            
        log_msg = f"⚙️ [Manual Override] Mode: {manual_mode.upper()} | Temp: {final_config['temperature']}"
    else:
        log_msg = f"⚙️ [Smart Config] Detected: {nature}"

    return {
        "llm_config": final_config,
        "detected_nature": nature,
        "config_rationale": rationale,
        "logs": [log_msg]
    }

async def node_planner(state: CTEState):
    if not state.get("plans"):
        plans = await planner.generate_plans(
            state["task"], 
            state.get("system_context", ""),
            config=state.get("llm_config"), 
            count=3
        )
        return {"plans": plans, "logs": [f"🧠 [Planner] Generated {len(plans)} initial paths."]}
    return {}

async def node_contradiction(state: CTEState):
    configs = await contradiction_analyzer.analyze(state["task"], state["plans"])
    types = [c['type'] for c in configs]
    return {"contradiction_types": configs, "logs": [f"🔍 [Analyzer] Conflicts: {', '.join(types)}"]}

async def node_research_swarm(state: CTEState):
    configs = state.get("contradiction_types", [])
    evidence = await research_swarm.launch_swarm(configs)
    existing = state.get("research_evidence", [])
    return {"research_evidence": existing + evidence, "logs": [f"🛰️ [Swarm] Gathered {len(evidence)} artifacts."]}

async def node_critic(state: CTEState):
    reviews = await critic.evaluate_plans(state["task"], state["plans"])
    return {"reviews": reviews, "logs": [f"🧐 [Meta-Critic] Evaluated {len(reviews)} plans."]}

async def node_divergence(state: CTEState):
    try:
        plans = state["plans"]
        reviews = state["reviews"]
        evidence = state.get("research_evidence", [])
        
        scores_map = await advanced_scorer.batch_score(plans, reviews, evidence)
        scored_plans = []
        totals = []
        for p in plans:
            p['score_data'] = scores_map.get(p['id'], {"total": 0.0, "components": {}, "metrics": {}})
            scored_plans.append(p)
            totals.append(p['score_data']['total'])
            
        prov_data = provenance_engine.generate_provenance(scored_plans)
        divergence = float(np.std(totals)) if totals else 0.0
        
        return {
            "plans": scored_plans, 
            "divergence_score": divergence, 
            "provenance": prov_data, 
            "logs": [f"⚡ [Math Engine] Divergence: {divergence:.4f}"]
        }
    except Exception as e:
        traceback.print_exc()
        return {"logs": [f"❌ Math Engine Error: {str(e)}"]}

async def node_router(state: CTEState):
    decision = await decision_router.decide(state)
    return {"router_decision": decision, "logs": [f"🚦 [OODA Router] Decision: {decision.upper()}"]}

async def node_human_review(state: CTEState):
    global _human_input_queue
    timeout_seconds = 30
    
    if _human_input_queue is None:
        print("⚠️ Human Queue not set! Defaulting to Refine.")
        return {"human_feedback": "Proceed", "logs": ["⚠️ [HITL] Queue Error. Auto-Proceeding."]}
    
    print(f"⏳ [HITL] Waiting for user input (Timeout: {timeout_seconds}s)...")
    try:
        user_decision = await asyncio.wait_for(_human_input_queue.get(), timeout=timeout_seconds)
        return {
            "human_feedback": user_decision,
            "logs": [f"👤 [Human-in-Loop] Steering Applied: {user_decision}"]
        }
    except asyncio.TimeoutError:
        return {
            "human_feedback": "Auto-Refine",
            "logs": ["⏱️ [HITL] User inactive. Auto-Proceeding to Refinement."]
        }

async def node_chaos_injection(state: CTEState):
    new_plan = await planner.generate_chaos_plan(
        state["task"], 
        state.get("system_context", ""),
        state["plans"], 
        state.get("llm_config")
    )
    if new_plan:
        return {"plans": state["plans"] + [new_plan], "iteration_count": state["iteration_count"] + 1, "logs": ["😈 [Chaos Agent] Injected Chaos."]}
    return {"logs": ["⚠️ [Chaos Agent] Failed."]}

async def node_refiner(state: CTEState):
    refined_plans = await planner.refine_plans(
        state["task"], 
        state.get("system_context", ""),
        state["plans"], 
        state["reviews"], 
        state.get("human_feedback", ""),
        state.get("llm_config")
    )
    return {"plans": refined_plans, "human_feedback": "", "iteration_count": state["iteration_count"] + 1, "logs": [f"🔧 [Refiner] Optimized plans."]}

async def node_template_designer(state: CTEState):
    template = await template_architect.design_template(
        state["task"], 
        state.get("detected_nature", "General"), 
        state["plans"]
    )
    return {"report_template": template, "logs": ["📐 [Architect] Designed dynamic report structure."]}

async def node_synthesizer(state: CTEState):
    synthesis = await synthesizer.synthesize(
        state["task"], 
        state["plans"], 
        state["reviews"], 
        state["divergence_score"], 
        state.get("report_template", ""),
        state.get("research_evidence", [])
    )
    return {"synthesis": synthesis, "logs": ["⚗️ [Synthesizer] Strategic Brief generated."]}

async def node_storage(state: CTEState):
    run_data = generate_runbook(
        state["task"], 
        state["plans"], 
        state["reviews"], 
        state["divergence_score"], 
        state["synthesis"], 
        "complete",
        state.get("provenance")
    )
    run_id = await mongo_db.save_run(run_data)
    return {"run_id": run_id, "logs": [f"💾 [Storage] Saved Run: {run_id}"]}

def route_decision(state: CTEState):
    return state["router_decision"]

def build_cte_graph():
    workflow = StateGraph(CTEState)
    
    workflow.add_node("configurator", node_configurator)
    workflow.add_node("planner", node_planner)
    workflow.add_node("contradiction", node_contradiction)
    workflow.add_node("swarm", node_research_swarm)
    workflow.add_node("critic", node_critic)
    workflow.add_node("divergence", node_divergence)
    workflow.add_node("router", node_router)
    
    workflow.add_node("human_review", node_human_review)
    workflow.add_node("chaos_agent", node_chaos_injection)
    workflow.add_node("refiner", node_refiner)
    
    workflow.add_node("template_designer", node_template_designer)
    workflow.add_node("synthesizer", node_synthesizer)
    workflow.add_node("storage", node_storage)
    
    workflow.set_entry_point("configurator")
    workflow.add_edge("configurator", "planner")
    workflow.add_edge("planner", "contradiction")
    workflow.add_edge("contradiction", "swarm")
    workflow.add_edge("swarm", "critic")
    workflow.add_edge("critic", "divergence")
    workflow.add_edge("divergence", "router")
    
    workflow.add_conditional_edges(
        "router",
        route_decision,
        {
            "chaos_injection": "chaos_agent",
            "refine": "refiner",
            "synthesize": "template_designer",
            "human_review": "human_review"
        }
    )
    
    workflow.add_edge("human_review", "refiner")
    workflow.add_edge("chaos_agent", "contradiction")
    workflow.add_edge("refiner", "contradiction")
    workflow.add_edge("template_designer", "synthesizer")
    workflow.add_edge("synthesizer", "storage")
    workflow.add_edge("storage", END)
    
    return workflow.compile()

cte_graph = build_cte_graph()