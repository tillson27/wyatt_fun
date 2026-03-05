"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { MapPin, Plus } from "lucide-react";

interface Site {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  rollouts: {
    id: string;
    status: string;
    progressPct: number;
    delayDays: number;
    vendor: { name: string };
  }[];
  tasks: { id: string; status: string }[];
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", location: "" });

  const fetchSites = () => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data) => {
        setSites(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setDialogOpen(false);
      setForm({ name: "", description: "", location: "" });
      fetchSites();
    }
    setSaving(false);
  };

  if (loading)
    return <p className="text-slate-400 py-8 text-center">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Sites</h1>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Site
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sites.map((site) => {
          const done = site.tasks.filter((t) => t.status === "done").length;
          return (
            <Link key={site.id} href={`/sites/${site.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {site.name}
                  </CardTitle>
                  <p className="text-sm text-slate-500">{site.description}</p>
                  {site.location && (
                    <p className="text-xs text-slate-400">{site.location}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {site.rollouts.map((r) => (
                    <div key={r.id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{r.vendor.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {r.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <Progress value={r.progressPct} className="h-2" />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{r.progressPct}%</span>
                        {r.delayDays > 0 && (
                          <span className="text-red-500">
                            {r.delayDays}d delay
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t text-xs text-slate-500">
                    {done}/{site.tasks.length} tasks complete
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Site</DialogTitle>
            <DialogDescription>
              Create a new SAGD facility site to track.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name *</Label>
              <Input
                placeholder="e.g. Delta"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                placeholder="e.g. Northern Alberta SAGD Facility D"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input
                placeholder="e.g. Peace River, AB"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.name.trim() || saving}
            >
              {saving ? "Creating..." : "Create Site"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
