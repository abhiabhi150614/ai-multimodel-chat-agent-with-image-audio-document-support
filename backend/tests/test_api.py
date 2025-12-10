
from fastapi.testclient import TestClient
from app.main import app
import os

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "app": "Agentic AI Assistant"}

def test_agent_run_no_input():
    # Attempt to run without text or file
    # Planner might fail or return conversational fallback, but endpoint should be 200
    response = client.post("/api/v1/agent/run")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["success", "needs_clarification", "error"]

def test_agent_run_text_only():
    # If no key is set, this might fail internally in planner if it calls Gemini
    # But we want to ensure the endpoint handles it gracefully
    response = client.post("/api/v1/agent/run", data={"text": "Hello"})
    assert response.status_code == 200
    data = response.json()
    # It might error if key is invalid, but status code 200 is expected from FastAPI
    if data["status"] == "error":
        assert "Gemini" in data["error"] or "Key" in data["error"] or "quota" in str(data["error"]).lower()
    else:
        assert data["status"] in ["success", "needs_clarification"]
