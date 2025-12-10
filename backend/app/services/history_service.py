
from typing import List, Dict
from app.core.logging import logger

class HistoryService:
    def __init__(self):
        # In-memory storage: {conversation_id: [{"role": "user", "content": "..."}]}
        self._storage: Dict[str, List[Dict[str, str]]] = {}

    def get_history(self, conversation_id: str) -> List[Dict[str, str]]:
        return self._storage.get(conversation_id, [])

    def add_message(self, conversation_id: str, role: str, content: str, extracted_content: str = None):
        if conversation_id not in self._storage:
            self._storage[conversation_id] = []
        
        # Keep history manageable (e.g., last 10 turns)
        if len(self._storage[conversation_id]) > 20: 
            self._storage[conversation_id].pop(0)
            
        message = {"role": role, "content": content}
        if extracted_content:
            message["extracted_content"] = extracted_content
        self._storage[conversation_id].append(message)
        logger.info(f"Added message to history [{conversation_id}]: {role}")

    def clear_history(self, conversation_id: str):
        if conversation_id in self._storage:
            del self._storage[conversation_id]

history_service = HistoryService()
