import { NextResponse } from "next/server";
import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL!;

export async function POST(req: Request) {
  try {
    const { headline, description } = await req.json();

    if (!headline?.trim()) {
      return NextResponse.json({ error: "Headline is required" }, { status: 400 });
    }

    const payload = [
      {
        date: new Date().toISOString(),
        source: "Manual Demo",
        title: headline.trim(),
        description: description?.trim() || headline.trim(),
      },
    ];

    const response = await axios.post(ML_SERVICE_URL, payload);
    const result = response.data?.[0];

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Demo ML error:", error?.response?.data || error.message);
    return NextResponse.json({ error: "ML service failed" }, { status: 500 });
  }
}