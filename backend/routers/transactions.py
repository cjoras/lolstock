from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User, Player, Holding, Transaction
from datetime import datetime

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.post("/buy")
def buy_stock(user_id: int, player_id: int, shares: int, db: Session = Depends(get_db)):
    # Hent bruker og spiller
    user = db.query(User).filter(User.id == user_id).first()
    player = db.query(Player).filter(Player.id == player_id).first()
    if not user or not player:
        raise HTTPException(status_code=404, detail="User or Player not found")

    # Beregn totalpris
    total_price = player.stock_price * shares

    # Sjekk saldo
    if user.balance < total_price:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Oppdater saldo
    user.balance -= total_price

    # Oppdater eller opprett holding
    holding = db.query(Holding).filter_by(user_id=user_id, player_id=player_id).first()
    if holding:
        holding.shares += shares
    else:
        holding = Holding(user_id=user_id, player_id=player_id, shares=shares)
        db.add(holding)

    # Logg transaksjon
    transaction = Transaction(
        user_id=user_id,
        player_id=player_id,
        shares=shares,
        price=player.stock_price,            # ✅ ENDRET
        transaction_type="BUY",
        timestamp=datetime.utcnow()
    )
    db.add(transaction)

    db.commit()
    db.refresh(user)
    return {"message": f"Bought {shares} shares of {player.summoner_name}", "new_balance": user.balance}


@router.post("/sell")
def sell_stock(user_id: int, player_id: int, shares: int, db: Session = Depends(get_db)):
    # Hent bruker og spiller
    user = db.query(User).filter(User.id == user_id).first()
    player = db.query(Player).filter(Player.id == player_id).first()
    holding = db.query(Holding).filter_by(user_id=user_id, player_id=player_id).first()

    if not user or not player or not holding:
        raise HTTPException(status_code=404, detail="User, Player, or Holding not found")

    # Sjekk at brukeren eier nok aksjer
    if holding.shares < shares:
        raise HTTPException(status_code=400, detail="Not enough shares to sell")

    # Oppdater saldo
    total_price = player.stock_price * shares
    user.balance += total_price

    # Oppdater holding
    holding.shares -= shares
    if holding.shares == 0:
        db.delete(holding)

    # Logg transaksjon
    transaction = Transaction(
        user_id=user_id,
        player_id=player_id,
        shares=shares,
        price=player.stock_price,            # ✅ ENDRET
        transaction_type="SELL",
        timestamp=datetime.utcnow()
    )
    db.add(transaction)

    db.commit()
    db.refresh(user)
    return {"message": f"Sold {shares} shares of {player.summoner_name}", "new_balance": user.balance}
