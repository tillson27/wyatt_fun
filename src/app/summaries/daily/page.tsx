"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  Flag,
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  owner: string | null;
  dueDate: string | null;
  site: { name: string } | null;
  vendor: { name: string } | null;
  workStream: { name: string } | null;
}

interface MilestoneItem {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  site: { name: string } | null;
  workStream: { name: string } | null;
}

interface DailySummary {
  overdue: TaskItem[];
  dueToday: TaskItem[];
  completedYesterday: TaskItem[];
  upcoming: TaskItem[];
  blocked: TaskItem[];
  milestones: MilestoneItem[];
}

function TaskList({ tasks, showDue }: { tasks: TaskItem[]; showDue?: boolean }) {
  if (tasks.length === 0)
    return <p className="text-sm text-slate-400">None</p>;
  return (
    <ul className="space-y-1">
      {tasks.map((t) => (
        <li key={t.id}>
          <Link
            href={`/tasks/${t.id}`}
            className="text-sm hover:underline font-medium"
          >
            {t.title}
          </Link>
          <div className="flex gap-2 text-xs text-slate-500">
            {t.owner && <span>{t.owner}</span>}
            {t.site && <span>{t.site.name}</span>}
            {showDue && t.dueDate && (
              <span>Due {format(new Date(t.dueDate), "MMM d")}</span>
            )}
            <Badge variant="outline" className="text-xs">
              {t.priority}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DailySummaryPage() {
  const [data, setData] = useState<DailySummary | null>(null);

  useEffect(() => {
    fetch("/api/summaries/daily")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-slate-400 py-8">Loading...</p>;

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daily Summary</h1>
        <p className="text-sm text-slate-500">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              Overdue ({data.overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={data.overdue} showDue />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700">
              <Calendar className="h-4 w-4" />
              Due Today ({data.dueToday.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={data.dueToday} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Completed Yesterday ({data.completedYesterday.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={data.completedYesterday} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700">
              <Clock className="h-4 w-4" />
              Upcoming 3 Days ({data.upcoming.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={data.upcoming} showDue />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <Ban className="h-4 w-4" />
              Blocked ({data.blocked.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={data.blocked} />
          </CardContent>
        </Card>

        {data.milestones.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                <Flag className="h-4 w-4" />
                Milestones This Week ({data.milestones.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {data.milestones.map((m) => (
                  <li key={m.id} className="text-sm">
                    <span className="font-medium">{m.title}</span>
                    <div className="flex gap-2 text-xs text-slate-500">
                      {m.site && <span>{m.site.name}</span>}
                      <span>{format(new Date(m.date), "MMM d")}</span>
                      <Badge variant="outline" className="text-xs">
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
  );
}
