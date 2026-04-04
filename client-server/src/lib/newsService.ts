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

    const query = `("NSE" OR "BSE" OR "Nifty" OR "Sensex" OR "Dalal Street" OR "Indian equities" OR "Indian stock market" OR "PROFIT" OR "LOSS" OR "BUY" OR "SELL") AND ("Banking" OR "IT Services" OR "Pharma" OR "Automobile" OR "FMCG" OR "Telecom" OR "Energy" OR "Real Estate" OR "Metals" OR "Defense" OR "Logistics" OR "Consumer Durables" OR "Chemicals" OR "OIL" OR "MARKET" OR "EBITDA" OR "SHARES" )`;

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
      query
    )}&from=${fromDate}&to=${toDate}&sortBy=publishedAt&language=en&pageSize=17&apiKey=${process.env.NEWS_API_KEY}`;

    const response = await fetch(url);

    const data = await response.json();

    console.log("Fetched articles:", data.articles?.length);

    return data.articles
      .filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (article: any) =>
          article.title &&
          article.title !== "[Removed]" &&
          article.description
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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