from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User

router = APIRouter(prefix="/api/leaderboard", tags=["Leaderboard"])

@router.get("/")
def get_leaderboard(db: Session = Depends(get_db)):
    """
    Returnerer liste over alle brukere med total porteføljeverdi
    (saldo + verdi av holdings), sortert fra høyest til lavest.
    """
    users = db.query(User).all()

    leaderboard = []
    for u in users:
        holdings = [
            (h.shares * (h.player.stock_price if h.player else 0))
            for h in u.holdings
        ]
        total_holdings_value = round(sum(holdings), 2)
        total_portfolio_value = round(u.balance + total_holdings_value, 2)

        leaderboard.append({
            "name": u.name,
            "balance": round(u.balance, 2),
            "holdings_value": total_holdings_value,
            "total_portfolio_value": total_portfolio_value,
        })

    leaderboard.sort(key=lambda x: x["total_portfolio_value"], reverse=True)
    return leaderboard
