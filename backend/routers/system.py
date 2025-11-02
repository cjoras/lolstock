# backend/routers/system.py
import os
import subprocess
from fastapi import APIRouter, Header, HTTPException

router = APIRouter(prefix="/api/system", tags=["System"])

ADMIN_KEY = os.getenv("ADMIN_API_KEY")

@router.get("/update")
def trigger_update(x_api_key: str = Header(None)):
    """
    Kjører update_players.py trygt via en sikret API-nøkkel.
    Brukes av cron-job.org eller admin.
    """
    if not ADMIN_KEY:
        raise HTTPException(status_code=500, detail="Server missing ADMIN_API_KEY config")
    if x_api_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid API key")

    try:
        result = subprocess.run(
            ["python", "update_players.py"],
            capture_output=True,
            text=True,
            timeout=120
        )
        return {
            "status": "ok",
            "stdout": result.stdout,
            "stderr": result.stderr
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
