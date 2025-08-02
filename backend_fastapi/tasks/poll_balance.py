import time
import os
from firebase_client import root_ref
from luno_python.client import Client

LUNO_ID = os.getenv("LUNO_API_KEY_ID")
LUNO_SECRET = os.getenv("LUNO_API_KEY_SECRET")
luno = Client(api_key_id=LUNO_ID, api_key_secret=LUNO_SECRET)

def refresh_balances(user_id: str):
    accounts = luno.get_balances()
    zar_acc = next((a for a in accounts["balance"] if a["currency"] == "ZAR"), None)
    btc_acc = next((a for a in accounts["balance"] if a["currency"] == "XBT"), None)
    data = {}
    if zar_acc: data["zar_balance"] = float(zar_acc["balance"])
    if btc_acc: data["btc_balance"] = float(btc_acc["balance"])
    uref = root_ref().child("users").child(user_id)
    uref.update(data)
    
    bot = uref.child("botActive").get() or False
    prev_await = uref.child("awaitingFunds").get() or False
    
    new_await = bot and data.get("zar_balance",0) <= 0
    if prev_await and not new_await:
        uref.update({"awaitingFunds": False})
    elif new_await:
        uref.update({"awaitingFunds": True})

def run_poll_loop():
    user_refs = root_ref().child("users").get(shallow=True) or {}
    while True:
        for user_id in user_refs.keys():
            try:
                refresh_balances(user_id)
            except Exception:
                pass
        time.sleep(int(os.getenv("POLL_INTERVAL", "60")))

if __name__ == "__main__":
    run_poll_loop()
