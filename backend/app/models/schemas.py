
from pydantic import BaseModel
from typing import Optional, List, Dict, Any, Literal

class PlanStep(BaseModel):
    name: str
    description: str
    status: Literal["pending", "running", "completed", "failed"] = "pending"

class LogEntry(BaseModel):
    step_name: str
    input_summary: str
    output_summary: str
    status: str
    duration_ms: float
    cost_estimate: Optional[float] = None

class AgentResponse(BaseModel):
    status: Literal["success", "error", "needs_clarification"]
    clarification_question: Optional[str] = None
    extracted_text: Optional[str] = None
    final_output: Optional[Dict[str, Any]] = None
    task_type: Optional[str] = None
    plan: List[PlanStep] = []
    logs: List[LogEntry] = []
    cost_estimate: Optional[float] = None
    error: Optional[str] = None

class AgentRequest(BaseModel):
    text: Optional[str]
    file: Optional[Any] # UploadFile handled separately in endpoint
    conversation_id: Optional[str]
    clarification_answer: Optional[str]
