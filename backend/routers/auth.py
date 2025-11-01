from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login")
def login_user(entra_id: str, name: str, db: Session = Depends(get_db)):
    """
    Registrer ny bruker eller hent eksisterende basert på EntraID (Microsoft OID).
    """
    user = db.query(User).filter(User.entra_id == entra_id).first()

    if not user:
        user = User(entra_id=entra_id, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
        message = "New user registered"
    else:
        message = "User already exists"

    return {
        "message": message,
        "user": {
            "id": user.id,
            "name": user.name,
            "balance": user.balance
        }
    }
