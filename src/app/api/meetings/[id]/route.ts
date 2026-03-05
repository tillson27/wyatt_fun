import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const meeting = await prisma.meeting.findUnique({
    where: { id: params.id },
    include: {
      actionItems: {
        include: { site: true, vendor: true },
      },
    },
  });
  if (!meeting) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(meeting);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.task.updateMany({
    where: { meetingId: params.id },
    data: { meetingId: null },
  });
  await prisma.meeting.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
