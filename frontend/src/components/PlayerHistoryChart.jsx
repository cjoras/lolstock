import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const PlayerHistoryChart = ({ playerId }) => {
  const [history, setHistory] = useState([]);
  const [player, setPlayer] = useState("");
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/players/${playerId}/history`);
        setHistory(res.data.history);
        setPlayer(res.data.player);
        setChange(res.data.change_24h);
      } catch (err) {
        console.error("Feil ved henting av historikk:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [playerId]);

  if (loading) return <p>Laster graf...</p>;
  if (!history.length) return <p>Ingen data for denne spilleren enda.</p>;

  const changeColor = change > 0 ? "#00ff88" : change < 0 ? "#ff5555" : "#aaa";

  return (
    <div style={{ width: "100%", height: 300, background: "#111", borderRadius: "12px", padding: "1rem", marginTop: "1rem" }}>
      <h3 style={{ color: "#ffcc00" }}>
        {player} — <span style={{ color: changeColor }}>{change > 0 ? "▲" : change < 0 ? "▼" : ""}{change}% siste 24t</span>
      </h3>
      <ResponsiveContainer>
        <LineChart data={history}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip
            labelFormatter={(t) => new Date(t).toLocaleString()}
            formatter={(value) => [`${value.toFixed(2)} gull`, "Pris"]}
          />
          <Line type="monotone" dataKey="price" stroke="#ffcc00" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlayerHistoryChart;
