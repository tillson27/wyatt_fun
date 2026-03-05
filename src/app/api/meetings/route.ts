import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const meetings = await prisma.meeting.findMany({
    include: { actionItems: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(meetings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const meeting = await prisma.meeting.create({
    data: {
      title: body.title,
      date: new Date(body.date),
      attendees: body.attendees || null,
      rawNotes: body.rawNotes || null,
      parsedSummary: body.parsedSummary || null,
    },
  });

  // Extract action items and create tasks
  if (body.rawNotes && body.actionItems?.length > 0) {
    for (const item of body.actionItems) {
      await prisma.task.create({
        data: {
          title: item.text,
          owner: item.owner || null,
          priority: item.priority || "medium",
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          siteId: item.siteId || null,
          vendorId: item.vendorId || null,
          meetingId: meeting.id,
        },
      });
    }
  }

  const result = await prisma.meeting.findUnique({
    where: { id: meeting.id },
    include: { actionItems: true },
  });

  return NextResponse.json(result, { status: 201 });
}
