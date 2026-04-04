"use client";

import { useState, useEffect, useCallback } from "react";

interface Stock {
  _id: string;
  ticker: string;
  qty: number;
  addedAt: string;
  signal?: string;
  confidence_score?: number;
}

export default function WatchlistPanel() {
  const [stocks, setStocks]     = useState<Stock[]>([]);
  const [loading, setLoading]   = useState(true);
  const [ticker, setTicker]     = useState("");
  const [qty, setQty]           = useState<number>(1);
  const [adding, setAdding]     = useState(false);
  const [error, setError]       = useState("");
  const [editId, setEditId]     = useState<string | null>(null);
  const [editQty, setEditQty]   = useState<number>(1);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/portfolio");
      const data = await res.json();
      setStocks(data.stocks ?? []);
    } catch {
      setError("Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

  const handleAdd = async () => {
    if (!ticker.trim() || qty < 1) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/portfolio", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ticker: ticker.toUpperCase().trim(), qty }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setTicker("");
      setQty(1);
      fetchPortfolio();
    } catch {
      setError("Failed to add stock");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (t: string) => {
    try {
      await fetch(`/api/portfolio/${t}`, { method: "DELETE" });
      fetchPortfolio();
    } catch {
      setError("Failed to remove stock");
    }
  };

  const handleUpdateQty = async (t: string) => {
    try {
      await fetch(`/api/portfolio/${t}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ qty: editQty }),
      });
      setEditId(null);
      fetchPortfolio();
    } catch {
      setError("Failed to update quantity");
    }
  };

  const signalColor = (signal?: string) => {
    if (!signal) return "signal-none";
    if (signal.includes("BUY"))  return "signal-buy";
    if (signal.includes("SELL")) return "signal-sell";
    return "signal-hold";
  };

  return (
    <div className="watchlist">
      <div className="panel-header">
        <h2 className="panel-title">My Watchlist</h2>
        <span className="panel-count">{stocks.length} stocks</span>
      </div>

      {/* Add stock form */}
      <div className="add-stock-form">
        <input
          className="input-ticker"
          type="text"
          placeholder="Ticker (e.g. TCS)"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          maxLength={10}
        />
        <input
          className="input-qty"
          type="number"
          placeholder="Qty"
          value={qty}
          min={1}
          onChange={(e) => setQty(parseInt(e.target.value) || 1)}
        />
        <button
          className="btn-add"
          onClick={handleAdd}
          disabled={adding || !ticker.trim()}
        >
          {adding ? "Adding..." : "+ Add"}
        </button>
      </div>

      {error && <p className="form-error">{error}</p>}

      {/* Stock list */}
      {loading ? (
        <div className="panel-loading">Loading...</div>
      ) : stocks.length === 0 ? (
        <div className="empty-state">
          <p>No stocks yet.</p>
          <p>Add your first stock above to get started.</p>
        </div>
      ) : (
        <ul className="stock-list">
          {stocks.map((s) => (
            <li key={s._id} className="stock-item">
              <div className="stock-left">
                <span className="stock-ticker">{s.ticker}</span>
                {s.signal && (
                  <span className={`signal-badge ${signalColor(s.signal)}`}>
                    {s.signal}
                  </span>
                )}
                {s.confidence_score && (
                  <span className="conf-score">
                    {(s.confidence_score * 100).toFixed(0)}%
                  </span>
                )}
              </div>

              <div className="stock-right">
                {editId === s._id ? (
                  <div className="edit-qty">
                    <input
                      type="number"
                      className="input-qty-inline"
                      value={editQty}
                      min={1}
                      onChange={(e) => setEditQty(parseInt(e.target.value) || 1)}
                    />
                    <button className="btn-save"  onClick={() => handleUpdateQty(s.ticker)}>✓</button>
                    <button className="btn-cancel" onClick={() => setEditId(null)}>✕</button>
                  </div>
                ) : (
                  <>
                    <span className="stock-qty">{s.qty} shares</span>
                    <button
                      className="btn-edit"
                      onClick={() => { setEditId(s._id); setEditQty(s.qty); }}
                    >Edit</button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(s.ticker)}
                    >✕</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}