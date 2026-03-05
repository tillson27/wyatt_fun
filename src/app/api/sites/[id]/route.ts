import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const site = await prisma.site.findUnique({
    where: { id: params.id },
    include: {
      rollouts: { include: { vendor: true } },
      tasks: {
        include: { vendor: true, workStream: true },
        orderBy: { dueDate: "asc" },
      },
      milestones: {
        include: { workStream: true },
        orderBy: { date: "asc" },
      },
    },
  });
  if (!site) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(site);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  // Update rollouts if provided
  if (body.rollouts) {
    for (const r of body.rollouts) {
      await prisma.siteVendorRollout.update({
        where: { id: r.id },
        data: {
          status: r.status,
          progressPct: r.progressPct,
          delayDays: r.delayDays,
          delayReason: r.delayReason,
          notes: r.notes,
        },
      });
    }
  }

  const site = await prisma.site.findUnique({
    where: { id: params.id },
    include: {
      rollouts: { include: { vendor: true } },
      tasks: { include: { vendor: true, workStream: true } },
      milestones: { include: { workStream: true } },
    },
  });
  return NextResponse.json(site);
}
