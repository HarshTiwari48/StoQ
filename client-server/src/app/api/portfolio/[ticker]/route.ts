import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";

type RouteContext = {
  params: Promise<{
    ticker: string;
  }>;
};

// DELETE /api/portfolio/:ticker
export async function DELETE(
  _req: Request,
  context: RouteContext
) {
  const session =
    await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { ticker } =
    await context.params;

  await connectDB();

  const result =
    await Portfolio.findOneAndDelete({
      userId: session.user.id,
      ticker: ticker.toUpperCase(),
    });

  if (!result) {
    return NextResponse.json(
      { error: "Stock not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    message: `${ticker.toUpperCase()} removed`,
  });
}

// PATCH /api/portfolio/:ticker
export async function PATCH(
  req: Request,
  context: RouteContext
) {
  const session =
    await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { ticker } =
    await context.params;

  const { qty } = await req.json();

  if (!qty || qty < 1) {
    return NextResponse.json(
      { error: "Invalid quantity" },
      { status: 400 }
    );
  }

  await connectDB();

  const stock =
    await Portfolio.findOneAndUpdate(
      {
        userId: session.user.id,
        ticker:
          ticker.toUpperCase(),
      },
      { qty },
      { new: true }
    );

  if (!stock) {
    return NextResponse.json(
      { error: "Stock not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    stock,
  });
}