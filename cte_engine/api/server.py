# FILE: cte_engine/api/server.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.websockets import WebSocketState
from core.workflow import cte_graph, set_human_input_queue
from core.state import CTEState
from storage.mongo import mongo_db
import uvicorn
import json
import traceback
import numpy as np
import datetime
import asyncio

app = FastAPI(title="CTE Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SafeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer, int)): return int(obj)
        if isinstance(obj, (np.floating, float)): return float(obj)
        if isinstance(obj, np.ndarray): return obj.tolist()
        return super().default(obj)

async def safe_send(websocket: WebSocket, type_str: str, data: dict = None, msg: str = None):
    if websocket.client_state == WebSocketState.DISCONNECTED:
        return False
    try:
        payload = {"type": type_str}
        if data is not None:
            payload["data"] = json.loads(json.dumps(data, cls=SafeEncoder))
        if msg is not None:
            payload["msg"] = msg
        await websocket.send_json(payload)
        return True
    except (WebSocketDisconnect, RuntimeError) as e:
        print(f"⚠️ WS Disconnected during send: {e}")
        return False
    except Exception as e:
        print(f"⚠️ WS Send Error ({type_str}): {e}")
        return False

@app.on_event("startup")
async def startup_event():
    print("🚀 CTE Engine Starting...")
    await mongo_db.connect()

@app.get("/api/runs")
async def get_runs():
    runs = await mongo_db.get_recent_runs()
    return runs

@app.get("/api/runs/{run_id}")
async def get_run_details(run_id: str):
    run = await mongo_db.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return json.loads(json.dumps(run, cls=SafeEncoder))

@app.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await websocket.accept()
        print(f"🔄 WS Connected")
    except Exception as e:
        print(f"❌ WS Handshake Failed: {e}")
        return

    input_queue = asyncio.Queue()

    try:
        while True:
            try:
                data = await websocket.receive_text()
                req = json.loads(data)
                
                if req.get("type") == "human_response":
                    print(f"📥 Received HITL Response: {req.get('decision')}")
                    await input_queue.put(req.get("decision", "continue"))
                    continue

            except WebSocketDisconnect:
                break
            except Exception:
                break

            query = req.get("query")
            complexity = int(req.get("complexity", 5))
            hitl_enabled = req.get("hitl_enabled", False)
            
            # Extract Manual Overrides
            temp_mode = req.get("temp_mode", None) # "precise", "balanced", "creative" or None (Auto)
            depth_mode = req.get("depth_mode", "standard") # "quick", "standard", "deep"

            # Logic: Map Depth Mode to Max Iterations
            # "Quick" -> 2 (Minimum viable)
            # "Standard" -> 3 (Baseline for good OODA)
            # "Deep" -> 6 (Expensive but thorough)
            if depth_mode == "deep":
                max_iters = 6
            elif depth_mode == "quick":
                max_iters = 2
            else:
                max_iters = 3

            now = datetime.datetime.now()
            consciousness_prompt = (
                f"SYSTEM AWARENESS:\n"
                f"- Current Date: {now.strftime('%A, %B %d, %Y')}\n"
                f"- Current Time: {now.strftime('%H:%M:%S')} (Local/Server)\n"
                f"- Operational Context: You are a recursive AI engine running in India.\n"
                f"- Limitations: You cannot perform physical actions. Your knowledge cutoff depends on the underlying LLM (Gemini 2.0).\n"
                f"- Mode: {'Interactive (HITL)' if hitl_enabled else 'Autonomous'}\n"
                f"- Strategy Depth: {depth_mode.upper()} ({max_iters} loops)\n"
            )

            print(f"📝 Task: {query[:40]}... (Depth: {depth_mode}, Temp: {temp_mode or 'Auto'})")
            if not await safe_send(websocket, "status", msg=f"🚀 Starting {depth_mode.upper()} Analysis..."):
                break
            
            set_human_input_queue(input_queue)

            initial_state = CTEState(
                task=query,
                complexity=complexity,
                system_context=consciousness_prompt,
                hitl_enabled=hitl_enabled,
                human_feedback="",
                manual_temp_mode=temp_mode,
                recursion_depth_mode=depth_mode,
                llm_config=None,
                detected_nature="Analyzing...",
                config_rationale="Initializing...",
                report_template="",
                iteration_count=0,
                max_iterations=max_iters,
                router_decision="pending",
                feedback_log=[],
                temperature=0.7,
                plans=[],
                contradiction_types=[],
                research_evidence=[],
                reviews=[],
                divergence_score=0.0,
                provenance={},
                synthesis="",
                run_id=None,
                logs=[]
            )
            
            try:
                async for event in cte_graph.astream(initial_state, {"recursion_limit": 100}):
                    for node_name, state_update in event.items():
                        
                        if "logs" in state_update:
                            for log_entry in state_update["logs"]:
                                if not await safe_send(websocket, "log", msg=log_entry, data={"node": node_name}):
                                    raise WebSocketDisconnect

                        if node_name == "router":
                            decision = state_update.get("router_decision")
                            if decision == "human_review":
                                if not await safe_send(websocket, "hitl_request", data={
                                    "msg": "High ambiguity detected. Please steer the strategy.",
                                    "options": ["Prioritize Risk", "Prioritize Innovation", "Refine Arguments", "Inject Chaos"]
                                }): raise WebSocketDisconnect

                        if "llm_config" in state_update and state_update["llm_config"]:
                            if not await safe_send(websocket, "config_report", data={
                                "nature": state_update.get("detected_nature"),
                                "config": state_update.get("llm_config")
                            }): raise WebSocketDisconnect

                        if node_name == "divergence":
                            div_score = state_update.get("divergence_score", 0.0)
                            prov_data = state_update.get("provenance", {})
                            if not await safe_send(websocket, "dialectic_results", data={"divergence": div_score, "provenance": prov_data}):
                                raise WebSocketDisconnect

                        if "iteration_count" in state_update:
                             if not await safe_send(websocket, "recursion_update", data={
                                "iteration": state_update.get("iteration_count"),
                                "max_iterations": state_update.get("max_iterations"),
                                "decision": state_update.get("router_decision")
                             }): raise WebSocketDisconnect

                        for key in ["plans", "contradiction_types", "research_evidence", "reviews"]:
                            if key in state_update:
                                if not await safe_send(websocket, key, data=state_update[key]):
                                    raise WebSocketDisconnect
                        
                        if "synthesis" in state_update:
                            if not await safe_send(websocket, "result", data=state_update["synthesis"]):
                                raise WebSocketDisconnect
                        
                        if "run_id" in state_update:
                            if not await safe_send(websocket, "saved", data=state_update["run_id"]):
                                raise WebSocketDisconnect

                if not await safe_send(websocket, "status", msg="✨ Analysis Complete."):
                    break

            except WebSocketDisconnect:
                print("⚠️ Client Disconnected during workflow")
                break
            except Exception as graph_error:
                print(f"❌ Graph Execution Error: {graph_error}")
                traceback.print_exc()
                await safe_send(websocket, "error", msg=f"Workflow Error: {str(graph_error)}")
                break

    except WebSocketDisconnect:
        print("⚠️ Client Disconnected")
    except Exception as e:
        print(f"❌ WebSocket Loop Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, ws_max_size=1024*1024*10)