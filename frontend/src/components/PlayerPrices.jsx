// frontend/src/components/PlayerPrices.jsx
import React from "react";
import { useUser } from "../context/UserContext";

const PlayerPrices = () => {
  const { isLoading, playerPrices } = useUser();

  if (isLoading && playerPrices.length === 0) return <p>Laster priser...</p>;

  return (
    <div style={{ marginTop: "1rem" }}>
      <h2>Priser (spillere)</h2>
      {playerPrices.length === 0 ? (
        <p>Ingen spillere funnet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Spiller</th>
              <th>Pris</th>
            </tr>
          </thead>
          <tbody>
            {playerPrices.map((p) => (
              <tr key={p.id}>
                <td>{p.summoner_name}</td>
                <td>{Number(p.stock_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PlayerPrices;
