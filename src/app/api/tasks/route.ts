import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const siteId = params.get("siteId");
  const vendorId = params.get("vendorId");
  const workStreamId = params.get("workStreamId");
  const status = params.get("status");
  const priority = params.get("priority");
  const owner = params.get("owner");
  const meetingId = params.get("meetingId");

  const where: Record<string, unknown> = {};
  if (siteId) where.siteId = siteId;
  if (vendorId) where.vendorId = vendorId;
  if (workStreamId) where.workStreamId = workStreamId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (owner) where.owner = { contains: owner };
  if (meetingId) where.meetingId = meetingId;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      site: true,
      vendor: true,
      workStream: true,
      subtasks: true,
      meeting: true,
    },
    orderBy: [{ priority: "asc" }, { dueDate: "asc" }],
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const task = await prisma.task.create({
    data: {
      title: body.title,
      description: body.description || null,
      status: body.status || "todo",
      priority: body.priority || "medium",
      owner: body.owner || null,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      siteId: body.siteId || null,
      vendorId: body.vendorId || null,
      workStreamId: body.workStreamId || null,
      meetingId: body.meetingId || null,
      parentTaskId: body.parentTaskId || null,
    },
    include: {
      site: true,
      vendor: true,
      workStream: true,
    },
  });
  return NextResponse.json(task, { status: 201 });
}
