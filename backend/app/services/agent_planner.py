
import json
from app.services.llm_gemini import gemini_service
from app.models.schemas import PlanStep
from app.core.logging import logger
from typing import List, Tuple, Optional

class AgentPlanner:
    def _get_fast_plan(self, text: str, file_type: str = None) -> Optional[List[PlanStep]]:
        """Return fast plan for common patterns without LLM call"""
        text_lower = text.lower().strip()
        
        # Simple greetings
        greetings = ['hi', 'hii', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening']
        if text_lower in greetings:
            return [PlanStep(name="conversational_answer", description="Simple greeting response")]
        
        # Common questions
        if 'what is python' in text_lower or 'what is java' in text_lower:
            return [PlanStep(name="conversational_answer", description="Programming language explanation")]
            
        # File + rating/evaluation
        if file_type and ('rate' in text_lower or 'evaluate' in text_lower or 'analyze' in text_lower):
            if 'pdf' in file_type:
                return [
                    PlanStep(name="extract_text_from_pdf", description="Extract PDF text"),
                    PlanStep(name="conversational_answer", description="Analyze content")
                ]
            elif 'image' in file_type:
                return [
                    PlanStep(name="extract_text_from_image", description="Extract image text"),
                    PlanStep(name="conversational_answer", description="Analyze content")
                ]
        
        return None
    
    async def create_plan(
        self, 
        user_text: str, 
        file_type: Optional[str] = None, 
        has_youtube: bool = False,
        conversation_history: List[str] = [],
        clarification_answer: Optional[str] = None
    ) -> Tuple[str, Optional[str], List[PlanStep]]:
        """
        Analyzes intent and creates a plan.
        Returns: (status, clarification_question, plan_steps)
        status: "success" or "needs_clarification"
        """
        
        # Fast path for common patterns
        fast_plan = self._get_fast_plan(user_text, file_type)
        if fast_plan:
            return "success", None, fast_plan
        
        # Construct context
        context_str = f"User Input: {user_text}\n"
        if file_type:
            context_str += f"Attached File Type: {file_type}\n"
        if has_youtube:
            context_str += "DeepTube URL detected.\n"
        if clarification_answer:
            context_str += f"User Clarification: {clarification_answer}\n"
        
        # Add history to context
        if conversation_history:
            history_str = "\n".join([f"{msg['role'].upper()}: {msg['content']}" for msg in conversation_history])
            context_str += f"\nPrevious Conversation History:\n{history_str}\n"
        
        system_prompt = """
        You are an intelligent Agent Planner.
        Your goal is to understand the user's intent and create a step-by-step execution plan.
        
        Available Tasks:
        1. extract_text_from_pdf (if pdf provided)
        2. extract_text_from_image (if image provided)
        3. fetch_youtube_transcript (if youtube url provided)
        4. transcribe_audio (if audio file provided)
        5. summarize (works on any text/transcript)
        6. sentiment_analysis (works on any text)
        7. code_explanation (works on code text)
        8. conversational_answer (for general questions or follow-ups)
        
        IMPORTANT RULES:
        - BE SMART: If the user says "rate this resume" or "evaluate this", they want a conversational analysis. Don't ask for clarification!
        - USE CONTEXT: Check "Previous Conversation History". If user asks a follow-up (e.g., "summarize it"), refer to previous content.
        - BE PROACTIVE: For ambiguous requests, make a reasonable assumption rather than asking. For example:
          * "analyze this" → assume conversational_answer
          * "rate this resume" → extract_text_from_pdf + conversational_answer
          * "what's in this image" → extract_text_from_image + conversational_answer
        - ONLY ASK FOR CLARIFICATION if the request is truly impossible to interpret (e.g., "process this" with no file and no context).
        
        Response Format (JSON):
        {
            "status": "success" | "needs_clarification",
            "clarification_question": "string if needed, else null",
            "plan": [
                {
                    "name": "task_function_name",
                    "description": "short description",
                    "status": "pending"
                }
            ]
        }
        """
        
        full_prompt = f"{system_prompt}\n\nTask Context:\n{context_str}\n\nGenerate JSON response:"
        
        try:
            # Use very short timeout for planning
            import asyncio
            response_text = await asyncio.wait_for(
                gemini_service.generate_text(full_prompt),
                timeout=10.0
            )
            # Cleanup code blocks if Gemini adds them
            cleaned_text = response_text.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned_text)
            
            status = data.get("status", "success")
            clarification_question = data.get("clarification_question")
            plan_data = data.get("plan", [])
            
            plan_steps = [PlanStep(**p) for p in plan_data]
            
            return status, clarification_question, plan_steps
            
        except Exception as e:
            logger.error(f"Planning failed: {e}")
            # Fallback plan: just conversational answer
            return "success", None, [PlanStep(name="conversational_answer", description="Default fallback reply")]

agent_planner = AgentPlanner()
