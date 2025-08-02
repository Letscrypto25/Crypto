from fastapi import APIRouter
from ..models import ToggleBotPayload
from ..firebase_client import root_ref

router = APIRouter(prefix="/api/bot")

@router.post("/toggle")
async def toggle_bot(payload: ToggleBotPayload, user_id: str):
    uref = root_ref().child("users").child(user_id)
    uref.update({
        "botActive": payload.activate,
        # Clear awaitingFunds if funds exist
        "awaitingFunds": payload.activate and (uref.child("zar_balance").get() or 0) <= 0
    })
    return {"success": True, "botActive": payload.activate}
