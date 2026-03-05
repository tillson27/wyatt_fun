"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, X } from "lucide-react";

interface ActionItem {
  text: string;
  owner: string | null;
  priority: string;
  dueDate: string;
  siteId: string;
  vendorId: string;
}

export default function NewMeetingPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  const extractActions = useCallback(async () => {
    const res = await fetch("/api/meetings/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    const items = await res.json();
    setActionItems(
      items.map((a: { text: string; owner: string | null }) => ({
        text: a.text,
        owner: a.owner,
        priority: "medium",
        dueDate: "",
        siteId: "",
        vendorId: "",
      }))
    );
  }, [notes]);

  const updateAction = (index: number, field: string, value: string) => {
    setActionItems((prev) =>
      prev.map((a, i) => (i === index ? { ...a, [field]: value } : a))
    );
  };

  const removeAction = (index: number) => {
    setActionItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);

    const body = {
      title: form.get("title"),
      date: form.get("date"),
      attendees: form.get("attendees") || null,
      rawNotes: notes,
      parsedSummary: form.get("summary") || null,
      actionItems: actionItems.filter((a) => a.text.trim()),
    };

    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const meeting = await res.json();
      router.push(`/meetings/${meeting.id}`);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">New Meeting</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left: Meeting Info + Notes */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="attendees">Attendees</Label>
                    <Input
                      id="attendees"
                      name="attendees"
                      placeholder="Comma-separated"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  Notes
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={extractActions}
                    disabled={!notes.trim()}
                  >
                    <Zap className="h-3 w-3 mr-1" /> Extract Actions
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={15}
                  placeholder={`Type or paste meeting notes...\n\nAction item patterns:\n- [ ] Person to do thing\nACTION: Person to do thing\nTODO: thing\n@Person do thing`}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            <div>
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" name="summary" rows={3} />
            </div>
          </div>

          {/* Right: Extracted Action Items */}
          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  Action Items ({actionItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {actionItems.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">
                    Type notes and click &quot;Extract Actions&quot; to detect
                    action items
                  </p>
                ) : (
                  actionItems.map((item, i) => (
                    <div
                      key={i}
                      className="border rounded-md p-3 space-y-2 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeAction(i)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <Input
                        value={item.text}
                        onChange={(e) => updateAction(i, "text", e.target.value)}
                        className="text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={item.owner || ""}
                          onChange={(e) =>
                            updateAction(i, "owner", e.target.value)
                          }
                          placeholder="Owner"
                          className="text-xs"
                        />
                        <Input
                          type="date"
                          value={item.dueDate}
                          onChange={(e) =>
                            updateAction(i, "dueDate", e.target.value)
                          }
                          className="text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Select
                          value={item.priority}
                          onValueChange={(v) => updateAction(i, "priority", v)}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={item.siteId}
                          onValueChange={(v) => updateAction(i, "siteId", v)}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Site" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="site-alpha">Alpha</SelectItem>
                            <SelectItem value="site-bravo">Bravo</SelectItem>
                            <SelectItem value="site-charlie">Charlie</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={item.vendorId}
                          onValueChange={(v) => updateAction(i, "vendorId", v)}
                        >
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder="Vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="vendor-safety">SafeTrack</SelectItem>
                            <SelectItem value="vendor-ops">OpsFlow</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Meeting"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
