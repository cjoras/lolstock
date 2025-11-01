import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useMsal, useAccount } from "@azure/msal-react";
import { getPlayers, getUserMe } from "../services/api";
import axios from "axios";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || null);

  const [isLoading, setIsLoading] = useState(false);
  const [playerPrices, setPlayerPrices] = useState([]);
  const [me, setMe] = useState(null);
  const [marketChanges, setMarketChanges] = useState([]); // henter fra /api/market/summary

  // Sørg for aktiv konto
  useEffect(() => {
    const current = instance.getActiveAccount();
    if (!current && accounts.length > 0) {
      instance.setActiveAccount(accounts[0]);
      console.log("✅ Aktiv konto satt:", accounts[0]);
    }
  }, [accounts, instance]);

  // Hent spillere, brukerdata og markedsendringer
  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const players = await getPlayers();
        setPlayerPrices(players || []);

        const active = instance.getActiveAccount();
        if (active) {
          const meResp = await getUserMe(instance, active);
          setMe(meResp);
        } else {
          setMe(null);
        }

        const summary = await axios.get("http://127.0.0.1:8000/api/market/summary");
        setMarketChanges(summary.data);
      } catch (err) {
        console.error("❌ Feil ved lasting av data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [account, instance, accounts]);

  // ✅ Beregn daglig endring i porteføljen basert på beholdning
  const dailyChange = useMemo(() => {
    if (!me || !marketChanges.length) return 0;

    let totalChangeValue = 0;
    let totalValue = 0;

    for (const pos of me.positions || []) {
      const playerChange = marketChanges.find((p) => p.player_id === pos.player_id);
      if (!playerChange) continue;

      const changePct = playerChange.price_change_24h || 0;
      const valueNow = pos.stock_price * pos.shares;

      totalValue += valueNow;
      totalChangeValue += valueNow * (changePct / 100);
    }

    if (totalValue === 0) return 0;
    return (totalChangeValue / totalValue) * 100;
  }, [me, marketChanges]);

  const playerPriceMap = useMemo(() => {
    const m = new Map();
    for (const p of playerPrices) {
      m.set(p.id, { name: p.summoner_name, price: p.stock_price });
    }
    return m;
  }, [playerPrices]);

  const positions = me?.positions || [];
  const totalHoldingsValue = me?.total_holdings_value ?? 0;
  const balance = me?.balance ?? 0;
  const portfolioValue = totalHoldingsValue + balance;

  const value = {
    isLoading,
    playerPrices,
    playerPriceMap,
    me,
    positions,
    totalHoldingsValue,
    balance,
    portfolioValue,
    dailyChange, // ✅ nå tilgjengelig
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
