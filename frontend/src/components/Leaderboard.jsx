import React, { useEffect, useState } from "react";
import { getLeaderboard } from "../services/api";
import "./Leaderboard.css";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLeaderboard();
        setLeaders(res);
      } catch (err) {
        console.error("Feil ved henting av leaderboard:", err);
      }
    };
    load();
  }, []);

  if (loading) return <p>Laster leaderboard...</p>;
  if (!leaders.length) return <p>Ingen brukere funnet.</p>;

  return (
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>
      <table>
        <thead>
          <tr>
            <th>Plass</th>
            <th>Bruker</th>
            <th>Saldo</th>
            <th>Aksjeverdi</th>
            <th>Total verdi</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((u, idx) => (
            <tr key={u.name}>
              <td>#{idx + 1}</td>
              <td>{u.name}</td>
              <td>{u.balance.toLocaleString()} 💰</td>
              <td>{u.holdings_value.toLocaleString()} 🪙</td>
              <td><strong>{u.total_portfolio_value.toLocaleString()}</strong> 🏅</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
