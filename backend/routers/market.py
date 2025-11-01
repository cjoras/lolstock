from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Player, MarketHistory
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/market", tags=["Market"])

@router.get("/summary")
def get_market_summary(db: Session = Depends(get_db)):
    """
    Returnerer prisendring (%) for hver spiller siste 24 timer.
    """
    now = datetime.utcnow()
    yesterday = now - timedelta(hours=24)

    result = []
    players = db.query(Player).all()

    for player in players:
        history = (
            db.query(MarketHistory)
            .filter(MarketHistory.player_id == player.id, MarketHistory.timestamp >= yesterday)
            .order_by(MarketHistory.timestamp.asc())
            .all()
        )

        if len(history) < 2:
            change = 0.0
        else:
            start = history[0].price
            end = history[-1].price
            change = ((end - start) / start) * 100 if start != 0 else 0.0

        result.append({
            "player_id": player.id,
            "summoner_name": player.summoner_name,
            "price_change_24h": round(change, 2)
        })

    return result
