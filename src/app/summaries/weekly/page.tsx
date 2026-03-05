"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  PlusCircle,
  MessageSquare,
  Clock,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

interface WeeklySummary {
  completedThisWeek: { id: string; title: string; site: { name: string } | null }[];
  createdThisWeek: { id: string; title: string; site: { name: string } | null }[];
  meetings: {
    id: string;
    title: string;
    date: string;
    actionItems: { id: string }[];
  }[];
  totalActionItems: number;
  staleTasks: {
    id: string;
    title: string;
    status: string;
    site: { name: string } | null;
    vendor: { name: string } | null;
  }[];
  nextWeekTasks: {
    id: string;
    title: string;
    dueDate: string | null;
    site: { name: string } | null;
  }[];
  atRiskMilestones: {
    id: string;
    title: string;
    date: string;
    status: string;
    site: { name: string } | null;
    workStream: { name: string } | null;
  }[];
  tasksByStatus: {
    todo: number;
    in_progress: number;
    blocked: number;
    done: number;
  };
}

export default function WeeklySummaryPage() {
  const [data, setData] = useState<WeeklySummary | null>(null);

  useEffect(() => {
    fetch("/api/summaries/weekly")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-slate-400 py-8">Loading...</p>;

  const total =
    data.tasksByStatus.todo +
    data.tasksByStatus.in_progress +
    data.tasksByStatus.blocked +
    data.tasksByStatus.done;

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Weekly Summary</h1>
        <p className="text-sm text-slate-500">
          Week of {format(new Date(), "MMMM d, yyyy")}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {data.completedThisWeek.length}
            </p>
            <p className="text-xs text-slate-500">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {data.createdThisWeek.length}
            </p>
            <p className="text-xs text-slate-500">Created</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {data.meetings.length}
            </p>
            <p className="text-xs text-slate-500">Meetings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {data.totalActionItems}
            </p>
            <p className="text-xs text-slate-500">Actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Task Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Task Distribution ({total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-4 rounded-full overflow-hidden">
            {data.tasksByStatus.done > 0 && (
              <div
                className="bg-green-500"
                style={{
                  width: `${(data.tasksByStatus.done / total) * 100}%`,
                }}
              />
            )}
            {data.tasksByStatus.in_progress > 0 && (
              <div
                className="bg-blue-500"
                style={{
                  width: `${(data.tasksByStatus.in_progress / total) * 100}%`,
                }}
              />
            )}
            {data.tasksByStatus.todo > 0 && (
              <div
                className="bg-slate-300"
                style={{
                  width: `${(data.tasksByStatus.todo / total) * 100}%`,
                }}
              />
            )}
            {data.tasksByStatus.blocked > 0 && (
              <div
                className="bg-red-500"
                style={{
                  width: `${(data.tasksByStatus.blocked / total) * 100}%`,
                }}
              />
            )}
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Done ({data.tasksByStatus.done})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              In Progress ({data.tasksByStatus.in_progress})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              To Do ({data.tasksByStatus.todo})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              Blocked ({data.tasksByStatus.blocked})
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Completed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({data.completedThisWeek.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.completedThisWeek.length === 0 ? (
              <p className="text-sm text-slate-400">None this week</p>
            ) : (
              <ul className="space-y-1">
                {data.completedThisWeek.map((t) => (
                  <li key={t.id} className="text-sm">
                    <Link href={`/tasks/${t.id}`} className="hover:underline">
                      {t.title}
                    </Link>
                    {t.site && (
                      <span className="text-xs text-slate-400 ml-2">
                        {t.site.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Meetings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-purple-700">
              <MessageSquare className="h-4 w-4" />
              Meetings ({data.meetings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.meetings.length === 0 ? (
              <p className="text-sm text-slate-400">None this week</p>
            ) : (
              <ul className="space-y-1">
                {data.meetings.map((m) => (
                  <li key={m.id} className="text-sm">
                    <Link href={`/meetings/${m.id}`} className="hover:underline">
                      {m.title}
                    </Link>
                    <span className="text-xs text-slate-400 ml-2">
                      {format(new Date(m.date), "MMM d")} &middot;{" "}
                      {m.actionItems.length} actions
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Stale Tasks */}
        {data.staleTasks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                <Clock className="h-4 w-4" />
                Stale Tasks ({data.staleTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {data.staleTasks.map((t) => (
                  <li key={t.id} className="text-sm">
                    <Link href={`/tasks/${t.id}`} className="hover:underline">
                      {t.title}
                    </Link>
                    <div className="flex gap-2 text-xs text-slate-400">
                      {t.site && <span>{t.site.name}</span>}
                      <Badge variant="outline" className="text-xs">
                        {t.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Next Week */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700">
              <PlusCircle className="h-4 w-4" />
              Next Week Preview ({data.nextWeekTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.nextWeekTasks.length === 0 ? (
              <p className="text-sm text-slate-400">Nothing due</p>
            ) : (
              <ul className="space-y-1">
                {data.nextWeekTasks.map((t) => (
                  <li key={t.id} className="text-sm">
                    <Link href={`/tasks/${t.id}`} className="hover:underline">
                      {t.title}
                    </Link>
                    <div className="flex gap-2 text-xs text-slate-400">
                      {t.site && <span>{t.site.name}</span>}
                      {t.dueDate && (
                        <span>Due {format(new Date(t.dueDate), "MMM d")}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* At Risk Milestones */}
        {data.atRiskMilestones.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-4 w-4" />
                At-Risk Milestones ({data.atRiskMilestones.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {data.atRiskMilestones.map((m) => (
                  <li key={m.id} className="text-sm">
                    <span className="font-medium">{m.title}</span>
                    <div className="flex gap-2 text-xs text-slate-400">
                      {m.site && <span>{m.site.name}</span>}
                      <span>{format(new Date(m.date), "MMM d")}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          m.status === "at_risk" ? "text-red-600" : ""
                        }`}
                      >
                        {m.status.replace("_", " ")}
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
  );
}
