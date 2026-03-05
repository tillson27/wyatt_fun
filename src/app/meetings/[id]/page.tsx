"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trash2 } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  date: string;
  attendees: string | null;
  rawNotes: string | null;
  parsedSummary: string | null;
  actionItems: {
    id: string;
    title: string;
    status: string;
    owner: string | null;
    site: { name: string } | null;
    vendor: { name: string } | null;
  }[];
}

const statusColors: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  blocked: "bg-red-100 text-red-700",
  done: "bg-green-100 text-green-700",
};

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [meeting, setMeeting] = useState<Meeting | null>(null);

  useEffect(() => {
    fetch(`/api/meetings/${params.id}`)
      .then((r) => r.json())
      .then(setMeeting);
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Delete this meeting?")) return;
    await fetch(`/api/meetings/${params.id}`, { method: "DELETE" });
    router.push("/meetings");
  };

  if (!meeting) return <p className="text-slate-400 py-8">Loading...</p>;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{meeting.title}</h1>
          <div className="flex gap-3 text-sm text-slate-500">
            <span>{format(new Date(meeting.date), "MMMM d, yyyy")}</span>
            {meeting.attendees && <span>{meeting.attendees}</span>}
          </div>
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {meeting.parsedSummary && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">{meeting.parsedSummary}</p>
          </CardContent>
        </Card>
      )}

      {meeting.rawNotes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono">
              {meeting.rawNotes}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            Action Items ({meeting.actionItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meeting.actionItems.length === 0 ? (
            <p className="text-sm text-slate-400">No action items</p>
          ) : (
            <div className="space-y-2">
              {meeting.actionItems.map((task) => (
                <Link key={task.id} href={`/tasks/${task.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={task.status === "done"}
                      readOnly
                      className="rounded"
                    />
                    <span
                      className={`text-sm flex-1 ${
                        task.status === "done"
                          ? "line-through text-slate-400"
                          : ""
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.owner && (
                      <span className="text-xs text-slate-500">{task.owner}</span>
                    )}
                    <Badge
                      className={`text-xs ${statusColors[task.status] || ""}`}
                      variant="outline"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
