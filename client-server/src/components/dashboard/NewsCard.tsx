"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { translateToHindi } from "@/utils/translate";

type NewsCardProps = {
  title: string;
  source: string;
  sourceUrl?: string;
  description?: string;
  signal: "BUY" | "SELL" | "HOLD" | "STRONG BUY" | "STRONG SELL";
  confidence: number;
  stocks: string[];
  imageUrl?: string;
};

export default function NewsCard({
  title,
  source,
  sourceUrl,
  description,
  signal,
  confidence,
  stocks,
  imageUrl,
}: NewsCardProps) {
  const [translating, setTranslating]         = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [showHindi, setShowHindi]             = useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (translatedTitle) { setShowHindi(true); return; }
    setTranslating(true);
    const result = await translateToHindi(title);
    setTranslatedTitle(result);
    setTranslating(false);
    setShowHindi(true);
  };

  const signalStyle =
    signal.includes("BUY")
      ? "bg-green-100 text-green-700"
      : signal.includes("SELL")
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <Card className="rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all duration-300 p-4">
      <div className="flex gap-4">
        {/* Image */}
        <div className="w-28 h-24 overflow-hidden rounded-lg bg-slate-100 flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <h2 className="text-base font-semibold text-slate-800 line-clamp-2">
            {showHindi ? translatedTitle : title}
          </h2>

          <p className="text-sm text-slate-500">
            {sourceUrl ? (
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600">
                {source}
              </a>
            ) : source}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Badge className={signalStyle}>{signal}</Badge>
            <span className="text-sm font-medium text-slate-600">
              {(confidence * 100).toFixed(0)}%
            </span>

            {/* Language toggle */}
            <div className="flex gap-1 ml-auto">
              <button
                className={`text-xs px-2 py-1 rounded-full border transition ${!showHindi ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-500"}`}
                onClick={(e) => { e.stopPropagation(); setShowHindi(false); }}
              >
                EN
              </button>
              <button
                className={`text-xs px-2 py-1 rounded-full border transition ${showHindi ? "bg-indigo-500 text-white border-indigo-500" : "border-slate-200 text-slate-500"}`}
                onClick={handleTranslate}
                disabled={translating}
              >
                {translating ? "..." : "हि"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {stocks.map((stock) => (
              <span
                key={stock}
                className="px-2 py-1 text-xs rounded-md bg-blue-50 text-blue-700"
              >
                {stock}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}