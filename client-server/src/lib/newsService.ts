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

    const query = `
      "Nifty" OR "Sensex" OR "NSE" OR "BSE" OR "Reliance" OR "Tata" 
      OR "Infosys" OR "HDFC" OR "ICICI" OR "ITC" OR "Maruti" OR "banking" OR "stocks" OR "Crude oil" OR "Pharma" OR "Profit" OR "Market"
    `;

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&from=${fromDate}&to=${toDate}&sortBy=publishedAt&language=en&pageSize=15&apiKey=${process.env.NEWS_API_KEY}`;

    const response = await fetch(url);

    const data = await response.json();

    console.log("Fetched articles:", data.articles?.length);

    return data.articles
      .filter(
        (article: any) =>
          article.title &&
          article.title !== "[Removed]" &&
          article.description
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