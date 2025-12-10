
export interface PlanStep {
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed";
}

export interface LogEntry {
  step_name: string;
  input_summary: string;
  output_summary: string;
  status: string;
  duration_ms: number;
}

export interface AgentResponse {
  status: "success" | "error" | "needs_clarification";
  clarification_question?: string;
  extracted_text?: string;
  final_output?: any;
  task_type?: string;
  plan: PlanStep[];
  logs: LogEntry[];
  cost_estimate?: number;
  error?: string;
}

export interface Message {
  id: string;
  role: "user" | "agent";
  content?: string;
  file?: File;
  response?: AgentResponse;
  isThinking?: boolean;
}
