export async function fetchFinanceNews() {
  try {
    const fromDate = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split("T")[0];

    const toDate = new Date()
      .toISOString()
      .split("T")[0];

    const query = `NSE OR BSE OR Nifty OR Sensex OR "Indian stock market" OR "Indian equities"`;

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&from=${fromDate}&to=${toDate}&sortBy=publishedAt&language=en&pageSize=100&apiKey=${process.env.NEWS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("NewsAPI status:", data.status);
    console.log("NewsAPI message:", data.message ?? "none");
    console.log("Fetched articles:", data.articles?.length ?? 0);

    if (!data.articles || data.status !== "ok") {
      console.error("NewsAPI failed:", data.message ?? "Unknown error");
      return [];
    }

    return data.articles
      .filter(
        (article: any) =>
          article.title &&
          article.title !== "[Removed]" &&
          article.description &&
          article.description !== "[Removed]"
      )
      .map((article: any, index: number) => ({
        article_id: index + 1,
        date: article.publishedAt?.slice(0, 10),
        source: article.source?.name || "Unknown",
        title: article.title,
        description: article.description,
        source_url: article.url,
        image_url: article.urlToImage,
        author: article.author,
        published_at: article.publishedAt,
      }));
  } catch (error) {
    console.error("News fetch failed:", error);
    throw error;
  }
}