"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  date: string;
  attendees: string | null;
  parsedSummary: string | null;
  actionItems: { id: string }[];
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/meetings")
      .then((r) => r.json())
      .then((data) => {
        setMeetings(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
          <p className="text-sm text-slate-500">{meetings.length} meetings</p>
        </div>
        <Link href="/meetings/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> New Meeting
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-400 text-center py-8">Loading...</p>
      ) : meetings.length === 0 ? (
        <p className="text-slate-400 text-center py-8">No meetings yet</p>
      ) : (
        <div className="space-y-2">
          {meetings.map((m) => (
            <Link key={m.id} href={`/meetings/${m.id}`}>
              <Card className="hover:shadow-sm transition-shadow cursor-pointer">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-sm">{m.title}</span>
                      <div className="flex gap-2 mt-1 text-xs text-slate-500">
                        <span>{format(new Date(m.date), "MMM d, yyyy")}</span>
                        {m.attendees && <span>{m.attendees}</span>}
                      </div>
                      {m.parsedSummary && (
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {m.parsedSummary}
                        </p>
                      )}
                    </div>
                    {m.actionItems.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {m.actionItems.length} actions
                      </Badge>
                    )}
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
