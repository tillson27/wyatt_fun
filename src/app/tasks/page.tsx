"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Filter, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  owner: string | null;
  dueDate: string | null;
  siteId: string | null;
  vendorId: string | null;
  workStreamId: string | null;
  site: { id: string; name: string } | null;
  vendor: { id: string; name: string } | null;
  workStream: { id: string; name: string } | null;
  subtasks: { id: string }[];
}

const statusColors: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-green-100 text-green-700",
};

const priorityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-slate-100 text-slate-600",
};

export default function TasksPage() {
  return (
    <Suspense fallback={<p className="text-slate-400 py-8">Loading...</p>}>
      <TasksContent />
    </Suspense>
  );
}

function TasksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickAddTitle, setQuickAddTitle] = useState("");

  // Filter state from URL params
  const siteId = searchParams.get("siteId") || "";
  const vendorId = searchParams.get("vendorId") || "";
  const status = searchParams.get("status") || "";
  const priority = searchParams.get("priority") || "";

  const fetchTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (siteId) params.set("siteId", siteId);
    if (vendorId) params.set("vendorId", vendorId);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);

    const res = await fetch(`/api/tasks?${params.toString()}`);
    const data = await res.json();
    setTasks(data);
    setLoading(false);
  }, [siteId, vendorId, status, priority]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/tasks?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/tasks");
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTitle.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: quickAddTitle.trim(),
        siteId: siteId || undefined,
        vendorId: vendorId || undefined,
      }),
    });
    setQuickAddTitle("");
    fetchTasks();
  };

  const hasFilters = siteId || vendorId || status || priority;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500">{tasks.length} tasks</p>
        </div>
        <Link href="/tasks/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="h-4 w-4 text-slate-400" />
            <Select value={siteId} onValueChange={(v) => setFilter("siteId", v)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="site-alpha">Alpha</SelectItem>
                <SelectItem value="site-bravo">Bravo</SelectItem>
                <SelectItem value="site-charlie">Charlie</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={vendorId}
              onValueChange={(v) => setFilter("vendorId", v)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vendor-safety">SafeTrack Solutions</SelectItem>
                <SelectItem value="vendor-ops">OpsFlow Systems</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => setFilter("status", v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priority}
              onValueChange={(v) => setFilter("priority", v)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" /> Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Add */}
      <form onSubmit={handleQuickAdd} className="flex gap-2">
        <Input
          placeholder="Quick add task..."
          value={quickAddTitle}
          onChange={(e) => setQuickAddTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={!quickAddTitle.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      {/* Task List */}
      {loading ? (
        <p className="text-slate-400 text-center py-8">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No tasks found</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Link key={task.id} href={`/tasks/${task.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium text-sm ${
                            task.status === "done"
                              ? "line-through text-slate-400"
                              : ""
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.subtasks.length > 0 && (
                          <span className="text-xs text-slate-400">
                            +{task.subtasks.length} subtasks
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1 text-xs text-slate-500">
                        {task.owner && <span>{task.owner}</span>}
                        {task.site && <span>{task.site.name}</span>}
                        {task.workStream && <span>{task.workStream.name}</span>}
                        {task.dueDate && (
                          <span>Due {format(new Date(task.dueDate), "MMM d")}</span>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={`text-xs ${priorityColors[task.priority] || ""}`}
                      variant="outline"
                    >
                      {task.priority}
                    </Badge>
                    <Badge
                      className={`text-xs ${statusColors[task.status] || ""}`}
                      variant="outline"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
