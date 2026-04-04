import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import News from "@/models/News";

export async function GET() {
  try {
    await connectDB();

    // -----------------------------
    // 1) Fetch NIFTY + SENSEX from NSE
    // -----------------------------
    let nifty = null;
    let sensex = null;

    try {
      const nseRes = await fetch(
        "https://www.nseindia.com/api/allIndices",
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            Accept: "application/json",
            Referer: "https://www.nseindia.com/",
          },
          next: { revalidate: 60 },
        }
      );

      const nseData = await nseRes.json();

      const allIndices = nseData.data || [];

      const niftyData = allIndices.find(
        (item: any) =>
          item.index === "NIFTY 50"
      );

      const sensexData = allIndices.find(
        (item: any) =>
          item.index
            ?.toUpperCase()
            .includes("SENSEX")
      );

      nifty = {
        price: niftyData?.last || null,
        changePercent:
          niftyData?.percentChange || null,
      };

      sensex = {
        price: sensexData?.last || null,
        changePercent:
          sensexData?.percentChange || null,
      };
    } catch (err) {
      console.error(
        "NSE fetch failed:",
        err
      );
    }

    // -----------------------------
    // 2) Top BUY mover from DB
    // -----------------------------
    const topBuy = await News.findOne({
      signal: "BUY",
      stocks: { $exists: true, $ne: [] },
      confidence_score: { $gt: 0 },
    })
      .sort({ confidence_score: -1 })
      .lean();

    // -----------------------------
    // 3) Top SELL mover from DB
    // -----------------------------
    const topSell = await News.findOne({
      signal: "SELL",
      stocks: { $exists: true, $ne: [] },
      confidence_score: { $gt: 0 },
    })
      .sort({ confidence_score: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      market: {
        indices: {
          nifty,
          sensex,
        },
        topMovers: {
          buy: topBuy
            ? {
                title: topBuy.title,
                stock:
                  topBuy.stocks?.[0] ||
                  "N/A",
                confidence:
                  topBuy.confidence_score,
              }
            : null,

          sell: topSell
            ? {
                title: topSell.title,
                stock:
                  topSell.stocks?.[0] ||
                  "N/A",
                confidence:
                  topSell.confidence_score,
              }
            : null,
        },
      },
    });
  } catch (error) {
    console.error(
      "Live market route failed:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch market data",
      },
      { status: 500 }
    );
  }
}