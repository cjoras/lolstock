from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from jose import jwt
import requests
from jwt.algorithms import RSAAlgorithm
from database import get_db
from models import User

router = APIRouter(prefix="/api/users", tags=["Users"])

# ⚙️ KONFIGURASJON
TENANT_ID = "2849b437-def2-4fa6-8fec-0d748da315b5"
EXPECTED_AUDIENCE = "api://e4f3a97c-8255-47ca-87e4-0683aa23238c"  # <- backend API app ID URI
JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"
ISSUER = f"https://sts.windows.net/{TENANT_ID}/"

def verify_token(authorization: str = Header(...)):
    """Valider Azure AD access token og returner dekodet payload."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    token = authorization.split(" ", 1)[1]

    # 🔑 Hent Microsofts offentlige nøkler
    try:
        jwks = requests.get(JWKS_URL, timeout=5).json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch JWKS: {e}")

    # Finn riktig nøkkel basert på 'kid'
    try:
        unverified_header = jwt.get_unverified_header(token)
        key = next((k for k in jwks["keys"] if k["kid"] == unverified_header.get("kid")), None)
        if not key:
            raise HTTPException(status_code=401, detail="No matching JWK key found")
        public_key = RSAAlgorithm.from_jwk(key)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token header: {e}")

    # Dekoder tokenet
    try:
        decoded = jwt.decode(
            token,
            key=public_key,
            algorithms=["RS256"],
            audience=EXPECTED_AUDIENCE,
            issuer=ISSUER,
        )
        print(f"✅ Token verifisert OK for bruker: {decoded.get('upn')} ({decoded.get('oid')})")
        return decoded
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTClaimsError as e:
        raise HTTPException(status_code=401, detail=f"Invalid claims: {e}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {e}")

@router.get("/me")
def get_me(decoded=Depends(verify_token), db: Session = Depends(get_db)):
    entra_oid = decoded.get("oid")
    if not entra_oid:
        raise HTTPException(status_code=400, detail="Token missing OID")

    user = db.query(User).filter(User.entra_id == entra_oid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 🧮 Beregn portefølje
    holdings = [
        {
            "player_id": h.player_id,
            "summoner_name": h.player.summoner_name if h.player else None,
            "shares": h.shares,
            "stock_price": h.player.stock_price if h.player else 0.0,
            "total_value": round(h.shares * (h.player.stock_price if h.player else 0.0), 2),
        }
        for h in user.holdings
    ]
    total_holdings_value = round(sum(x["total_value"] for x in holdings), 2)

    return {
        "id": user.id,
        "name": user.name,
        "balance": user.balance,
        "positions": holdings,
        "total_holdings_value": total_holdings_value,
    }
