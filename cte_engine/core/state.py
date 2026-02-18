# FILE: cte_engine/core/state.py
from typing import List, Dict, Any, Optional, Annotated
from typing_extensions import TypedDict
import operator

class Plan(TypedDict):
    id: str
    content: str
    perspective: str 
    iteration: int
    score_data: Optional[Dict[str, Any]]

class Review(TypedDict):
    plan_id: str
    scores: Dict[str, int]
    rationale: str

class ResearchArtifact(TypedDict):
    id: str
    query: str
    content: str
    source_url: str
    source_type: str
    contradiction_type: str
    timestamp: str

class LLMConfig(TypedDict):
    temperature: float
    top_p: float
    top_k: int
    presence_penalty: float
    frequency_penalty: float
    stop_sequences: List[str]
    max_output_tokens: int

class CTEState(TypedDict):
    # Input
    task: str
    complexity: int
    
    # Consciousness & Control
    system_context: str
    hitl_enabled: bool
    human_feedback: str
    
    # Manual Overrides (New)
    manual_temp_mode: Optional[str]  # "precise", "balanced", "creative" or None
    recursion_depth_mode: str        # "quick", "standard", "deep"
    
    # Smart Configuration
    llm_config: LLMConfig
    config_rationale: str
    detected_nature: str
    
    # Dynamic Reporting
    report_template: str
    
    # Recursion Control
    iteration_count: int
    max_iterations: int
    router_decision: str
    feedback_log: List[str]

    # Internal Processing
    temperature: float
    plans: List[Plan]
    
    # Analysis Data
    contradiction_types: List[Dict[str, Any]] 
    research_evidence: List[ResearchArtifact]
    reviews: List[Review]
    
    # Math Engine Outputs
    divergence_score: float
    provenance: Dict[str, Any]
    
    # Output
    synthesis: str
    run_id: Optional[str]
    
    # Logs
    logs: Annotated[List[str], operator.add]