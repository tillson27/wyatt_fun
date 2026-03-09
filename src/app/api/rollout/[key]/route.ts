import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { key: string } }
) {
  const id = decodeURIComponent(params.key);
  const data = await request.json();

  const item = await prisma.rolloutItem.update({
    where: { id },
    data: {
      status: data.status,
      rag: data.rag,
      owner: data.owner,
      targetGoLive: data.targetGoLive,
      actualGoLive: data.actualGoLive,
      notes: data.notes,
      blockers: data.blockers,
      pctComplete: data.pctComplete,
      manualPct: data.manualPct,
      activities: data.activities ?? [],
    },
  });

  return NextResponse.json(item);
}
