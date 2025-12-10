
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from typing import Optional
from app.models.schemas import AgentRequest, AgentResponse
from app.services.agent_planner import agent_planner
from app.services.agent_executor import agent_executor
from app.services.history_service import history_service
from app.core.logging import logger

router = APIRouter()

@router.post("/run", response_model=AgentResponse)
async def run_agent(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    conversation_id: Optional[str] = Form(None),
    clarification_answer: Optional[str] = Form(None)
):
    logger.info(f"Agent run request: text={text}, file={file.filename if file else 'None'}")
    
    try:
        # 1. Read file if any
        file_bytes = None
        file_type = None
        if file:
            file_bytes = await file.read()
            file_type = file.content_type
            
        # 1.5. Update History (User)
        if conversation_id and text:
            history_service.add_message(conversation_id, "user", text)
            
        # 2. Check for Youtube URL in text (simple check for planner context)
        has_youtube = "youtube.com" in (text or "") or "youtu.be" in (text or "")
        
        # 3. Plan
        # Retrieve history
        history = history_service.get_history(conversation_id) if conversation_id else []
        
        status, clarification_question, plan = await agent_planner.create_plan(
            user_text=text or "",
            file_type=file_type,
            has_youtube=has_youtube,
            conversation_history=history,
            clarification_answer=clarification_answer
        )
        
        if status == "needs_clarification":
            return AgentResponse(
                status="needs_clarification",
                clarification_question=clarification_question,
                plan=plan
            )
            
        # 4. Execute
        response = await agent_executor.execute_plan(
            plan=plan,
            text=text or "",
            file_bytes=file_bytes,
            file_name=file.filename if file else None,
            conversation_history=history
        )
        
        # 5. Update History (Agent)
        if conversation_id:
             # Construct a meaningful string representation of the result for history
             agent_content = response.extracted_text or ""
             if response.final_output:
                 agent_content += f"\nOutput: {str(response.final_output)}"
             history_service.add_message(conversation_id, "agent", agent_content)

        return response
        
    except Exception as e:
        logger.error(f"Agent endpoint error: {e}")
        return AgentResponse(status="error", error=str(e))
