import os
import requests
from dotenv import load_dotenv

load_dotenv()

RIOT_API_KEY = os.getenv("RIOT_API_KEY")

# Base-URLer for ulike Riot tjenester
ACCOUNT_BASE = "https://europe.api.riotgames.com/riot/account/v1/accounts"
LOL_BASE = "https://euw1.api.riotgames.com/lol"  # EUW1 for League data


def get_account_by_riot_id(game_name: str, tag_line: str):
    """Hent Riot Account-informasjon (inkl. puuid)"""
    url = f"{ACCOUNT_BASE}/by-riot-id/{game_name}/{tag_line}"
    headers = {"X-Riot-Token": RIOT_API_KEY}

    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return {"error": f"Riot API error {r.status_code}: {r.text}"}
    return r.json()


def get_summoner_by_puuid(puuid: str):
    """Hent League of Legends summoner info ved hjelp av PUUID"""
    url = f"{LOL_BASE}/summoner/v4/summoners/by-puuid/{puuid}"
    headers = {"X-Riot-Token": RIOT_API_KEY}

    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return {"error": f"Riot API error {r.status_code}: {r.text}"}
    return r.json()


def get_ranked_stats_by_summoner_id(summoner_id: str):
    """Hent ranked stats for en spiller"""
    url = f"{LOL_BASE}/league/v4/entries/by-summoner/{summoner_id}"
    headers = {"X-Riot-Token": RIOT_API_KEY}

    r = requests.get(url, headers=headers)
    if r.status_code != 200:
        return {"error": f"Riot API error {r.status_code}: {r.text}"}
    return r.json()


if __name__ == "__main__":
    # Eksempelbruk med Ebrat#EUW
    account = get_account_by_riot_id("Ebrat", "EUW")
    print("🔹 Account:", account)

    if "puuid" in account:
        summoner = get_summoner_by_puuid(account["puuid"])
        print("🔹 Summoner:", summoner)

        if "id" in summoner:
            ranked = get_ranked_stats_by_summoner_id(summoner["id"])
            print("🔹 Ranked stats:", ranked)

def get_ranked_stats_for_puuid(puuid: str):
    summoner = get_summoner_by_puuid(puuid)
    if "id" not in summoner:
        return None

    ranked = get_ranked_stats_by_summoner_id(summoner["id"])
    for entry in ranked:
        if entry["queueType"] == "RANKED_SOLO_5x5":
            return {
                "tier": entry["tier"],
                "rank": entry["rank"],
                "wins": entry["wins"],
                "losses": entry["losses"]
            }
    return None