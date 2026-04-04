import { fetchFinanceNews } from "./newsService";
import { sendNewsToML } from "./mlService";
import  connectDB  from "./mongodb";
import News from "../models/News";

export async function runNewsPipeline() {
  try {
    await connectDB();

    // Step 1: fetch raw news
    const fetchedNews = await fetchFinanceNews();

    if (!fetchedNews.length) {
      console.log("No finance news found");
      return;
    }

    // Step 2: send only selected fields to ML
    const mlResult = await sendNewsToML(fetchedNews);

    // Step 3: merge fetched data + ML output
    const mergedNews = fetchedNews.map((article, index: number) => {
  const analysis = mlResult[index];

  const impactedDomains =
    analysis?.ai_analysis?.impacted_domains || [];

  const firstDomain = impactedDomains[0] || null;
  const firstStock = firstDomain?.stocks?.[0] || null;

  return {
    article_id: article.article_id,
    date: article.date,
    source: article.source,
    title: article.title,
    description: article.description,

    sourceUrl: article.source_url,
    imageUrl: article.image_url,

    author: article.author,
    publishedAt: article.published_at,

    // UI-friendly flat fields
    domain: firstDomain?.domain || "General Market",
    stocks: impactedDomains.flatMap(
      (domain: any) =>
        domain.stocks?.map((stock: any) => stock.ticker) || []
    ),

    signal: firstStock?.signal || "HOLD",
    confidence_score:
      firstStock?.confidence_score || 0,

    rsi: firstStock?.data?.rsi ?? null,
    macd: firstStock?.data?.macd ?? null,
    reasoning: firstStock?.reasoning ?? null,
    

    // Keep full ML response for detailed modal
    impacted_domains: impactedDomains,
  };
});

    // Step 4: store in MongoDB
    for (const article of mergedNews) {
      await News.updateOne(
        { title: article.title },
        { $set: article },
        { upsert: true }
      );
    }

    console.log("Pipeline executed successfully");
  } catch (error) {
    console.error("Pipeline failed:", error);
    throw error;
  }
}