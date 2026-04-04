"use client";

import { useState, useEffect } from "react";

interface Suggested {
  _id: string;
  ticker: string;
  signal: string;
  confidence_score: number;
  title: string;
  domain: string;
  publishedAt: string;
  rsi?: number;
  macd?: number;
}

export default function SuggestedStocksPanel() {
  const [stocks, setStocks]   = useState<Suggested[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState<string | null>(null);
  const [added, setAdded]     = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchSuggested = async () => {
      setLoading(true);
      try {
        const res  = await fetch("/api/portfolio/suggested");
        const data = await res.json();
        setStocks(data.suggested ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggested();
  }, []);

  const handleAddToPortfolio = async (ticker: string) => {
    setAdding(ticker);
    try {
      const res = await fetch("/api/portfolio", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ticker, qty: 1 }),
      });
      if (res.ok) {
        setAdded((prev) => new Set(prev).add(ticker));
      }
    } finally {
      setAdding(null);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1)  return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="suggested">
      <div className="panel-header">
        <h2 className="panel-title">Suggested Stocks</h2>
        <span className="panel-subtitle">AI-picked BUY signals not in your portfolio</span>
      </div>

      {loading ? (
        <div className="panel-loading">Finding suggestions...</div>
      ) : stocks.length === 0 ? (
        <div className="empty-state">
          <p>No suggestions right now.</p>
          <p>Check back after the next news pipeline run.</p>
        </div>
      ) : (
        <ul className="suggested-list">
          {stocks.map((s) => (
            <li key={s._id} className="suggested-card">
              <div className="suggested-top">
                <div className="suggested-left">
                  <span className="stock-ticker">{s.ticker}</span>
                  <span className="signal-badge signal-buy">{s.signal}</span>
                </div>
                <div className="suggested-right">
                  <span className="conf-bar-wrap">
                    <span
                      className="conf-bar-fill"
                      style={{ width: `${(s.confidence_score * 100).toFixed(0)}%` }}
                    />
                  </span>
                  <span className="conf-score">
                    {(s.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <p className="suggested-title">{s.title}</p>

              <div className="suggested-meta">
                <span className="news-domain">{s.domain}</span>
                <span className="news-time">{timeAgo(s.publishedAt)}</span>
                {s.rsi !== undefined && (
                  <span className="tech-tag">RSI {s.rsi?.toFixed(1)}</span>
                )}
                {s.macd !== undefined && (
                  <span className="tech-tag">MACD {s.macd?.toFixed(2)}</span>
                )}
              </div>

              <button
                className={`btn-add-portfolio ${added.has(s.ticker) ? "btn-added" : ""}`}
                onClick={() => handleAddToPortfolio(s.ticker)}
                disabled={adding === s.ticker || added.has(s.ticker)}
              >
                {added.has(s.ticker)
                  ? "✓ Added to portfolio"
                  : adding === s.ticker
                  ? "Adding..."
                  : "+ Add to portfolio"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}