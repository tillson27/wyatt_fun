"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

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

  useEffect(() => {
    fetch("/api/sites")
      .then((r) => r.json())
      .then((data) => {
        setSites(data);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-slate-400 py-8 text-center">Loading...</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Sites</h1>
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
    </div>
  );
}
