from pydantic import BaseModel
from typing import Optional, List

class UserProfile(BaseModel):
    user_id: str
    z R: float  # Actually "zar" or better field name
    btc: float
    strategies: List[int]
    botActive: bool
    awaitingFunds: bool

class ToggleBotPayload(BaseModel):
    activate: bool
