"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import WatchlistPanel from "@/components/portfolio/WatchlistPanel";
import RelevantNewsPanel from "@/components/portfolio/RelevantNewsPanel";
import SuggestedStocksPanel from "@/components/portfolio/SuggestedStocksPanel";
import Image from "next/image";
import Link from "next/link";


export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="portfolio-loading">
        <div className="spinner" />
        <p>Loading your portfolio...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <main className="portfolio-page">
      <div className="portfolio-header">
        <div className="portfolio-header-left">
          <Link href="/dashboard" className="back-btn">
                  ← Dashboard
                  </Link>
          <span className="portfolio-label">MY PORTFOLIO</span>
          <h1 className="portfolio-title">
            Welcome, {session.user?.name?.split(" ")[0]}
          </h1>
          <p className="portfolio-subtitle">
            Your personalized stock intelligence dashboard
          </p>
        </div>
        {session.user?.image && (
          <div className="portfolio-user">
            <Image
              src={session.user.image}
              alt={session.user.name ?? "User"}
              width={48}
              height={48}
              className="user-avatar"
            />
            <div className="user-info">
              <span className="user-name">{session.user.name}</span>
              <span className="user-email">{session.user.email}</span>
            </div>
          </div>
        )}
      </div>

      <div className="portfolio-grid">
        {/* Panel 1 — Watchlist */}
        <section className="panel panel-watchlist">
          <WatchlistPanel />
        </section>

        {/* Panel 2 — Relevant News */}
        <section className="panel panel-news">
          <RelevantNewsPanel />
        </section>

        {/* Panel 3 — Suggested Stocks */}
        <section className="panel panel-suggested">
          <SuggestedStocksPanel />
        </section>
      </div>
    </main>
  );
}