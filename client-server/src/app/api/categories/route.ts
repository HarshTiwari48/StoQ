import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import News from "@/models/News";

export async function GET() {
  try {
    await connectDB();

    // Get all unique domains
    const categories = await News.distinct("domain");

    // Optional: sort alphabetically
    const sortedCategories = categories.sort();

    return NextResponse.json({
      success: true,
      count: sortedCategories.length,
      categories: sortedCategories,
    });
  } catch (error) {
    console.error("Categories Fetch Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
      },
      { status: 500 }
    );
  }
}