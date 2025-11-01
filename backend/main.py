from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
from models import Base
from routers import players, transactions, auth, users, leaderboard, player_history, market_history, market, system  # ← sørg for at disse finnes

app = FastAPI()

# DB init
Base.metadata.create_all(bind=engine)

# CORS – må tillate Authorization-header
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],  # inkluderer Authorization
)

# Routers
app.include_router(players.router)
app.include_router(transactions.router)
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(leaderboard.router)
app.include_router(player_history.router)
app.include_router(market_history.router)
app.include_router(market.router)
app.include_router(system.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}
