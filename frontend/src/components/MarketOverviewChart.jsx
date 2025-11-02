import React, { useEffect, useState } from "react";
import { getMarketHistory } from "../services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

const MarketOverviewChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await getMarketHistory();
        setData(res);
      } catch (err) {
        console.error("Feil ved henting av markedsdata:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, []);

  if (loading) return <p style={{ color: "#aaa" }}>Laster markedsdata...</p>;
  if (!data.length) return <p style={{ color: "#aaa" }}>Ingen historiske data funnet.</p>;

  // Finn ALLE unike spillernavn i datasettet
  const playerNames = Array.from(
    new Set(data.flatMap((row) => Object.keys(row).filter((k) => k !== "timestamp")))
  );

  return (
    <div
      style={{
        width: "100%",
        height: 420,
        background: "#0e0e0e",
        borderRadius: "16px",
        marginBottom: "2rem",
      }}
    >
      <h2
        style={{
          color: "#ffcc00",
          marginBottom: "1rem",
          textAlign: "center",
          letterSpacing: "0.5px",
        }}
      >
        Markedsoversikt
      </h2>

      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />

          <XAxis
            dataKey="timestamp"
            tickFormatter={(t) => new Date(t).toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" })}
            tick={{ fill: "#ccc", fontSize: 12 }}
            stroke="#666"
          />

          <YAxis
            tick={{ fill: "#ccc", fontSize: 12 }}
            stroke="#666"
            width={70}
            tickFormatter={(val) => `${val.toFixed(0)}g`}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px",
              color: "#fff",
            }}
            labelFormatter={(t) =>
              new Date(t).toLocaleString("no-NO", {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "short",
              })
            }
          />

          <Legend
            wrapperStyle={{
              paddingTop: "10px",
              color: "#ccc",
              fontSize: "13px",
            }}
          />

          {playerNames.map((name, idx) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={`hsl(${(idx * 72) % 360}, 100%, 60%)`}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MarketOverviewChart;