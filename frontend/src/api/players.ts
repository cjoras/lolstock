import { apiFetch } from "./client";

export async function getPlayers() {
  return apiFetch("/api/players/");
}