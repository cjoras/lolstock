// frontend/src/services/api.js
import axios from "axios";
import { loginRequest } from "../authConfig";

// Dynamisk base-URL med sikker fallback
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ||
  (window.location.hostname.includes("localhost")
    ? "http://127.0.0.1:8000"
    : "https://lolstock.onrender.com");

console.log("🌍 API BASE_URL:", BASE_URL);

// --- Auth token helper ---
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

// --- Auth ---
export async function postLogin(instance, account) {
  const entra_id = account?.idTokenClaims?.oid;
  const name = account?.name || account?.username || "Unknown";
  const url = `${BASE_URL}/api/auth/login`;
  const { data } = await axios.post(url, null, { params: { entra_id, name } });
  return data;
}

// --- Users ---
export async function getUserMe(instance, account) {
  const token = await getAccessToken(instance, account);
  const { data } = await axios.get(`${BASE_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

// --- Players ---
export async function getPlayers() {
  const { data } = await axios.get(`${BASE_URL}/api/players/`);
  return data;
}

// --- Transactions ---
export async function buyShares(userId, playerId, shares) {
  const { data } = await axios.post(`${BASE_URL}/api/transactions/buy`, null, {
    params: { user_id: userId, player_id: playerId, shares },
  });
  return data;
}

export async function sellShares(userId, playerId, shares) {
  const { data } = await axios.post(`${BASE_URL}/api/transactions/sell`, null, {
    params: { user_id: userId, player_id: playerId, shares },
  });
  return data;
}

// --- Market ---
export async function getMarketHistory() {
  const { data } = await axios.get(`${BASE_URL}/api/market/history`);
  return data;
}

export async function getMarketSummary() {
  const { data } = await axios.get(`${BASE_URL}/api/market/summary`);
  return data;
}

// --- Leaderboard ---
export async function getLeaderboard() {
  const { data } = await axios.get(`${BASE_URL}/api/leaderboard/`);
  return data;
}
