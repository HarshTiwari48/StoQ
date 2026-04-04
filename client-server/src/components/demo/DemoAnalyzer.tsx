"use client";

import { useState } from "react";

interface StockResult {
  ticker: string;
  signal: string;
  confidence_score: number;
  reasoning?: string;
  data?: {
    rsi?: number;
    macd?: number;
    sentiment?: number;
  };
}

interface DomainResult {
  domain: string;
  stocks: StockResult[];
}

interface MLResult {
  ai_analysis?: {
    impacted_domains?: DomainResult[];
    status?: string;
  };
}

export default function DemoAnalyzer() {
  const [headline, setHeadline]     = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState<MLResult | null>(null);
  const [error, setError]           = useState("");

  const handleAnalyze = async () => {
    if (!headline.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/demo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ headline, description }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setResult(data.result);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signalColor = (signal: string) => {
    if (signal?.includes("BUY"))  return { bg: "#dcfce7", color: "#15803d" };
    if (signal?.includes("SELL")) return { bg: "#fee2e2", color: "#dc2626" };
    return { bg: "#fef9c3", color: "#a16207" };
  };

  const domains = result?.ai_analysis?.impacted_domains ?? [];

  const allStocks = domains.flatMap((d) => d.stocks ?? []);

  const topSignal = allStocks[0]?.signal ?? null;
  const topConf   = allStocks[0]?.confidence_score ?? null;

  return (
    <div className="demo-page">
      {/* Header */}
      <div className="demo-header">
        <span className="demo-label">LIVE DEMO</span>
        <h1 className="demo-title">AI News Analyzer</h1>
        <p className="demo-subtitle">
          Paste any stock market headline — our ML model analyzes it in real time
        </p>
      </div>

      {/* Input section */}
      <div className="demo-input-card">
        <div className="demo-input-group">
          <label className="demo-input-label">News Headline *</label>
          <textarea
            className="demo-textarea"
            placeholder="e.g. TCS reports 10% growth in Q4 earnings, beats analyst estimates..."
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            rows={3}
          />
        </div>

        <div className="demo-input-group">
          <label className="demo-input-label">Description (optional)</label>
          <textarea
            className="demo-textarea"
            placeholder="Add more context for better analysis..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        <button
          className="demo-analyze-btn"
          onClick={handleAnalyze}
          disabled={loading || !headline.trim()}
        >
          {loading ? (
            <span className="demo-btn-loading">
              <span className="demo-spinner" />
              Analyzing...
            </span>
          ) : (
            "⚡ Analyze with AI"
          )}
        </button>

        {error && <p className="demo-error">{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="demo-results">

          {/* Summary bar */}
          {topSignal && (
            <div className="demo-summary-bar">
              <div className="demo-summary-item">
                <span className="demo-summary-label">Top Signal</span>
                <span
                  className="demo-summary-signal"
                  style={signalColor(topSignal)}
                >
                  {topSignal}
                </span>
              </div>
              {topConf && (
                <div className="demo-summary-item">
                  <span className="demo-summary-label">Confidence</span>
                  <span className="demo-summary-value">
                    {(topConf * 100).toFixed(0)}%
                  </span>
                </div>
              )}
              <div className="demo-summary-item">
                <span className="demo-summary-label">Stocks Affected</span>
                <span className="demo-summary-value">{allStocks.length}</span>
              </div>
              <div className="demo-summary-item">
                <span className="demo-summary-label">Sectors</span>
                <span className="demo-summary-value">{domains.length}</span>
              </div>
            </div>
          )}

          {/* Domain + stock breakdown */}
          {domains.map((domain) => (
            <div key={domain.domain} className="demo-domain-card">
              <div className="demo-domain-header">
                <span className="demo-domain-name">{domain.domain}</span>
                <span className="demo-domain-count">
                  {domain.stocks?.length} stock{domain.stocks?.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="demo-stocks-grid">
                {domain.stocks?.map((stock) => {
                  const sc = signalColor(stock.signal);
                  return (
                    <div key={stock.ticker} className="demo-stock-card">

                      {/* Stock header */}
                      <div className="demo-stock-header">
                        <div>
                          <p className="demo-stock-ticker">{stock.ticker}</p>
                          <p className="demo-stock-domain">{domain.domain}</p>
                        </div>
                        <div className="demo-stock-badges">
                          <span
                            className="demo-signal-badge"
                            style={{ background: sc.bg, color: sc.color }}
                          >
                            {stock.signal}
                          </span>
                          <span className="demo-conf-badge">
                            {(stock.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Metrics grid */}
                      <div className="demo-metrics-grid">
                        <div className="demo-metric">
                          <span className="demo-metric-label">RSI</span>
                          <span className="demo-metric-value">
                            {stock.data?.rsi?.toFixed(2) ?? "--"}
                          </span>
                        </div>
                        <div className="demo-metric">
                          <span className="demo-metric-label">MACD</span>
                          <span className="demo-metric-value">
                            {stock.data?.macd?.toFixed(2) ?? "--"}
                          </span>
                        </div>
                        <div className="demo-metric">
                          <span className="demo-metric-label">Sentiment</span>
                          <span className="demo-metric-value">
                            {stock.data?.sentiment?.toFixed(3) ?? "--"}
                          </span>
                        </div>
                      </div>

                      {/* Confidence bar */}
                      <div className="demo-conf-bar-wrap">
                        <div
                          className="demo-conf-bar-fill"
                          style={{
                            width: `${(stock.confidence_score * 100).toFixed(0)}%`,
                            background: sc.color,
                          }}
                        />
                      </div>

                      {/* Reasoning */}
                      {stock.reasoning && (
                        <div className="demo-reasoning">
                          <p className="demo-reasoning-label">AI Reasoning</p>
                          <p className="demo-reasoning-text">{stock.reasoning}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {domains.length === 0 && (
            <div className="demo-empty">
              <p>No stock signals found for this headline.</p>
              <p>Try a more specific financial news headline.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}