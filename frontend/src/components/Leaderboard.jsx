import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Leaderboard.css";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/leaderboard/");
        setLeaders(res.data);
      } catch (err) {
        console.error("Feil ved henting av leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
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
