import { prisma } from "@/lib/db";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { ProgressChart } from "@/components/progress-chart";
import Link from "next/link";

const statusColors: Record<string, string> = {
  not_started: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  delayed: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
};


export default async function DashboardPage() {
  const now = new Date();
  const today = startOfDay(now);
  const nextWeek = addDays(today, 7);

  const [sites, overdueTasks, upcomingTasks, milestones, snapshots] =
    await Promise.all([
      prisma.site.findMany({
        include: {
          rollouts: { include: { vendor: true } },
          tasks: true,
        },
      }),
      prisma.task.findMany({
        where: {
          status: { not: "done" },
          dueDate: { lt: today },
        },
        include: { site: true, vendor: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.task.findMany({
        where: {
          status: { not: "done" },
          dueDate: { gte: today, lte: nextWeek },
        },
        include: { site: true },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.milestone.findMany({
        where: {
          date: { gte: today, lte: nextWeek },
        },
        include: { site: true, workStream: true },
        orderBy: { date: "asc" },
      }),
      prisma.progressSnapshot.findMany({
        where: {
          date: { gte: addDays(today, -14) },
        },
        include: { site: true },
        orderBy: { date: "asc" },
      }),
    ]);

  // Build chart data
  const chartDataMap = new Map<string, Record<string, number>>();
  for (const snap of snapshots) {
    const dateKey = format(snap.date, "MMM d");
    if (!chartDataMap.has(dateKey)) {
      chartDataMap.set(dateKey, { Alpha: 0, Bravo: 0, Charlie: 0 });
    }
    const entry = chartDataMap.get(dateKey)!;
    entry[snap.site.name] = snap.progressPct;
  }
  const chartData = Array.from(chartDataMap.entries()).map(([date, vals]) => ({
    date,
    Alpha: vals.Alpha ?? 0,
    Bravo: vals.Bravo ?? 0,
    Charlie: vals.Charlie ?? 0,
  }));

  // Count tasks by status per site
  const taskStats = sites.map((site) => {
    const tasks = site.tasks;
    return {
      site,
      total: tasks.length,
      done: tasks.filter((t) => t.status === "done").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      blocked: tasks.filter((t) => t.status === "blocked").length,
      overdue: tasks.filter(
        (t) =>
          t.status !== "done" && t.dueDate && isBefore(t.dueDate, today)
      ).length,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm">
          SAGD Implementation Overview &middot;{" "}
          {format(now, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* Site Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {taskStats.map(({ site, total, done, inProgress, blocked, overdue }) => (
          <Link key={site.id} href={`/sites/${site.id}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>{site.name}</span>
                  {overdue > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {overdue} overdue
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-slate-500">{site.description}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {site.rollouts.map((r) => (
                  <div key={r.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{r.vendor.name}</span>
                      <Badge
                        className={`text-xs ${statusColors[r.status] || ""}`}
                        variant="outline"
                      >
                        {r.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <Progress value={r.progressPct} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{r.progressPct}%</span>
                      {r.delayDays > 0 && (
                        <span className="text-red-600">
                          {r.delayDays}d delayed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="grid grid-cols-4 gap-1 text-center text-xs pt-2 border-t">
                  <div>
                    <p className="font-semibold">{total}</p>
                    <p className="text-slate-400">Total</p>
                  </div>
                  <div>
                    <p className="font-semibold text-green-600">{done}</p>
                    <p className="text-slate-400">Done</p>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-600">{inProgress}</p>
                    <p className="text-slate-400">Active</p>
                  </div>
                  <div>
                    <p className="font-semibold text-red-600">{blocked}</p>
                    <p className="text-slate-400">Blocked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Progress Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressChart data={chartData} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Overdue Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Overdue ({overdueTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overdueTasks.length === 0 ? (
                <p className="text-sm text-slate-400">No overdue tasks</p>
              ) : (
                <ul className="space-y-2">
                  {overdueTasks.map((t) => (
                    <li key={t.id} className="text-sm">
                      <Link
                        href={`/tasks/${t.id}`}
                        className="hover:underline font-medium"
                      >
                        {t.title}
                      </Link>
                      <div className="flex gap-2 text-xs text-slate-500">
                        <span>{t.site?.name}</span>
                        {t.dueDate && (
                          <span className="text-red-500">
                            Due {format(t.dueDate, "MMM d")}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-blue-700">
                <Clock className="h-4 w-4" />
                Upcoming 7 Days ({upcomingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-slate-400">Nothing upcoming</p>
              ) : (
                <ul className="space-y-2">
                  {upcomingTasks.map((t) => (
                    <li key={t.id} className="text-sm">
                      <Link
                        href={`/tasks/${t.id}`}
                        className="hover:underline font-medium"
                      >
                        {t.title}
                      </Link>
                      <div className="flex gap-2 text-xs text-slate-500">
                        <span>{t.site?.name}</span>
                        {t.dueDate && (
                          <span>Due {format(t.dueDate, "MMM d")}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Milestones This Week */}
          {milestones.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Milestones This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {milestones.map((m) => (
                    <li key={m.id} className="text-sm">
                      <span className="font-medium">{m.title}</span>
                      <div className="flex gap-2 text-xs text-slate-500">
                        <span>{m.site?.name}</span>
                        <span>{format(m.date, "MMM d")}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            m.status === "at_risk"
                              ? "text-red-600"
                              : "text-slate-600"
                          }`}
                        >
                          {m.type.replace("_", " ")}
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
