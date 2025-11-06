import React, { useEffect, useState } from "react";
import axios from "axios";
import "./MarketMovers.css";

const MarketMovers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await axios.get("https://lolstock.onrender.com/api/market/summary");
        const sorted = res.data.sort((a, b) => b.price_change_24h - a.price_change_24h);
        setPlayers(sorted);
      } catch (err) {
        console.error("❌ Feil ved henting av markedsdata:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  if (loading) return <p style={{ color: "#aaa" }}>Laster markedsdata...</p>;
  if (!players.length) return <p style={{ color: "#aaa" }}>Ingen data tilgjengelig.</p>;

  const topGainers = players.slice(0, 5);
  const topLosers = players.slice(-5).reverse();

  return (
    <div className="market-movers">
      <h2>📈 Markedsbevegelser (24t)</h2>

      <div className="movers-grid">
        <div className="gainers">
          <h3>🏆 Toppvinnere</h3>
          <table>
            <thead>
              <tr>
                <th>Spiller</th>
                <th>Endring</th>
              </tr>
            </thead>
            <tbody>
              {topGainers.map((p) => (
                <tr key={p.player_id}>
                  <td>{p.summoner_name}</td>
                  <td className="green">📈 +{p.price_change_24h.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="losers">
          <h3>📉 Topp-tapere</h3>
          <table>
            <thead>
              <tr>
                <th>Spiller</th>
                <th>Endring</th>
              </tr>
            </thead>
            <tbody>
              {topLosers.map((p) => (
                <tr key={p.player_id}>
                  <td>{p.summoner_name}</td>
                  <td className="red">📉 {p.price_change_24h.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketMovers;
