"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

type MarketData = {
  indices: {
    nifty: {
      price: number | null;
      changePercent: number | null;
    } | null;
    sensex: {
      price: number | null;
      changePercent: number | null;
    } | null;
  };
  topMovers: {
    buy: {
      stock: string;
      confidence: number;
    } | null;
    sell: {
      stock: string;
      confidence: number;
    } | null;
  };
};

export default function LiveMarketPanel() {
  const [market, setMarket] =
    useState<MarketData | null>(null);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await fetch(
          "/api/live-market"
        );
        const data = await res.json();

        setMarket(data.market);
      } catch (error) {
        console.error(
          "Market fetch failed:",
          error
        );
      }
    };

    fetchMarket();
  }, []);

  if (!market) {
    return (
      <Card className="rounded-xl p-4 shadow-md">
        Loading market...
      </Card>
    );
  }

  return (
    <Card className="rounded-xl p-4 shadow-md h-full">
      <h2 className="text-lg font-semibold mb-4">
        Live Market
      </h2>

      <div className="space-y-3">
        {/* NIFTY */}
        <div className="rounded-lg border p-3 bg-white">
          <p className="text-sm text-slate-500">
            NIFTY
          </p>
          <div className="flex justify-between">
            <span>
              ₹{" "}
              {market.indices.nifty?.price ??
                "--"}
            </span>
            <span>
              {
                market.indices.nifty
                  ?.changePercent
              }
              %
            </span>
          </div>
        </div>

        {/* SENSEX */}
        <div className="rounded-lg border p-3 bg-white">
          <p className="text-sm text-slate-500">
            SENSEX
          </p>
          <div className="flex justify-between">
            <span>
              ₹{" "}
              {market.indices.sensex
                ?.price ?? "--"}
            </span>
            <span>
              {
                market.indices.sensex
                  ?.changePercent
              }
              %
            </span>
          </div>
        </div>

        {/* TOP BUY */}
        <div className="rounded-lg border p-3 bg-white">
          <p className="text-sm text-green-600">
            Top BUY
          </p>
          <div className="flex justify-between">
            <span>
              {
                market.topMovers.buy
                  ?.stock
              }
            </span>
            <span>
              {(
                (market.topMovers.buy
                  ?.confidence || 0) * 100
              ).toFixed(0)}
              %
            </span>
          </div>
        </div>

        {/* TOP SELL */}
        <div className="rounded-lg border p-3 bg-white">
          <p className="text-sm text-red-600">
            Top SELL
          </p>
          <div className="flex justify-between">
            <span>
              {
                market.topMovers.sell
                  ?.stock
              }
            </span>
            <span>
              {(
                (market.topMovers.sell
                  ?.confidence || 0) * 100
              ).toFixed(0)}
              %
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}