import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const sites = await prisma.site.findMany({
    include: {
      rollouts: { include: { vendor: true } },
      tasks: true,
    },
  });
  return NextResponse.json(sites);
}
