import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import mongoose from "mongoose";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page  = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const skip  = (page - 1) * limit;

  const db = await connectDB();

  const holdings = await Portfolio.find({ userId: session.user.id }).lean();
  const tickers  = holdings.map((h) => h.ticker);

  console.log("User tickers:", tickers); // debug

  if (tickers.length === 0) {
    return NextResponse.json({ news: [], tickers: [] });
  }

  // Use mongoose.connection directly after connectDB
  const newsCol = mongoose.connection.db!.collection("news");

  const news = await newsCol
  .find(
    { stocks: { $in: tickers } },
    {
      projection: {
        title:            1,
         description:      1,  
        domain:           1,
        stocks:           1,
        signal:           1,
        confidence_score: 1,
        rsi:              1,
        macd:             1,
        source:           1,
        sourceUrl:        1,
        publishedAt:      1,
        imageUrl:         1,
      },
    }
  )
  .sort({ publishedAt: -1 })
  .skip(skip)
  .limit(limit)
  .toArray();

  console.log("Matched news count:", news.length); // debug

  return NextResponse.json({ news, tickers, page });
}