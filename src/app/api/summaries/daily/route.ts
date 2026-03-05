import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, subDays, addDays } from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const today = startOfDay(now);
  const yesterday = subDays(today, 1);
  const threeDaysOut = addDays(today, 3);
  const weekOut = addDays(today, 7);

  const [overdue, dueToday, completedYesterday, upcoming, blocked, milestones] =
    await Promise.all([
      prisma.task.findMany({
        where: { status: { not: "done" }, dueDate: { lt: today } },
        include: { site: true, vendor: true, workStream: true },
        orderBy: { dueDate: "asc" },
      }),
      prisma.task.findMany({
        where: {
          status: { not: "done" },
          dueDate: { gte: today, lt: endOfDay(now) },
        },
        include: { site: true },
        orderBy: { priority: "asc" },
      }),
      prisma.task.findMany({
        where: {
          status: "done",
          completedAt: { gte: yesterday, lt: today },
        },
        include: { site: true },
      }),
      prisma.task.findMany({
        where: {
          status: { not: "done" },
          dueDate: { gt: endOfDay(now), lte: threeDaysOut },
        },
        include: { site: true },
        orderBy: { dueDate: "asc" },
      }),
      prisma.task.findMany({
        where: { status: "blocked" },
        include: { site: true, vendor: true },
      }),
      prisma.milestone.findMany({
        where: { date: { gte: today, lte: weekOut } },
        include: { site: true, workStream: true },
        orderBy: { date: "asc" },
      }),
    ]);

  return NextResponse.json({
    overdue,
    dueToday,
    completedYesterday,
    upcoming,
    blocked,
    milestones,
  });
}
