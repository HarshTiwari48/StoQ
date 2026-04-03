import { runNewsPipeline } from "@/lib/pipeline";

export async function GET() {
  try {
    await runNewsPipeline();

    return Response.json({
      success: true,
      message: "Pipeline executed successfully",
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Pipeline failed",
      },
      { status: 500 }
    );
  }
}