
from fastapi import APIRouter
from app.api.v1.endpoints import agent

api_router = APIRouter()
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
