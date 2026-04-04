"use client";

import { useState, useEffect } from "react";

interface NewsItem {
  _id: string;
  title: string;
  domain: string;
  stocks: string[];
  signal: string;
  confidence_score: number;
  publishedAt: string;
  imageUrl?: string;
  source: string;
  sourceUrl?: string;   // ← add this
  rsi?: number;
  macd?: number;
}

export default function RelevantNewsPanel() {
  const [news, setNews]       = useState<NewsItem[]>([]);
  const [tickers, setTickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [selected, setSelected] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res  = await fetch(`/api/portfolio/news?page=${page}&limit=10`);
        const data = await res.json();
        setNews(data.news ?? []);
        setTickers(data.tickers ?? []);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [page]);

  const signalClass = (signal: string) => {
    if (signal?.includes("BUY"))  return "signal-buy";
    if (signal?.includes("SELL")) return "signal-sell";
    return "signal-hold";
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1)  return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div className="relevant-news">
      <div className="panel-header">
        <h2 className="panel-title">Relevant News</h2>
        {tickers.length > 0 && (
          <div className="ticker-pills">
            {tickers.map((t) => (
              <span key={t} className="ticker-pill">{t}</span>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="panel-loading">Loading news...</div>
      ) : news.length === 0 ? (
        <div className="empty-state">
          <p>No news found for your stocks.</p>
          <p>Add more stocks to your watchlist to see relevant news here.</p>
        </div>
      ) : (
        <>
          <ul className="news-list">
            {news.map((item) => (
              <li
                key={item._id}
                className="news-card"
                onClick={() => setSelected(item)}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="news-img"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                <div className="news-body">
                  <div className="news-meta">
                    <span className="news-domain">{item.domain}</span>
                    <span className="news-time">{timeAgo(item.publishedAt)}</span>
                  </div>
                  <p className="news-title">{item.title}</p>
                  <div className="news-footer">
                    <span className={`signal-badge ${signalClass(item.signal)}`}>
                      {item.signal}
                    </span>
                    <span className="conf-score">
                      {(item.confidence_score * 100).toFixed(0)}% confidence
                    </span>
                    <div className="news-tickers">
                      {item.stocks?.slice(0, 3).map((t) => (
                        <span key={t} className="ticker-pill small">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="pagination">
            <button
              className="btn-page"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >← Prev</button>
            <span className="page-num">Page {page}</span>
            <button
              className="btn-page"
              disabled={news.length < 10}
              onClick={() => setPage((p) => p + 1)}
            >Next →</button>
          </div>
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            {selected.imageUrl && (
              <img src={selected.imageUrl} alt={selected.title} className="modal-img" />
            )}
            <div className="modal-body">
              <div className="modal-meta">
                <span className="news-domain">{selected.domain}</span>
                <span className="news-time">{timeAgo(selected.publishedAt)}</span>
              </div>
              <h3 className="modal-title">{selected.title}</h3>
              <div className="modal-signals">
                <div className="modal-signal-item">
                  <span className="signal-label">Signal</span>
                  <span className={`signal-badge ${signalClass(selected.signal)}`}>
                    {selected.signal}
                  </span>
                </div>
                <div className="modal-signal-item">
                  <span className="signal-label">Confidence</span>
                  <span className="signal-value">
                    {(selected.confidence_score * 100).toFixed(0)}%
                  </span>
                </div>
                {selected.rsi !== undefined && (
                  <div className="modal-signal-item">
                    <span className="signal-label">RSI</span>
                    <span className="signal-value">{selected.rsi?.toFixed(2)}</span>
                  </div>
                )}
                {selected.macd !== undefined && (
                  <div className="modal-signal-item">
                    <span className="signal-label">MACD</span>
                    <span className="signal-value">{selected.macd?.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="modal-tickers">
                {selected.stocks?.map((t) => (
                  <span key={t} className="ticker-pill">{t}</span>
                ))}
              </div>
              <p className="modal-source">
                  Source:{" "}
                  {selected.sourceUrl ? (
                    <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-link">
                      {selected.source}
                    </a>
                  ) : (
                    selected.source
                  )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}