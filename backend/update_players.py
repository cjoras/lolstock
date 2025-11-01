import os
import time
import requests
import math
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timezone
from database import SessionLocal
from models import Player
from dotenv import load_dotenv

load_dotenv()
RIOT_API_KEY = os.getenv("RIOT_API_KEY")


# --- Hjelpefunksjoner --------------------------------------------------------

def get_soloq_data(puuid: str, retries=3, delay=2):
    """Henter RANKED_SOLO_5x5-data med retry og rate-limit håndtering."""
    url = f"https://euw1.api.riotgames.com/lol/league/v4/entries/by-puuid/{puuid}"
    headers = {"X-Riot-Token": RIOT_API_KEY}

    for attempt in range(retries):
        try:
            response = requests.get(url, headers=headers, timeout=5)
            # Riot kan returnere 429 ved rate-limit
            if response.status_code == 429:
                print("⏳ Rate limited — venter litt ...")
                time.sleep(delay * (attempt + 1))
                continue

            response.raise_for_status()
            data = response.json()
            return next((q for q in data if q["queueType"] == "RANKED_SOLO_5x5"), None)
        except Exception as e:
            print(f"⚠️ Riot API request failed (attempt {attempt+1}/{retries}): {e}")
            time.sleep(delay)

    return None


def calculate_new_price(player, delta_wins, delta_losses):
    """Moderat volatil modell for prisendring basert på nylig ytelse."""
    total_games = delta_wins + delta_losses
    old_price = player.stock_price

    # Ingen nye kamper → ingen endring
    if total_games <= 0:
        return old_price

    # Winrate-basert prestasjon: -1 → +1
    recent_wr = delta_wins / total_games
    performance_factor = (recent_wr - 0.5) * 2

    # Volatilitet øker litt med antall kamper
    volatility_boost = min(1.0 + (total_games / 100), 1.2)

    # Basert på performance og volatilitet: ±5%
    percent_change = performance_factor * 0.05 * volatility_boost
    new_price = old_price * (1 + percent_change)

    # Rank-multiplikator (for fundamentalt nivå)
    rank_tiers = {
        "IRON": 0.9, "BRONZE": 1.0, "SILVER": 1.1, "GOLD": 1.2,
        "PLATINUM": 1.3, "EMERALD": 1.4, "DIAMOND": 1.6,
        "MASTER": 1.8, "GRANDMASTER": 2.0, "CHALLENGER": 2.5
    }
    tier = player.current_rank.split(" ")[0].upper()
    tier_mult = rank_tiers.get(tier, 1.0)

    new_price *= (0.8 + 0.2 * tier_mult)

    # Begrens svingning til ±10 % per oppdatering
    new_price = max(min(new_price, old_price * 1.1), old_price * 0.9)
    return round(new_price, 2)


# --- Hovedfunksjon -----------------------------------------------------------

def update_players():
    db: Session = SessionLocal()
    players = db.query(Player).all()
    print(f"🔄 Oppdaterer {len(players)} spillere...")

    # Samme timestamp for alle (for markeds-snapshot)
    snapshot_time = datetime.now(timezone.utc)

    for i, player in enumerate(players):
        # Hindre rate-limit (maks ca. 1 request per sekund)
        time.sleep(0.7)

        rank_data = get_soloq_data(player.puuid)
        if not rank_data:
            print(f"⚠️ Ingen data for {player.summoner_name}")
            continue

        old_wins, old_losses, old_price = player.wins, player.losses, player.stock_price
        player.current_rank = f"{rank_data['tier']} {rank_data['rank']}"
        player.wins, player.losses = rank_data["wins"], rank_data["losses"]

        delta_wins = player.wins - old_wins
        delta_losses = player.losses - old_losses
        player.stock_price = calculate_new_price(player, delta_wins, delta_losses)

        db.commit()

        # Vis endring i terminal
        symbol = "🟢" if player.stock_price >= old_price else "🔴"
        diff_pct = (player.stock_price - old_price) / old_price * 100
        print(f"{symbol} {player.summoner_name:<15} | {player.current_rank:<10} | "
              f"Pris: {old_price:.2f} → {player.stock_price:.2f} ({diff_pct:+.2f}%)")

        # Logg historikk for markedsoversikten
        db.execute(
            text("INSERT INTO player_price_history (player_id, price, timestamp) "
                 "VALUES (:pid, :price, :ts)"),
            {"pid": player.id, "price": player.stock_price, "ts": snapshot_time}
        )

    db.commit()
    db.close()
    print(f"📈 Market snapshot fullført @ {snapshot_time.isoformat()}")


if __name__ == "__main__":
    update_players()
