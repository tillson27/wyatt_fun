import { extractActions } from "@/lib/extract-actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const actions = extractActions(body.notes || "");
  return NextResponse.json(actions);
}
