# routers/players.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Player

router = APIRouter(prefix="/api/players", tags=["players"])

@router.get("/")
def get_players(db: Session = Depends(get_db)):
    players = db.query(Player).all()
    return players

@router.get("/{player_id}")
def get_player(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.id == player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player