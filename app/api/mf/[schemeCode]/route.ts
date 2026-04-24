import { NextRequest, NextResponse } from "next/server";
import { getSchemeHistory } from "@/lib/mfapi";

type RouteParams = {
  params: Promise<{
    schemeCode: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { schemeCode } = await params;
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;

    const data = await getSchemeHistory(schemeCode, startDate, endDate);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not fetch scheme history", error: String(error) },
      { status: 500 },
    );
  }
}
