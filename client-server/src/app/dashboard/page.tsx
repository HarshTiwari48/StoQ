"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import NewsCard from "@/components/dashboard/NewsCard";
import CategorySidebar from "@/components/dashboard/CategorySidebar";
import LiveMarketPanel from "@/components/dashboard/LiveMarketPanel";
import Navbar from "@/components/dashboard/Navbar";
import NewsOverlay from "@/components/dashboard/NewsOverlay";

type NewsItem = {
  _id: string;
  title: string;
  source: string;
  signal: "BUY" | "SELL" | "HOLD";
  confidence_score: number;
  stocks: string[];
  imageUrl?: string;
};

export default function DashboardPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState("ALL");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedArticle, setSelectedArticle] =
  useState<any>(null);

const [isOverlayOpen, setIsOverlayOpen] =
  useState(false);

  useEffect(() => {
  setPage(1);
  setNews([]);
}, [selectedCategory]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const categoryRes = await fetch(
          "/api/categories"
        );
        const categoryData =
          await categoryRes.json();

        setCategories(
          categoryData.categories || []
        );

        // Fetch news based on selected category
        const newsUrl =
  selectedCategory === "ALL"
    ? "/api/news?page=1&limit=50"
    : `/api/news?page=${page}&limit=10&domain=${encodeURIComponent(
        selectedCategory
      )}`;

        const newsRes = await fetch(newsUrl);
        const newsData = await newsRes.json();

        setNews((prev) => {
  const incoming = newsData.news || [];

  if (page === 1) {
    return incoming;
  }

  const merged = [...prev, ...incoming];

  return merged.filter(
    (item, index, self) =>
      index ===
      self.findIndex(
        (n) => n._id === item._id
      )
  );
});
      } catch (error) {
        console.error(
          "Failed to fetch dashboard data:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedCategory, page]);

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-100 p-6">
      {/* Navbar */}
      <div className="mb-6">
  <Navbar />
</div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        {/* Sidebar */}
        <Card className="col-span-2 rounded-xl p-4 shadow-md h-full sticky top-0">
          <CategorySidebar
            categories={categories}
            selected={selectedCategory}
            onSelect={(category) => {
  setSelectedCategory(category);
  setPage(1);
  setNews([]);
}}
          />
        </Card>

        {/* News Feed */}
        <div className="col-span-7 h-full overflow-y-auto pr-2 space-y-4">
          {loading ? (
            <p>Loading news...</p>
          ) : news.length > 0 ? (
            news.map((article) => (
  <div
    key={article._id}
    onClick={() => {
      setSelectedArticle(article);
      setIsOverlayOpen(true);
    }}
    className="cursor-pointer"
  >
    <NewsCard
      title={article.title}
      source={article.source}
      signal={article.signal}
      confidence={article.confidence_score}
      stocks={article.stocks}
      imageUrl={article.imageUrl}
    />
  </div>
))
          ) : (
            <p className="text-slate-500">
              No news found
            </p>
          )}
          <button
  onClick={() => setPage((prev) => prev + 1)}
  className="w-full rounded-lg border border-slate-200 bg-white py-3 font-medium hover:bg-slate-50"
>
  Load More
</button>
        </div>

        {/* Live Panel */}
        <div className="col-span-3 h-full sticky top-0">
           <LiveMarketPanel  />
        </div>
      </div>

      {/* Summary */}
      <Card className="mt-6 rounded-xl p-6 shadow-md">
        AI Summary
      </Card>


      <NewsOverlay
  open={isOverlayOpen}
  onOpenChange={setIsOverlayOpen}
  article={selectedArticle}
/>
    </main>
  );
}