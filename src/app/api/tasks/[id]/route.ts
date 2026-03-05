import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: {
      site: true,
      vendor: true,
      workStream: true,
      subtasks: true,
      meeting: true,
      parentTask: true,
    },
  });
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.status !== undefined) {
    data.status = body.status;
    if (body.status === "done") data.completedAt = new Date();
    else data.completedAt = null;
  }
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.owner !== undefined) data.owner = body.owner;
  if (body.dueDate !== undefined)
    data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.siteId !== undefined) data.siteId = body.siteId;
  if (body.vendorId !== undefined) data.vendorId = body.vendorId;
  if (body.workStreamId !== undefined) data.workStreamId = body.workStreamId;
  if (body.parentTaskId !== undefined) data.parentTaskId = body.parentTaskId;

  const task = await prisma.task.update({
    where: { id: params.id },
    data,
    include: { site: true, vendor: true, workStream: true, subtasks: true },
  });
  return NextResponse.json(task);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.task.deleteMany({ where: { parentTaskId: params.id } });
  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
