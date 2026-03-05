import { prisma } from "@/lib/db";
import { startOfDay, subDays, addDays } from "date-fns";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const today = startOfDay(now);
  const weekAgo = subDays(today, 7);
  const nextWeek = addDays(today, 7);

  const [
    completedThisWeek,
    createdThisWeek,
    meetings,
    staleTasks,
    nextWeekTasks,
    atRiskMilestones,
    allTasks,
  ] = await Promise.all([
    prisma.task.findMany({
      where: { status: "done", completedAt: { gte: weekAgo } },
      include: { site: true },
    }),
    prisma.task.findMany({
      where: { createdAt: { gte: weekAgo } },
      include: { site: true },
    }),
    prisma.meeting.findMany({
      where: { date: { gte: weekAgo } },
      include: { actionItems: true },
    }),
    prisma.task.findMany({
      where: {
        status: { in: ["todo", "in_progress"] },
        updatedAt: { lt: weekAgo },
      },
      include: { site: true, vendor: true },
    }),
    prisma.task.findMany({
      where: {
        status: { not: "done" },
        dueDate: { gte: today, lte: nextWeek },
      },
      include: { site: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.milestone.findMany({
      where: {
        status: { in: ["upcoming", "at_risk"] },
        date: { lte: addDays(today, 14) },
      },
      include: { site: true, workStream: true },
      orderBy: { date: "asc" },
    }),
    prisma.task.findMany({ select: { status: true } }),
  ]);

  const totalActions = meetings.reduce(
    (sum, m) => sum + m.actionItems.length,
    0
  );

  const tasksByStatus = {
    todo: allTasks.filter((t) => t.status === "todo").length,
    in_progress: allTasks.filter((t) => t.status === "in_progress").length,
    blocked: allTasks.filter((t) => t.status === "blocked").length,
    done: allTasks.filter((t) => t.status === "done").length,
  };

  return NextResponse.json({
    completedThisWeek,
    createdThisWeek,
    meetings,
    totalActionItems: totalActions,
    staleTasks,
    nextWeekTasks,
    atRiskMilestones,
    tasksByStatus,
  });
}
