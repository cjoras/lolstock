import React, { useEffect, useState } from "react";
import { getMarketHistory } from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MarketOverviewChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await getMarketHistory();
        setData(res);
      } catch (err) {
        console.error("Feil ved henting av markedsdata:", err);
        setError("Kunne ikke hente markedsdata");
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, []);

  if (loading) return <p>Laster markedsdata...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!data.length) return <p>Ingen historiske data funnet.</p>;

  const playerNames = Object.keys(data[0]).filter((k) => k !== "timestamp");

  return (
    <div
      style={{
        width: "100%",
        height: 400,
        background: "#111",
        borderRadius: "12px",
        padding: "1rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.4)",
      }}
    >
      <h2 style={{ color: "#ffcc00", marginBottom: "0.5rem" }}>
        Markedsoversikt
      </h2>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(t) =>
              new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }
          />
          <YAxis />
          <Tooltip
            contentStyle={{ backgroundColor: "#222", border: "1px solid #555" }}
            labelFormatter={(t) => new Date(t).toLocaleString()}
          />
          <Legend />
          {playerNames.map((name, idx) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={`hsl(${(idx * 60) % 360}, 100%, 60%)`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketOverviewChart;
