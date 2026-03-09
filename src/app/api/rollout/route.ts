import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const items = await prisma.rolloutItem.findMany();
  const map: Record<string, unknown> = {};
  for (const item of items) {
    map[item.id] = {
      site: item.site,
      mod: item.mod,
      status: item.status,
      rag: item.rag,
      owner: item.owner,
      targetGoLive: item.targetGoLive,
      actualGoLive: item.actualGoLive,
      notes: item.notes,
      blockers: item.blockers,
      pctComplete: item.pctComplete,
      manualPct: item.manualPct,
      activities: item.activities,
    };
  }
  return NextResponse.json(map);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Bulk upsert — used for seeding
  const ops = Object.entries(body).map(([id, data]: [string, any]) =>
    prisma.rolloutItem.upsert({
      where: { id },
      update: { ...data, activities: data.activities ?? [] },
      create: { id, ...data, activities: data.activities ?? [] },
    })
  );
  await prisma.$transaction(ops);
  return NextResponse.json({ ok: true });
}
