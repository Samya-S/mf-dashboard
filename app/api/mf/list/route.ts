import { NextRequest, NextResponse } from "next/server";
import { listSchemes } from "@/lib/mfapi";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "100");
    const offset = Number(searchParams.get("offset") ?? "0");

    const data = await listSchemes(limit, offset);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not fetch scheme list", error: String(error) },
      { status: 500 },
    );
  }
}
