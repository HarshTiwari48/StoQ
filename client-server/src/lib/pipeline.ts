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
    const mergedNews = fetchedNews.map(
  (article, index: number) => {
    const mlArticle = mlResult[index];

    const impactedDomains =
      mlArticle?.ai_analysis
        ?.impacted_domains || [];

    const firstDomain =
      impactedDomains[0] || null;

    const firstStock =
      firstDomain?.stocks?.[0] || null;

    return {
      article_id: article.article_id,
      date: article.date,
      source: article.source,
      title: article.title,
      description:
        article.description,

      sourceUrl:
        article.source_url,
      imageUrl:
        article.image_url,

      author: article.author,
      publishedAt:
        article.published_at,

      // KEEP FLAT FIELDS FOR EXISTING UI
      domain:
        firstDomain?.domain ||
        "General Market",

      stocks:
        impactedDomains.flatMap(
          (domain: any) =>
            domain.stocks?.map(
              (stock: any) =>
                stock.ticker
            ) || []
        ),

      signal:
        firstStock?.signal ||
        "HOLD",

      confidence_score:
        firstStock
          ?.confidence_score ||
        0,

      rsi:
        firstStock?.data?.rsi ??
        null,

      macd:
        firstStock?.data?.macd ??
        null,

      reasoning:
        firstStock?.reasoning ??
        null,

      // 🚀 NEW NESTED STRUCTURE
      analysis:
        impactedDomains.map(
          (domain: any) => ({
            domain:
              domain.domain,
            stocks:
              domain.stocks?.map(
                (
                  stock: any
                ) => ({
                  ticker:
                    stock.ticker,
                  signal:
                    stock.signal,
                  confidence_score:
                    stock.confidence_score,
                  reasoning:
                    stock.reasoning,
                  data: {
                    rsi:
                      stock
                        ?.data
                        ?.rsi ??
                      null,
                    macd:
                      stock
                        ?.data
                        ?.macd ??
                      null,
                    sentiment:
                      stock
                        ?.data
                        ?.sentiment ??
                      null,
                  },
                })
              ) || [],
          })
        ),
    };
  }
);

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