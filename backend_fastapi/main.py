import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.profile import router as profile_router
from routes.bot import router as bot_router
from routes.strategies import router as strategies_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL") or "*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(profile_router)
app.include_router(bot_router)
app.include_router(strategies_router)

@app.on_event("startup")
async def startup_event():
    # Optionally launch background poll thread here using threading
    import threading
    from tasks.poll_balance import run_poll_loop
    thread = threading.Thread(target=run_poll_loop, daemon=True)
    thread.start()

@app.get("/health")
async def health():
    return {"status": "ok"}
