"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Trash2, Plus } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  owner: string | null;
  dueDate: string | null;
  completedAt: string | null;
  siteId: string | null;
  vendorId: string | null;
  workStreamId: string | null;
  meetingId: string | null;
  parentTaskId: string | null;
  site: { name: string } | null;
  vendor: { name: string } | null;
  workStream: { name: string } | null;
  meeting: { title: string } | null;
  parentTask: { id: string; title: string } | null;
  subtasks: { id: string; title: string; status: string }[];
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [task, setTask] = useState<Task | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState("");

  useEffect(() => {
    fetch(`/api/tasks/${params.id}`)
      .then((r) => r.json())
      .then(setTask);
  }, [params.id]);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title"),
      description: form.get("description") || null,
      priority: form.get("priority"),
      status: form.get("status"),
      owner: form.get("owner") || null,
      dueDate: form.get("dueDate") || null,
      siteId: form.get("siteId") || null,
      vendorId: form.get("vendorId") || null,
      workStreamId: form.get("workStreamId") || null,
    };

    const res = await fetch(`/api/tasks/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const updated = await res.json();
      setTask({ ...task, ...updated });
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    await fetch(`/api/tasks/${params.id}`, { method: "DELETE" });
    router.push("/tasks");
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subtaskTitle.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: subtaskTitle.trim(),
        parentTaskId: params.id,
        siteId: task?.siteId,
        vendorId: task?.vendorId,
        workStreamId: task?.workStreamId,
      }),
    });
    setSubtaskTitle("");
    // Refresh
    const res = await fetch(`/api/tasks/${params.id}`);
    setTask(await res.json());
  };

  const toggleSubtask = async (subtaskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "done" ? "todo" : "done";
    await fetch(`/api/tasks/${subtaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const res = await fetch(`/api/tasks/${params.id}`);
    setTask(await res.json());
  };

  if (!task) return <p className="text-slate-400 py-8">Loading...</p>;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold flex-1">
          {editing ? "Edit Task" : task.title}
        </h1>
        {!editing && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={task.title} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={task.description || ""}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select name="priority" defaultValue={task.priority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select name="status" defaultValue={task.status}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner">Owner</Label>
                  <Input id="owner" name="owner" defaultValue={task.owner || ""} />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={
                      task.dueDate
                        ? format(new Date(task.dueDate), "yyyy-MM-dd")
                        : ""
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Site</Label>
                  <Select name="siteId" defaultValue={task.siteId || ""}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="site-alpha">Alpha</SelectItem>
                      <SelectItem value="site-bravo">Bravo</SelectItem>
                      <SelectItem value="site-charlie">Charlie</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vendor</Label>
                  <Select name="vendorId" defaultValue={task.vendorId || ""}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vendor-safety">SafeTrack</SelectItem>
                      <SelectItem value="vendor-ops">OpsFlow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Stream</Label>
                  <Select name="workStreamId" defaultValue={task.workStreamId || ""}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ws-bypass">Safety Bypass</SelectItem>
                      <SelectItem value="ws-carseal">Car Seal</SelectItem>
                      <SelectItem value="ws-loto">LOTO</SelectItem>
                      <SelectItem value="ws-rounds">Operator Rounds</SelectItem>
                      <SelectItem value="ws-sheets">Reading Sheets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {task.description && (
              <p className="text-sm text-slate-600">{task.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Status:</span>{" "}
                <Badge variant="outline">{task.status.replace("_", " ")}</Badge>
              </div>
              <div>
                <span className="text-slate-400">Priority:</span>{" "}
                <Badge variant="outline">{task.priority}</Badge>
              </div>
              <div>
                <span className="text-slate-400">Owner:</span>{" "}
                {task.owner || "Unassigned"}
              </div>
              <div>
                <span className="text-slate-400">Due:</span>{" "}
                {task.dueDate
                  ? format(new Date(task.dueDate), "MMM d, yyyy")
                  : "No date"}
              </div>
              <div>
                <span className="text-slate-400">Site:</span>{" "}
                {task.site?.name || "None"}
              </div>
              <div>
                <span className="text-slate-400">Vendor:</span>{" "}
                {task.vendor?.name || "None"}
              </div>
              <div>
                <span className="text-slate-400">Stream:</span>{" "}
                {task.workStream?.name || "None"}
              </div>
              {task.meeting && (
                <div>
                  <span className="text-slate-400">Meeting:</span>{" "}
                  <Link
                    href={`/meetings/${task.meetingId}`}
                    className="text-blue-600 hover:underline"
                  >
                    {task.meeting.title}
                  </Link>
                </div>
              )}
              {task.parentTask && (
                <div>
                  <span className="text-slate-400">Parent:</span>{" "}
                  <Link
                    href={`/tasks/${task.parentTask.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {task.parentTask.title}
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subtasks */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Subtasks ({task.subtasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {task.subtasks.map((st) => (
            <div
              key={st.id}
              className="flex items-center gap-2 text-sm cursor-pointer"
              onClick={() => toggleSubtask(st.id, st.status)}
            >
              <input
                type="checkbox"
                checked={st.status === "done"}
                readOnly
                className="rounded"
              />
              <span
                className={
                  st.status === "done" ? "line-through text-slate-400" : ""
                }
              >
                {st.title}
              </span>
            </div>
          ))}
          <form onSubmit={handleAddSubtask} className="flex gap-2 pt-2">
            <Input
              placeholder="Add subtask..."
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" variant="outline" disabled={!subtaskTitle.trim()}>
              <Plus className="h-3 w-3" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
