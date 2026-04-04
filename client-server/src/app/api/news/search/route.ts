import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import News from "@/models/News";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          message: "Search query is required",
        },
        { status: 400 }
      );
    }

    const searchRegex = new RegExp(query, "i");

    const results = await News.find({
      $or: [
        { headline: searchRegex },
        { domain: searchRegex },
        { stocks: searchRegex },
      ],
    }).sort({ publishedAt: -1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search news",
      },
      { status: 500 }
    );
  }
}