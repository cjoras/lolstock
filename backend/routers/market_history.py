from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Player
from sqlalchemy import text

router = APIRouter(prefix="/api/market", tags=["Market"])

@router.get("/history")
def get_market_history(db: Session = Depends(get_db)):
    """
    Returnerer en tidslinje over prisutviklingen for ALLE spillere.
    Format:
    [
      { "timestamp": "...", "Ebrat": 1023.5, "Faker": 980.0, ... },
      ...
    ]
    """
    players = db.query(Player).all()
    player_map = {p.id: p.summoner_name for p in players}

    rows = db.execute(text("""
        SELECT player_id, price, timestamp
        FROM player_price_history
        ORDER BY timestamp ASC
    """)).fetchall()

    # Samle alle datapunkter per timestamp
    combined = {}
    for r in rows:
        t = r.timestamp.isoformat()
        if t not in combined:
            combined[t] = {"timestamp": t}
        combined[t][player_map.get(r.player_id, f"Player {r.player_id}")] = r.price

    # Sorter tidslinje
    timeline = sorted(combined.values(), key=lambda x: x["timestamp"])
    return timeline
