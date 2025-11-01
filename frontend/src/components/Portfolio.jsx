import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { buyShares, sellShares } from "../services/api";

export default function Portfolio() {
  const { me, positions, balance, totalHoldingsValue, portfolioValue, playerPrices, refreshUserData, isLoading } = useUser();
  const [qtyByPlayer, setQtyByPlayer] = useState({});

  if (isLoading) return <div>Laster...</div>;

  const onChangeQty = (playerId, v) => {
    const n = Math.max(0, parseInt(v || "0", 10));
    setQtyByPlayer(prev => ({ ...prev, [playerId]: n }));
  };

  const doBuy = async (playerId) => {
    if (!me) return;
    const shares = qtyByPlayer[playerId] || 0;
    if (shares <= 0) return;
    try {
      await buyShares(me.id, playerId, shares);
      await refreshUserData();
      setQtyByPlayer(prev => ({ ...prev, [playerId]: 0 }));
    } catch (e) {
      console.error("Kjøp feilet:", e);
      alert("Kjøp feilet (se console)");
    }
  };

  const doSell = async (playerId) => {
    if (!me) return;
    const shares = qtyByPlayer[playerId] || 0;
    if (shares <= 0) return;
    try {
      await sellShares(me.id, playerId, shares);
      await refreshUserData();
      setQtyByPlayer(prev => ({ ...prev, [playerId]: 0 }));
    } catch (e) {
      console.error("Salg feilet:", e);
      alert("Salg feilet (se console)");
    }
  };

  const isLoggedIn = !!me;

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Portefølje</h2>
      {!isLoggedIn ? (
        <p>Logg inn for å se porteføljen din.</p>
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <strong>Bruker:</strong> {me.name}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Saldo:</strong> {balance.toFixed(2)}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>Beholdningsverdi:</strong> {totalHoldingsValue.toFixed(2)}
          </div>
          <div style={{ marginBottom: 16 }}>
            <strong>Total portefølje:</strong> {portfolioValue.toFixed(2)}
          </div>

          <h3>Dine investeringer</h3>
          {positions.length === 0 ? (
            <p>Ingen investeringer ennå.</p>
          ) : (
            <table class="portfolio-table">
              <thead>
                <tr>
                  <th>Spiller</th>
                  <th>Antall</th>
                  <th>Pris</th>
                  <th>Sum</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => (
                  <tr key={p.player_id}>
                    <td>{p.summoner_name}</td>
                    <td>{p.shares}</td>
                    <td>{p.stock_price?.toFixed(2)}</td>
                    <td>{p.total_value?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
