import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { useMsal } from "@azure/msal-react";
import { buyStock, sellStock } from "../services/api";

const Market = () => {
  const { instance, accounts } = useMsal();
  const { playerPrices, refreshUserData } = useUser();
  const [loadingId, setLoadingId] = useState(null);
  const [message, setMessage] = useState("");

  const handleBuy = async (playerId) => {
    try {
      setLoadingId(playerId);
      const res = await buyStock(instance, accounts, playerId, 1);
      setMessage(res.message || "Kjøp fullført!");
      await refreshUserData();
    } catch (err) {
      console.error(err);
      setMessage("Feil under kjøp.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSell = async (playerId) => {
    try {
      setLoadingId(playerId);
      const res = await sellStock(instance, accounts, playerId, 1);
      setMessage(res.message || "Salg fullført!");
      await refreshUserData();
    } catch (err) {
      console.error(err);
      setMessage("Feil under salg.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Marked</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {playerPrices.length === 0 ? (
        <p>Ingen spillere funnet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Spiller</th>
              <th>Pris</th>
              <th>Handlinger</th>
            </tr>
          </thead>
          <tbody>
            {playerPrices.map((p) => (
              <tr key={p.id}>
                <td>{p.summoner_name}</td>
                <td>{p.stock_price.toFixed(2)}</td>
                <td>
                  <button
                    onClick={() => handleBuy(p.id)}
                    disabled={loadingId === p.id}
                    style={{ marginRight: "8px" }}
                  >
                    🟢 Kjøp
                  </button>
                  <button
                    onClick={() => handleSell(p.id)}
                    disabled={loadingId === p.id}
                  >
                    🔴 Selg
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Market;
