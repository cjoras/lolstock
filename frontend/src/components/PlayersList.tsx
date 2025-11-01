import { useEffect, useState } from "react";
import { getPlayers } from "../api/players";

interface Player {
  id: number;
  username: string;
  score: number;
}

export default function PlayersList() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlayers()
      .then(setPlayers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Laster spillere...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Spillere</h2>
      <ul className="space-y-2">
        {players.map((player) => (
          <li key={player.id} className="p-2 border rounded">
            <p>
              <strong>{player.username}</strong> — {player.score} poeng
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
