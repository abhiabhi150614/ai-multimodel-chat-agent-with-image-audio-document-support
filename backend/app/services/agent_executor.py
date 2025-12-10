
from app.models.schemas import PlanStep, LogEntry, AgentResponse
from app.services.llm_gemini import gemini_service
from app.services.ocr_service import ocr_service
from app.services.pdf_service import pdf_service
from app.services.youtube_service import youtube_service
from app.services.audio_service import audio_service
from app.core.logging import logger
import json
import time

class AgentExecutor:
    async def execute_plan(
        self, 
        plan: list[PlanStep], 
        text: str, 
        file_bytes: bytes = None, 
        file_name: str = None,
        conversation_history: list = None
    ) -> AgentResponse:
        
        logs = []
        extracted_text = ""
        final_output = {}
        task_type = "general"
        
        # Context that flows between steps
        execution_context = {
            "text": text, # Raw user text
            "extracted_text": "", # From OCR/PDF/Youtube
            "transcripts": "" 
        }

        start_total = time.time()

        for step in plan:
            ts = time.time()
            log = LogEntry(
                step_name=step.name,
                input_summary="Processing...", 
                output_summary="", 
                status="running", 
                duration_ms=0
            )
            
            try:
                # Dispatcher
                if step.name == "extract_text_from_image":
                    if file_bytes:
                        txt, conf = ocr_service.extract_text(file_bytes)
                        execution_context["extracted_text"] += f"\n{txt}"
                        log.output_summary = f"Extracted {len(txt)} chars (Confidence: {conf:.2f})"
                        extracted_text = txt
                    else:
                        log.status = "failed"
                        log.output_summary = "No file provided"

                elif step.name == "extract_text_from_pdf":
                    if file_bytes:
                        txt, conf = pdf_service.extract_text(file_bytes)
                        execution_context["extracted_text"] += f"\n{txt}"
                        log.output_summary = f"Extracted {len(txt)} chars"
                        extracted_text = txt

                elif step.name == "fetch_youtube_transcript":
                    url = text # Simplification: assume URL in text
                    txt, success = youtube_service.get_transcript(url)
                    if success:
                        execution_context["extracted_text"] += f"\n{txt}"
                        log.output_summary = "Transcript fetched"
                        extracted_text = txt
                    else:
                        log.status = "failed"
                        log.output_summary = txt

                elif step.name == "transcribe_audio":
                    if file_bytes:
                        # Logic to call audio service
                        # Audio service returns JSON string usually
                        resp = await audio_service.process_audio(file_bytes, file_name or "audio.mp3")
                        # Parse JSON if possible to put in final output
                        try:
                            # If audio service returns raw JSON string from LLM
                            audio_data = json.loads(resp)
                            execution_context["extracted_text"] = audio_data.get("transcript", "")
                            extracted_text = audio_data.get("transcript", "")
                            final_output.update(audio_data) # Merges summaries
                            task_type = "audio_summary"
                            log.output_summary = "Audio processed"
                        except:
                            log.output_summary = "Audio processed (raw response)"
                            execution_context["extracted_text"] = resp

                elif step.name == "summarize":
                    content = execution_context["extracted_text"] or execution_context["text"]
                    prompt = f"Summarize this:\n{content}\nFormat as JSON: {{'one_line_summary': '', 'bullet_points': [], 'five_sentence_summary': ''}}"
                    res = await gemini_service.generate_text(prompt)
                    try:
                        summ = json.loads(res.replace("```json", "").replace("```", "").strip())
                        final_output.update(summ)
                        task_type = "summarization"
                    except:
                        log.status = "failed"
                        log.output_summary = "JSON parse error"

                elif step.name == "sentiment_analysis":
                    content = execution_context["extracted_text"] or execution_context["text"]
                    prompt = f"Analyze sentiment:\n{content}\nFormat as JSON: {{'label': '', 'confidence': 0.0, 'justification': ''}}"
                    res = await gemini_service.generate_text(prompt)
                    try:
                        sent = json.loads(res.replace("```json", "").replace("```", "").strip())
                        final_output.update(sent)
                        task_type = "sentiment"
                    except:
                        log.status = "failed"

                elif step.name == "code_explanation":
                    content = execution_context["extracted_text"] or execution_context["text"]
                    prompt = f"Explain code:\n{content}\nFormat as JSON: {{'what_it_does': '', 'bugs_or_issues': [], 'time_complexity': ''}}"
                    res = await gemini_service.generate_text(prompt)
                    try:
                         expl = json.loads(res.replace("```json", "").replace("```", "").strip())
                         final_output.update(expl)
                         task_type = "code_explanation"
                    except:
                        log.status = "failed"

                elif step.name == "conversational_answer":
                     content = execution_context["extracted_text"] or ""
                     
                     # Build context with history
                     history_context = ""
                     if conversation_history:
                         history_context = "\n\nPrevious Conversation:\n"
                         for msg in conversation_history[-6:]:  # Last 3 exchanges (6 messages)
                             role = msg.get('role', '').upper()
                             msg_content = msg.get('content', '')
                             history_context += f"{role}: {msg_content}\n"
                     
                     prompt = f"""You are a helpful AI assistant. Use the context below to answer the user's question.

Context from uploaded content:
{content}
{history_context}

Current User Question: {text}

Answer the question naturally and conversationally. If the question refers to previous context (like "he", "it", "this"), use the conversation history to understand what they're referring to."""
                     
                     ans = await gemini_service.generate_text(prompt)
                     final_output["message"] = ans
                     task_type = "conversation"

                log.duration_ms = (time.time() - ts) * 1000
                log.status = "completed" if log.status == "running" else log.status
                logs.append(log)
            except Exception as e:
                logger.error(f"Step {step.name} failed: {e}")
                log.status = "failed"
                log.output_summary = str(e)
                logs.append(log)
        
        return AgentResponse(
            status="success",
            extracted_text=extracted_text,
            final_output=final_output,
            task_type=task_type,
            plan=plan,
            logs=logs
        )

agent_executor = AgentExecutor()
