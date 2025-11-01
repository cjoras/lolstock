# backend/routers/player_history.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Player
from sqlalchemy import text
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/players", tags=["Player History"])

@router.get("/{player_id}/history")
def get_player_history(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    rows = db.execute(
        text("""
            SELECT price, timestamp
            FROM player_price_history
            WHERE player_id = :pid
            ORDER BY timestamp ASC
        """),
        {"pid": player_id}
    ).fetchall()

    if not rows:
        return {"player": player.summoner_name, "history": [], "change_24h": 0.0}

    # prisendring siste 24 timer
    cutoff = datetime.utcnow() - timedelta(hours=24)
    recent_prices = [r.price for r in rows if r.timestamp >= cutoff]

    old_price = recent_prices[0] if len(recent_prices) else rows[0].price
    new_price = rows[-1].price
    change_24h = round(((new_price - old_price) / old_price * 100), 2) if old_price > 0 else 0.0

    history = [
        {"price": r.price, "timestamp": r.timestamp.isoformat()}
        for r in rows
    ]

    return {
        "player": player.summoner_name,
        "history": history,
        "change_24h": change_24h
    }
