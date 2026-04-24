import { NextResponse } from "next/server";
import { getLatestNav } from "@/lib/mfapi";

type RouteParams = {
  params: Promise<{
    schemeCode: string;
  }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { schemeCode } = await params;
    const data = await getLatestNav(schemeCode);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Could not fetch latest NAV", error: String(error) },
      { status: 500 },
    );
  }
}
