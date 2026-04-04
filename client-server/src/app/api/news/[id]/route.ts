import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import News from "@/models/News";
import mongoose from "mongoose";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid news ID",
        },
        { status: 400 }
      );
    }

    const article = await News.findById(id);

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          message: "News article not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("Single News Fetch Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch article",
      },
      { status: 500 }
    );
  }
}