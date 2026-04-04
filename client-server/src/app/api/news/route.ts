import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import News from "@/models/News";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const domain = searchParams.get("domain");
    const signal = searchParams.get("signal");

    const skip = (page - 1) * limit;

    // Dynamic filters
    const filter: any = {
    stocks: { $exists: true, $ne: [] },
    confidence_score: { $gt: 0 },
    };

    if (domain && domain !== "ALL") {
    filter.domain = domain;
    }

    if (signal) {
    filter.signal = signal.toUpperCase();
    }

    // Get filtered news
    const news = await News.find(filter)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNews = await News.countDocuments(filter);

    return NextResponse.json({
      success: true,
      page,
      limit,
      totalNews,
      totalPages: Math.ceil(totalNews / limit),
      news,
    });
  } catch (error) {
    console.error("News Fetch Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch news",
      },
      { status: 500 }
    );
  }
}