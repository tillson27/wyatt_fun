"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { ArrowLeft, Pencil, Save, Trash2 } from "lucide-react";

interface Rollout {
  id: string;
  status: string;
  progressPct: number;
  delayDays: number;
  delayReason: string | null;
  notes: string | null;
  plannedStart: string | null;
  plannedEnd: string | null;
  vendor: { id: string; name: string };
}

interface SiteTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  owner: string | null;
  dueDate: string | null;
  vendor: { name: string } | null;
  workStream: { name: string } | null;
}

interface SiteMilestone {
  id: string;
  title: string;
  date: string;
  type: string;
  status: string;
  workStream: { name: string } | null;
}

interface SiteDetail {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  rollouts: Rollout[];
  tasks: SiteTask[];
  milestones: SiteMilestone[];
}

const statusColors: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-green-100 text-green-700",
};

export default function SiteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [site, setSite] = useState<SiteDetail | null>(null);
  const [editingRollouts, setEditingRollouts] = useState(false);
  const [rolloutEdits, setRolloutEdits] = useState<Rollout[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingSite, setEditingSite] = useState(false);
  const [siteForm, setSiteForm] = useState({ name: "", description: "", location: "" });
  const [savingSite, setSavingSite] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/sites/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setSite(data);
        setRolloutEdits(data.rollouts);
        setSiteForm({
          name: data.name || "",
          description: data.description || "",
          location: data.location || "",
        });
      });
  }, [params.id]);

  const saveRollouts = async () => {
    setSaving(true);
    const res = await fetch(`/api/sites/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rollouts: rolloutEdits }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSite(updated);
      setRolloutEdits(updated.rollouts);
      setEditingRollouts(false);
    }
    setSaving(false);
  };

  const updateRollout = (index: number, field: string, value: unknown) => {
    setRolloutEdits((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r))
    );
  };

  const saveSiteDetails = async () => {
    if (!siteForm.name.trim()) return;
    setSavingSite(true);
    const res = await fetch(`/api/sites/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: siteForm.name,
        description: siteForm.description,
        location: siteForm.location,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSite(updated);
      setEditingSite(false);
    }
    setSavingSite(false);
  };

  const deleteSite = async () => {
    setDeleting(true);
    const res = await fetch(`/api/sites/${params.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/sites");
    }
    setDeleting(false);
  };

  if (!site) return <p className="text-slate-400 py-8">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          {editingSite ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={siteForm.name}
                  onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                  placeholder="Site name"
                  className="text-lg font-bold"
                />
              </div>
              <Input
                value={siteForm.description}
                onChange={(e) => setSiteForm({ ...siteForm, description: e.target.value })}
                placeholder="Description"
              />
              <Input
                value={siteForm.location}
                onChange={(e) => setSiteForm({ ...siteForm, location: e.target.value })}
                placeholder="Location"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveSiteDetails} disabled={!siteForm.name.trim() || savingSite}>
                  <Save className="h-3 w-3 mr-1" />
                  {savingSite ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingSite(false);
                    setSiteForm({
                      name: site.name || "",
                      description: site.description || "",
                      location: site.location || "",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{site.name}</h1>
              <p className="text-sm text-slate-500">
                {site.description}
                {site.location && ` - ${site.location}`}
              </p>
            </>
          )}
        </div>
        {!editingSite && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => setEditingSite(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Site</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{site.name}</strong>? This will remove all rollout data and progress snapshots for this site. Tasks and milestones will be unlinked but not deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteSite} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete Site"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({site.tasks.length})</TabsTrigger>
          <TabsTrigger value="milestones">
            Milestones ({site.milestones.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Vendor Rollouts</h2>
            {!editingRollouts ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingRollouts(true)}
              >
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={saveRollouts} disabled={saving}>
                  <Save className="h-3 w-3 mr-1" />
                  {saving ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingRollouts(false);
                    setRolloutEdits(site.rollouts);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {editingRollouts
            ? rolloutEdits.map((r, i) => (
                <Card key={r.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {r.vendor.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={r.status}
                          onValueChange={(v) => updateRollout(i, "status", v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not_started">
                              Not Started
                            </SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="delayed">Delayed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Progress %</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={r.progressPct}
                          onChange={(e) =>
                            updateRollout(
                              i,
                              "progressPct",
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Delay (days)</Label>
                        <Input
                          type="number"
                          min={0}
                          value={r.delayDays}
                          onChange={(e) =>
                            updateRollout(
                              i,
                              "delayDays",
                              parseInt(e.target.value) || 0
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Delay Reason</Label>
                      <Input
                        value={r.delayReason || ""}
                        onChange={(e) =>
                          updateRollout(i, "delayReason", e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            : site.rollouts.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between">
                      {r.vendor.name}
                      <Badge variant="outline">
                        {r.status.replace("_", " ")}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress value={r.progressPct} className="h-3" />
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{r.progressPct}% complete</span>
                      {r.delayDays > 0 && (
                        <span className="text-red-600">
                          {r.delayDays} days delayed
                        </span>
                      )}
                    </div>
                    {r.delayReason && (
                      <p className="text-xs text-slate-500">
                        Delay: {r.delayReason}
                      </p>
                    )}
                    <div className="flex gap-4 text-xs text-slate-400">
                      {r.plannedStart && (
                        <span>
                          Start:{" "}
                          {format(new Date(r.plannedStart), "MMM d, yyyy")}
                        </span>
                      )}
                      {r.plannedEnd && (
                        <span>
                          End:{" "}
                          {format(new Date(r.plannedEnd), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-2">
            {site.tasks.length === 0 ? (
              <p className="text-slate-400 text-center py-4">
                No tasks for this site
              </p>
            ) : (
              site.tasks.map((t) => (
                <Link key={t.id} href={`/tasks/${t.id}`}>
                  <Card className="hover:shadow-sm cursor-pointer">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <span
                            className={`font-medium text-sm ${
                              t.status === "done"
                                ? "line-through text-slate-400"
                                : ""
                            }`}
                          >
                            {t.title}
                          </span>
                          <div className="flex gap-2 text-xs text-slate-500 mt-1">
                            {t.owner && <span>{t.owner}</span>}
                            {t.workStream && <span>{t.workStream.name}</span>}
                            {t.dueDate && (
                              <span>
                                Due{" "}
                                {format(new Date(t.dueDate), "MMM d")}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={`text-xs ${statusColors[t.status] || ""}`}
                          variant="outline"
                        >
                          {t.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="milestones">
          <div className="space-y-2">
            {site.milestones.length === 0 ? (
              <p className="text-slate-400 text-center py-4">
                No milestones for this site
              </p>
            ) : (
              site.milestones.map((m) => (
                <Card key={m.id}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <span className="font-medium text-sm">{m.title}</span>
                        <div className="flex gap-2 text-xs text-slate-500 mt-1">
                          {m.workStream && <span>{m.workStream.name}</span>}
                          <span>{format(new Date(m.date), "MMM d, yyyy")}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {m.type.replace("_", " ")}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          m.status === "completed"
                            ? "text-green-600"
                            : m.status === "at_risk"
                            ? "text-red-600"
                            : m.status === "missed"
                            ? "text-red-800"
                            : "text-slate-600"
                        }`}
                      >
                        {m.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
