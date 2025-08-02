from fastapi import APIRouter, HTTPException
from typing import Dict
from ..firebase_client import root_ref
from ..models import UserProfile

router = APIRouter(prefix="/api/profile")

@router.get("/")
async def get_profile(user_id: str):
    user = root_ref().child("users").child(user_id).get()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Ensure floats
    user["zar"] = float(user.get("zar_balance", 0) or 0)
    user["btc"] = float(user.get("btc_balance", 0) or 0)
    return UserProfile(
        user_id=user_id,
        zar=user["zar"],
        btc=user["btc"],
        strategies=user.get("strategies", []),
        botActive=user.get("botActive", False),
        awaitingFunds=user.get("awaitingFunds", False)
    )
