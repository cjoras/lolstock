import axios from "axios";
import { loginRequest } from "../authConfig";

const BASE = "http://127.0.0.1:8000";

async function getAccessToken(instance, account) {
  const active = account || instance.getActiveAccount();
  if (!active) throw new Error("Ingen aktiv konto (ikke logget inn)");

  try {
    const res = await instance.acquireTokenSilent({
      ...loginRequest,
      account: active,
    });
    console.log("🎟️ Token hentet OK (første 30 tegn):", res.accessToken.slice(0, 30));
    return res.accessToken;
  } catch (err) {
    console.error("❌ acquireTokenSilent feilet:", err);
    throw err;
  }
}

export async function postLogin(instance, account) {
  const entra_id = account?.idTokenClaims?.oid;
  const name = account?.name || account?.username || "Unknown";
  const url = `${BASE}/api/auth/login`;
  const { data } = await axios.post(url, null, { params: { entra_id, name } });
  return data;
}

export async function getPlayers() {
  const { data } = await axios.get(`${BASE}/api/players/`);
  return data;
}

export async function getUserMe(instance, account) {
  const token = await getAccessToken(instance, account);
  const url = `${BASE}/api/users/me`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export async function buyShares(userId, playerId, shares) {
  const { data } = await axios.post(`${BASE}/api/transactions/buy`, null, {
    params: { user_id: userId, player_id: playerId, shares },
  });
  return data;
}

export async function sellShares(userId, playerId, shares) {
  const { data } = await axios.post(`${BASE}/api/transactions/sell`, null, {
    params: { user_id: userId, player_id: playerId, shares },
  });
  return data;
}
