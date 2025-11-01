import React from "react";
import { AuthButtons } from "./components/AuthButtons";
import { UserProvider, useUser } from "./context/UserContext";
import Portfolio from "./components/Portfolio";
import TradePanel from "./components/TradePanel";
import Leaderboard from "./components/Leaderboard";
import MarketOverviewChart from "./components/MarketOverviewChart";
import MarketMovers from "./components/MarketMovers";
import "./App.css";

const DashboardHeader = () => {
  const { me, positions, portfolioValue, dailyChange } = useUser();

  if (!me) {
    return (
      <div className="dashboard-header">
        <p style={{ opacity: 0.7 }}>Logg inn for å se portefølje-oversikten</p>
      </div>
    );
  }

  const totalShares = positions.reduce((sum, p) => sum + (p.shares || 0), 0);

  return (
    <div className="dashboard-header">
      <div>
        <h3>Total portefølje</h3>
        <p className="stat-value">{portfolioValue.toLocaleString()} 💰</p>
      </div>
      <div>
        <h3>Aksjer eiet</h3>
        <p className="stat-value">{totalShares}</p>
      </div>
      <div>
        <h3>Daglig endring</h3>
        <p className={`stat-value ${dailyChange >= 0 ? "green" : "red"}`}>
          {dailyChange >= 0 ? "+" : ""}
          {dailyChange.toFixed(2)} %
        </p>
      </div>
    </div>
  );
};


export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>LoLStock</h1>
        <nav className="top-nav">
          <a href="#market">Markedsoversikt</a>
          <a href="#portfolio">Portefølje</a>
          <a href="#trade">Kjøp & Selg</a>
          <a href="#leaderboard">Leaderboard</a>
        </nav>
        <AuthButtons />
      </header>

      <UserProvider>
        <DashboardHeader />

        <main className="grid-layout">
          <section id="market" className="market-section">
            <MarketOverviewChart />
            <MarketMovers />
          </section>

          <section id="portfolio" className="portfolio-section">
            <Portfolio />
          </section>

          <section id="trade" className="trade-section">
            <TradePanel />
          </section>

          <aside id="leaderboard" className="leaderboard-section">
            <Leaderboard />
          </aside>
        </main>
      </UserProvider>
    </div>
  );
}
