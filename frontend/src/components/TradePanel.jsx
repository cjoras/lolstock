import React, { useState } from "react";
import axios from "axios";
import { useUser } from "../context/UserContext";

export default function TradePanel() {
  const { me, playerPrices, refreshUserData } = useUser();
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [shares, setShares] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!me) return <p>Logg inn for å handle aksjer.</p>;

  const handleTrade = async (type) => {
    if (!selectedPlayer || shares <= 0) return;
    setLoading(true);

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/transactions/${type}`,
        null,
        {
          params: {
            user_id: me.id,
            player_id: selectedPlayer,
            shares,
          },
        }
      );
      refreshUserData();
    } catch (err) {
      console.error(`Feil ved ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trade-panel">
      <h2>Kjøp & Selg</h2>
      <select
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
      >
        <option value="">Velg spiller</option>
        {playerPrices.map((p) => (
          <option key={p.id} value={p.id}>
            {p.summoner_name} ({p.stock_price.toFixed(2)})
          </option>
        ))}
      </select>

      <input
        type="number"
        min="1"
        value={shares}
        onChange={(e) => setShares(Number(e.target.value))}
        style={{ width: "80px", marginLeft: "1rem" }}
      />

      <button disabled={loading} onClick={() => handleTrade("buy")}>
        🟢 Kjøp
      </button>
      <button disabled={loading} onClick={() => handleTrade("sell")}>
        🔴 Selg
      </button>
    </div>
  );
}
