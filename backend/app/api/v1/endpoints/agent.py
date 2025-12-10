
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
            # Extract content even during clarification for context
            extracted_text = ""
            if file_bytes and file_type:
                try:
                    if 'pdf' in file_type:
                        from app.services.pdf_service import pdf_service
                        extracted_text, _ = pdf_service.extract_text(file_bytes)
                    elif 'image' in file_type:
                        from app.services.ocr_service import ocr_service
                        extracted_text, _ = await ocr_service.extract_text(file_bytes)
                    
                    # Store extracted content in history for future reference
                    if conversation_id and extracted_text:
                        history_service.add_message(conversation_id, "system", "File content extracted", extracted_text)
                except Exception as e:
                    logger.error(f"Failed to extract content during clarification: {e}")
            
            return AgentResponse(
                status="needs_clarification",
                clarification_question=clarification_question,
                plan=plan,
                extracted_text=extracted_text
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
             # Store both response and extracted content
             agent_content = ""
             if response.final_output:
                 agent_content = str(response.final_output.get('message', ''))
             history_service.add_message(conversation_id, "agent", agent_content, response.extracted_text)

        return response
        
    except Exception as e:
        logger.error(f"Agent endpoint error: {e}")
        return AgentResponse(status="error", error=str(e))
