"""
EXAMPLE router for Friend A — chat feature (or whatever they're building).

Friend A: Replace this with your actual code!
Keep the 'router' variable and the 'prefix' — that's all the main app needs.

All endpoints here will be available at /chat/...
For example:
    POST /chat/send    → sends a message
    GET  /chat/history → gets chat history
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


# --- Replace everything below with your actual code ---

class ChatMessage(BaseModel):
    message: str
    username: str = "anonymous"


@router.post("/send")
def send_message(msg: ChatMessage):
    """Example endpoint — replace with your real logic."""
    return {"reply": f"Echo: {msg.message}", "from": msg.username}


@router.get("/history")
def get_history():
    """Example endpoint — replace with your real logic."""
    return {"messages": []}
