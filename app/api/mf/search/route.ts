import { NextRequest, NextResponse } from "next/server";
import { searchSchemes } from "@/lib/mfapi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json([]);
    }

    const data = await searchSchemes(q);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not search schemes", error: String(error) },
      { status: 500 },
    );
  }
}
