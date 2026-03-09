"use client";

import React, { useState, useEffect } from "react";
import {
  LayoutDashboard, Grid3X3, Layers, MapPin, GanttChart,
  ChevronDown, ChevronRight, X, CheckCircle2, AlertTriangle,
  Clock, Target, Edit3, TrendingUp, Plus, Trash2, Activity,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// ============================================================
// CONSTANTS
// ============================================================

const BUSINESS_UNITS = [
  { id: "cold-lake",   name: "Cold Lake Thermal",        province: "Alberta",             sites: ["Lindbergh", "Orion", "Tucker", "Selina"] },
  { id: "lloyd-th",   name: "Lloydminster Thermal",      province: "Saskatchewan",         sites: ["Meota", "Edam", "Vawn", "Glenbogie", "Plover Lake", "Taiga"] },
  { id: "lloyd-conv", name: "Lloydminster Conventional", province: "Alberta/Saskatchewan", sites: ["Bodo-Cosine", "Bellis", "Winter", "Cactus Lake", "Court", "Druid"] },
];

const MODULES = [
  { id: "shift-logs", name: "Shift Logs",             short: "Shift Logs" },
  { id: "facilities", name: "Facilities Logs",         short: "Facilities" },
  { id: "carseals",   name: "Carseals",                short: "Carseals"   },
  { id: "csb",        name: "Critical Safety Bypass",  short: "CSB"        },
  { id: "loto",       name: "LOTO",                    short: "LOTO"       },
  { id: "isolera",    name: "iSolera Decommission",     short: "iSolera"    },
  { id: "op-rounds",  name: "Operator Rounds",          short: "Op. Rounds" },
];

const LLOYD_THERMAL = new Set(["Meota", "Edam", "Vawn", "Glenbogie", "Plover Lake", "Taiga"]);

function inScope(site, mod) {
  if (mod === "isolera")   return site === "Lindbergh";
  if (mod === "op-rounds") return !LLOYD_THERMAL.has(site);
  return true;
}

const STATUS_OPTIONS = ["Not Started", "Discovery", "Configuration", "UAT", "Training", "Go-Live", "Complete"];
const STATUS_PCT = { "Not Started": 0, "Discovery": 10, "Configuration": 30, "UAT": 60, "Training": 75, "Go-Live": 90, "Complete": 100 };

const STATUS_CLS = {
  "Not Started":   "bg-slate-100 text-slate-500 border-slate-200",
  "Discovery":     "bg-blue-50 text-blue-700 border-blue-200",
  "Configuration": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "UAT":           "bg-violet-50 text-violet-700 border-violet-200",
  "Training":      "bg-orange-50 text-orange-700 border-orange-200",
  "Go-Live":       "bg-teal-50 text-teal-700 border-teal-200",
  "Complete":      "bg-green-50 text-green-700 border-green-200",
};

const RAG = {
  Green: { dot: "bg-green-500", text: "text-green-700", light: "bg-green-50", border: "border-green-300", ring: "ring-green-400" },
  Amber: { dot: "bg-amber-500", text: "text-amber-700", light: "bg-amber-50", border: "border-amber-300", ring: "ring-amber-400" },
  Red:   { dot: "bg-red-500",   text: "text-red-700",   light: "bg-red-50",   border: "border-red-300",   ring: "ring-red-400"   },
};

// ============================================================
// ACTIVITY ROLLUP HELPER
// Each item has an optional activities[] array. When present,
// pctComplete is derived from activity progress, not stored manually.
// ============================================================

function activityPct(item) {
  const acts = item?.activities;
  if (!acts || acts.length === 0) return item?.pctComplete ?? 0;
  const total = acts.reduce((s, a) => s + (a.completed ? 100 : a.pctComplete), 0);
  return Math.round(total / acts.length);
}

function newActivityId() {
  return `act-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// ============================================================
// SEED DATA
// ============================================================

function createSeedData() {
  const d = {};
  const a = (site, mod, status, rag, owner = "", tgl = "", agl = "", notes = "", blockers = "") => {
    d[`${site}::${mod}`] = {
      site, mod, status, rag, owner,
      targetGoLive: tgl, actualGoLive: agl,
      notes, blockers,
      pctComplete: STATUS_PCT[status],
      manualPct: false,
      activities: [],
    };
  };

  // Cold Lake — Lindbergh (all 7)
  a("Lindbergh","shift-logs","Complete",      "Green","M. Patterson","2025-11-30","2025-11-28","Smooth go-live, high adoption rate.");
  a("Lindbergh","facilities","Complete",      "Green","M. Patterson","2025-12-15","2025-12-10","All checklists digitized and validated.");
  a("Lindbergh","carseals",  "Go-Live",       "Green","S. Nguyen",   "2026-01-31","",          "Live since Jan 20, monitoring ongoing.");
  a("Lindbergh","csb",       "UAT",           "Amber","S. Nguyen",   "2026-02-28","","",        "2 test cases failing; awaiting SafeTrack dev fix.");
  a("Lindbergh","loto",      "Configuration", "Green","T. Olson",    "2026-03-31");
  a("Lindbergh","isolera",   "Configuration", "Red",  "T. Olson",    "2026-03-15","","",        "Data migration blocked — IT ticket #4412 open since Dec. Needs exec escalation.");
  a("Lindbergh","op-rounds", "Training",      "Green","K. Sharma",   "2026-02-15","","Field crew training 80% complete.");

  // Orion (6)
  a("Orion","shift-logs","Go-Live",       "Green","B. Chen",   "2026-01-15","","Launched Jan 10, minor issues resolved.");
  a("Orion","facilities","UAT",           "Amber","B. Chen",   "2026-02-28","","","Site manager sign-off delayed 2 weeks.");
  a("Orion","carseals",  "Configuration", "Green","L. Forbes", "2026-03-15");
  a("Orion","csb",       "Configuration", "Green","L. Forbes", "2026-03-31");
  a("Orion","loto",      "Discovery",     "Green","T. Olson",  "2026-04-30");
  a("Orion","op-rounds", "Configuration", "Green","K. Sharma", "2026-03-31");

  // Tucker (6)
  a("Tucker","shift-logs","Configuration","Green","R. Dahl",  "2026-03-15");
  a("Tucker","facilities","Configuration","Amber","R. Dahl",  "2026-03-31","","","Awaiting updated facility layout drawings.");
  a("Tucker","carseals",  "Discovery",    "Green","P. Watts", "2026-04-30");
  a("Tucker","csb",       "Discovery",    "Green","P. Watts", "2026-05-15");
  a("Tucker","loto",      "Not Started",  "Green","",         "2026-06-30");
  a("Tucker","op-rounds", "Discovery",    "Green","K. Sharma","2026-05-31");

  // Selina (6)
  a("Selina","shift-logs","Discovery",  "Green","A. Flores","2026-04-15");
  a("Selina","facilities","Discovery",  "Amber","A. Flores","2026-05-31","","","Site access restricted during maintenance window.");
  a("Selina","carseals",  "Not Started","Green","",          "2026-06-15");
  a("Selina","csb",       "Not Started","Green","",          "2026-06-30");
  a("Selina","loto",      "Not Started","Green","",          "2026-07-31");
  a("Selina","op-rounds", "Not Started","Green","",          "2026-07-15");

  // Lloyd Thermal — 5 each
  a("Meota","shift-logs","Training",     "Green","D. McIntosh","2026-02-28","","Training sessions underway, 70% attendance.");
  a("Meota","facilities","UAT",          "Green","D. McIntosh","2026-03-15");
  a("Meota","carseals",  "Configuration","Amber","J. Reyes",   "2026-03-31","","","Equipment master list 60% complete.");
  a("Meota","csb",       "Configuration","Green","J. Reyes",   "2026-04-15");
  a("Meota","loto",      "Discovery",    "Green","C. Walsh",   "2026-05-31");

  a("Edam","shift-logs","Configuration","Green","V. Petrov","2026-03-31");
  a("Edam","facilities","Configuration","Green","V. Petrov","2026-04-15");
  a("Edam","carseals",  "Discovery",    "Red",  "N. Hunt",  "2026-04-30","","","Lead stakeholder on leave until April; discovery stalled.");
  a("Edam","csb",       "Discovery",    "Green","N. Hunt",  "2026-05-15");
  a("Edam","loto",      "Not Started",  "Green","",         "2026-06-30");

  a("Vawn","shift-logs","Discovery",  "Green","H. Larsen","2026-04-30");
  a("Vawn","facilities","Discovery",  "Amber","H. Larsen","2026-05-31","","","Scope clarification needed with operations team.");
  a("Vawn","carseals",  "Not Started","Green","",          "2026-06-15");
  a("Vawn","csb",       "Not Started","Green","",          "2026-06-30");
  a("Vawn","loto",      "Not Started","Green","",          "2026-07-31");

  a("Glenbogie","shift-logs","Discovery",  "Green","E. Park","2026-05-15");
  a("Glenbogie","facilities","Not Started","Green","",       "2026-06-30");
  a("Glenbogie","carseals",  "Not Started","Green","",       "2026-07-15");
  a("Glenbogie","csb",       "Not Started","Green","",       "2026-07-31");
  a("Glenbogie","loto",      "Not Started","Green","",       "2026-08-31");

  a("Plover Lake","shift-logs","Not Started","Green","","2026-06-30");
  a("Plover Lake","facilities","Not Started","Green","","2026-07-15");
  a("Plover Lake","carseals",  "Not Started","Green","","2026-08-15");
  a("Plover Lake","csb",       "Not Started","Green","","2026-08-31");
  a("Plover Lake","loto",      "Not Started","Green","","2026-09-30");

  a("Taiga","shift-logs","Not Started","Green","","2026-07-15");
  a("Taiga","facilities","Not Started","Green","","2026-07-31");
  a("Taiga","carseals",  "Not Started","Green","","2026-08-31");
  a("Taiga","csb",       "Not Started","Green","","2026-09-15");
  a("Taiga","loto",      "Not Started","Green","","2026-10-31");

  // Lloyd Conventional — 6 each
  a("Bodo-Cosine","shift-logs","UAT",           "Green","F. Bergman","2026-02-15");
  a("Bodo-Cosine","facilities","Configuration", "Green","F. Bergman","2026-03-15");
  a("Bodo-Cosine","carseals",  "Configuration", "Amber","G. Thomas", "2026-03-31","","","Legacy system integration pending.");
  a("Bodo-Cosine","csb",       "Discovery",     "Green","G. Thomas", "2026-04-30");
  a("Bodo-Cosine","loto",      "Discovery",     "Green","W. Bell",   "2026-05-31");
  a("Bodo-Cosine","op-rounds", "Configuration", "Green","W. Bell",   "2026-04-15");

  a("Bellis","shift-logs","Configuration","Green","I. Young","2026-03-31");
  a("Bellis","facilities","Discovery",    "Green","I. Young","2026-04-30");
  a("Bellis","carseals",  "Discovery",    "Red",  "O. Cruz", "2026-04-30","","","Conflicting project priorities; team bandwidth critically low.");
  a("Bellis","csb",       "Not Started",  "Green","",         "2026-06-15");
  a("Bellis","loto",      "Not Started",  "Green","",         "2026-07-15");
  a("Bellis","op-rounds", "Discovery",    "Green","O. Cruz",  "2026-05-31");

  a("Winter","shift-logs","Discovery",  "Amber","P. Morrison","2026-04-30","","","Kickoff rescheduled from Jan; 3-week delay.");
  a("Winter","facilities","Discovery",  "Green","P. Morrison","2026-05-15");
  a("Winter","carseals",  "Not Started","Green","",           "2026-06-30");
  a("Winter","csb",       "Not Started","Green","",           "2026-07-15");
  a("Winter","loto",      "Not Started","Green","",           "2026-08-15");
  a("Winter","op-rounds", "Not Started","Green","",           "2026-07-31");

  a("Cactus Lake","shift-logs","Not Started","Green","","2026-05-31");
  a("Cactus Lake","facilities","Not Started","Green","","2026-06-15");
  a("Cactus Lake","carseals",  "Not Started","Green","","2026-07-15");
  a("Cactus Lake","csb",       "Not Started","Green","","2026-07-31");
  a("Cactus Lake","loto",      "Not Started","Green","","2026-08-31");
  a("Cactus Lake","op-rounds", "Not Started","Green","","2026-08-15");

  a("Court","shift-logs","Not Started","Green","","2026-06-30");
  a("Court","facilities","Not Started","Green","","2026-07-15");
  a("Court","carseals",  "Not Started","Green","","2026-08-15");
  a("Court","csb",       "Not Started","Green","","2026-08-31");
  a("Court","loto",      "Not Started","Green","","2026-09-30");
  a("Court","op-rounds", "Not Started","Green","","2026-09-15");

  a("Druid","shift-logs","Not Started","Green","","2026-07-31");
  a("Druid","facilities","Not Started","Green","","2026-08-15");
  a("Druid","carseals",  "Not Started","Green","","2026-09-15");
  a("Druid","csb",       "Not Started","Green","","2026-09-30");
  a("Druid","loto",      "Not Started","Green","","2026-10-31");
  a("Druid","op-rounds", "Not Started","Green","","2026-10-15");

  // ---- Seed activities for several in-progress items ----

  d["Lindbergh::csb"].activities = [
    { id: "a1", title: "Prepare UAT test scenarios",   pctComplete: 100, completed: true,  dueDate: "2026-02-01" },
    { id: "a2", title: "Execute UAT round 1",          pctComplete: 70,  completed: false, dueDate: "2026-02-14" },
    { id: "a3", title: "Resolve UAT defects",          pctComplete: 20,  completed: false, dueDate: "2026-02-21" },
    { id: "a4", title: "Obtain site manager sign-off", pctComplete: 0,   completed: false, dueDate: "2026-02-28" },
  ];

  d["Lindbergh::isolera"].activities = [
    { id: "b1", title: "IT data migration scoping",   pctComplete: 30, completed: false, dueDate: "2026-01-31" },
    { id: "b2", title: "Obtain IT approval (ticket #4412)", pctComplete: 0, completed: false, dueDate: "2026-02-15" },
    { id: "b3", title: "Execute data migration",      pctComplete: 0,  completed: false, dueDate: "2026-03-01" },
    { id: "b4", title: "Validate migrated data",      pctComplete: 0,  completed: false, dueDate: "2026-03-10" },
  ];

  d["Lindbergh::op-rounds"].activities = [
    { id: "c1", title: "Field crew training — session 1", pctComplete: 100, completed: true,  dueDate: "2026-01-20" },
    { id: "c2", title: "Field crew training — session 2", pctComplete: 100, completed: true,  dueDate: "2026-01-27" },
    { id: "c3", title: "Field crew training — session 3", pctComplete: 80,  completed: false, dueDate: "2026-02-03" },
    { id: "c4", title: "Supervisor sign-off",             pctComplete: 0,   completed: false, dueDate: "2026-02-15" },
  ];

  d["Meota::shift-logs"].activities = [
    { id: "d1", title: "Supervisor group training",   pctComplete: 100, completed: true,  dueDate: "2026-02-07" },
    { id: "d2", title: "Operators training — group A", pctComplete: 100, completed: true,  dueDate: "2026-02-14" },
    { id: "d3", title: "Operators training — group B", pctComplete: 40,  completed: false, dueDate: "2026-02-21" },
    { id: "d4", title: "Go-live readiness checklist", pctComplete: 0,   completed: false, dueDate: "2026-02-28" },
  ];

  d["Bodo-Cosine::shift-logs"].activities = [
    { id: "e1", title: "UAT scenario design",  pctComplete: 100, completed: true,  dueDate: "2026-01-25" },
    { id: "e2", title: "UAT execution",        pctComplete: 70,  completed: false, dueDate: "2026-02-08" },
    { id: "e3", title: "Defect resolution",    pctComplete: 20,  completed: false, dueDate: "2026-02-12" },
    { id: "e4", title: "Sign-off",             pctComplete: 0,   completed: false, dueDate: "2026-02-15" },
  ];

  d["Orion::shift-logs"].activities = [
    { id: "f1", title: "Go-live preparation",  pctComplete: 100, completed: true, dueDate: "2026-01-08" },
    { id: "f2", title: "Launch day support",   pctComplete: 100, completed: true, dueDate: "2026-01-10" },
    { id: "f3", title: "Week 1 monitoring",    pctComplete: 100, completed: true, dueDate: "2026-01-17" },
    { id: "f4", title: "Week 2 monitoring",    pctComplete: 60,  completed: false, dueDate: "2026-01-24" },
  ];

  d["Lindbergh::loto"].activities = [
    { id: "g1", title: "Requirements gathering",       pctComplete: 100, completed: true,  dueDate: "2026-02-15" },
    { id: "g2", title: "LOTO form design",             pctComplete: 60,  completed: false, dueDate: "2026-03-01" },
    { id: "g3", title: "System configuration",         pctComplete: 10,  completed: false, dueDate: "2026-03-15" },
    { id: "g4", title: "Integration testing",          pctComplete: 0,   completed: false, dueDate: "2026-03-25" },
    { id: "g5", title: "H&S team review & sign-off",   pctComplete: 0,   completed: false, dueDate: "2026-03-31" },
  ];

  d["Orion::carseals"].activities = [
    { id: "h1", title: "Equipment list import",   pctComplete: 60, completed: false, dueDate: "2026-02-28" },
    { id: "h2", title: "Form configuration",      pctComplete: 30, completed: false, dueDate: "2026-03-08" },
    { id: "h3", title: "Integration testing",     pctComplete: 0,  completed: false, dueDate: "2026-03-12" },
    { id: "h4", title: "Config sign-off",         pctComplete: 0,  completed: false, dueDate: "2026-03-15" },
  ];

  return d;
}

// ============================================================
// TIMELINE HELPERS
// ============================================================

const TL_START = new Date("2025-10-01");
const TL_END   = new Date("2026-11-30");
const TL_MS    = TL_END - TL_START;

function toPct(dateStr) {
  const d = new Date(dateStr);
  return Math.max(0, Math.min(100, ((d - TL_START) / TL_MS) * 100));
}

const MONTH_MARKS = ["2025-11-01","2026-01-01","2026-03-01","2026-05-01","2026-07-01","2026-09-01","2026-11-01"];
function monthLabel(iso) {
  const d = new Date(iso);
  return `${d.toLocaleString("default",{month:"short"})} '${d.getFullYear().toString().slice(2)}`;
}

// ============================================================
// SHARED UI COMPONENTS
// ============================================================

function RagDot({ rag, size = "w-2 h-2" }) {
  return <span className={`${size} rounded-full flex-shrink-0 inline-block ${RAG[rag]?.dot ?? "bg-slate-300"}`} />;
}

function StatusChip({ status }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs border ${STATUS_CLS[status]}`}>
      {status}
    </span>
  );
}

function ProgressBar({ pct, color = "bg-teal-500", height = "h-1.5" }) {
  return (
    <div className={`${height} bg-slate-100 rounded-full overflow-hidden`}>
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// Inline activity list shown in expanded rows
function ActivityList({ activities, onEdit }) {
  const today = new Date();
  if (!activities || activities.length === 0) {
    return (
      <div className="flex items-center gap-2 py-1 text-xs text-slate-400 italic">
        <Activity className="h-3 w-3" />
        No activities — open Edit to add some.
        <button onClick={onEdit} className="text-teal-600 hover:underline not-italic">Add activities</button>
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {activities.map(act => {
        const overdue = act.dueDate && new Date(act.dueDate) < today && !act.completed;
        const pct = act.completed ? 100 : act.pctComplete;
        return (
          <div key={act.id} className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${act.completed ? "bg-green-500" : "bg-slate-300"}`} />
            <span className={`flex-1 text-xs min-w-0 truncate ${act.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
              {act.title || <em className="text-slate-300">Untitled</em>}
            </span>
            <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
              <div className="flex-1">
                <ProgressBar pct={pct} color={act.completed ? "bg-green-500" : "bg-teal-400"} height="h-1" />
              </div>
              <span className="text-xs text-slate-400 w-7 text-right">{pct}%</span>
            </div>
            {act.dueDate && (
              <span className={`text-xs flex-shrink-0 ${overdue ? "text-red-500 font-medium" : "text-slate-400"}`}>
                {act.dueDate}{overdue && " ⚠"}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// EDIT MODAL — includes activity management
// ============================================================

function EditModal({ itemKey, items, onSave, onClose }) {
  const original = items[itemKey];
  const [site, mod] = itemKey.split("::");
  const modInfo = MODULES.find(m => m.id === mod);
  const [form, setForm] = useState({ ...original, activities: [...(original.activities ?? [])] });
  const today = new Date();

  const set = (field, value) =>
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === "status" && !prev.manualPct && (!prev.activities || prev.activities.length === 0))
        next.pctComplete = STATUS_PCT[value];
      return next;
    });

  // Activity helpers
  const addActivity = () =>
    setForm(prev => ({
      ...prev,
      activities: [...prev.activities, { id: newActivityId(), title: "", pctComplete: 0, completed: false, dueDate: "" }],
    }));

  const setAct = (i, field, value) =>
    setForm(prev => {
      const acts = prev.activities.map((a, idx) => {
        if (idx !== i) return a;
        const next = { ...a, [field]: value };
        if (field === "completed" && value) next.pctComplete = 100;
        if (field === "pctComplete") next.completed = value === 100;
        return next;
      });
      return { ...prev, activities: acts };
    });

  const removeActivity = i =>
    setForm(prev => ({ ...prev, activities: prev.activities.filter((_, idx) => idx !== i) }));

  const hasActivities = form.activities.length > 0;
  const rollupPct = hasActivities
    ? Math.round(form.activities.reduce((s, a) => s + (a.completed ? 100 : a.pctComplete), 0) / form.activities.length)
    : form.pctComplete;

  const handleSave = () => {
    const effective = hasActivities ? rollupPct : form.pctComplete;
    onSave(itemKey, { ...form, pctComplete: effective });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <p className="font-semibold text-slate-800">{site} — {modInfo?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">Edit rollout item</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => set("status", s)}
                  className={`px-2.5 py-1 rounded text-xs border transition-all ${STATUS_CLS[s]} ${form.status === s ? "ring-2 ring-offset-1 ring-blue-400 font-medium" : "opacity-50 hover:opacity-80"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* RAG */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">RAG Status</p>
            <div className="flex gap-2">
              {["Green","Amber","Red"].map(r => (
                <button key={r} onClick={() => set("rag", r)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-all ${
                    form.rag === r ? `${RAG[r].light} ${RAG[r].border} font-medium ring-2 ring-offset-1 ${RAG[r].ring}` : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}>
                  <RagDot rag={r} size="w-3 h-3" /> {r}
                </button>
              ))}
            </div>
          </div>

          {/* % Complete — slider when no activities, rollup badge when activities exist */}
          {hasActivities ? (
            <div className="rounded-lg bg-teal-50 border border-teal-200 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-teal-800">Progress (rolled up from activities)</p>
                <span className="text-lg font-bold text-teal-700">{rollupPct}%</span>
              </div>
              <ProgressBar pct={rollupPct} />
              <p className="text-xs text-teal-600 mt-1.5">{form.activities.filter(a => a.completed).length} of {form.activities.length} activities complete</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-slate-600">% Complete</p>
                <button onClick={() => { set("manualPct", false); set("pctComplete", STATUS_PCT[form.status]); }}
                  className="text-xs text-teal-600 hover:underline">Reset to status</button>
              </div>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="100" value={form.pctComplete}
                  onChange={e => { set("manualPct", true); set("pctComplete", Number(e.target.value)); }}
                  className="flex-1 accent-teal-600" />
                <span className="text-sm font-semibold text-slate-700 w-10 text-right">{form.pctComplete}%</span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-slate-600 mb-1.5">Target Go-Live</p>
              <input type="date" value={form.targetGoLive} onChange={e => set("targetGoLive", e.target.value)}
                className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm" />
            </div>
            {["Go-Live","Complete"].includes(form.status) && (
              <div>
                <p className="text-xs font-medium text-slate-600 mb-1.5">Actual Go-Live</p>
                <input type="date" value={form.actualGoLive} onChange={e => set("actualGoLive", e.target.value)}
                  className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm" />
              </div>
            )}
          </div>

          {/* Owner */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1.5">Owner / Lead</p>
            <input type="text" value={form.owner} onChange={e => set("owner", e.target.value)}
              placeholder="Name" className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm" />
          </div>

          {/* Notes */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1.5">Notes</p>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Progress notes..." rows={2}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm resize-none" />
          </div>

          {/* Blockers */}
          <div>
            <p className="text-xs font-medium text-slate-600 mb-1.5">
              <span className="text-red-600">Blockers</span> <span className="font-normal text-slate-400">(optional)</span>
            </p>
            <textarea value={form.blockers} onChange={e => set("blockers", e.target.value)}
              placeholder="Describe any blockers or risks..." rows={2}
              className="w-full border border-slate-200 rounded px-3 py-1.5 text-sm resize-none" />
          </div>

          {/* ── ACTIVITIES ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-slate-500" />
                <p className="text-xs font-medium text-slate-700">Activities</p>
                {hasActivities && (
                  <span className="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                    {form.activities.filter(a => a.completed).length}/{form.activities.length}
                  </span>
                )}
              </div>
              <button onClick={addActivity}
                className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium">
                <Plus className="h-3.5 w-3.5" /> Add activity
              </button>
            </div>

            {!hasActivities && (
              <p className="text-xs text-slate-400 italic border border-dashed border-slate-200 rounded-lg px-4 py-3 text-center">
                No activities yet. Activities let you track granular work items and roll up progress automatically.
              </p>
            )}

            <div className="space-y-2">
              {form.activities.map((act, i) => {
                const overdue = act.dueDate && new Date(act.dueDate) < today && !act.completed;
                return (
                  <div key={act.id} className={`rounded-lg border p-3 space-y-2.5 transition-colors ${act.completed ? "border-green-200 bg-green-50/40" : overdue ? "border-red-200 bg-red-50/30" : "border-slate-200 bg-slate-50/50"}`}>
                    {/* Title row */}
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={act.completed}
                        onChange={e => setAct(i, "completed", e.target.checked)}
                        className="accent-teal-600 flex-shrink-0 w-3.5 h-3.5" />
                      <input type="text" value={act.title}
                        onChange={e => setAct(i, "title", e.target.value)}
                        placeholder="Activity name"
                        className={`flex-1 bg-transparent border-0 border-b text-xs py-0.5 focus:outline-none focus:border-teal-400 ${act.completed ? "line-through text-slate-400 border-slate-200" : "text-slate-700 border-slate-300"}`} />
                      <button onClick={() => removeActivity(i)} className="text-slate-300 hover:text-red-500 flex-shrink-0">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Progress row */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <ProgressBar pct={act.completed ? 100 : act.pctComplete}
                          color={act.completed ? "bg-green-500" : "bg-teal-500"} />
                      </div>
                      <input type="number" min="0" max="100"
                        value={act.completed ? 100 : act.pctComplete}
                        disabled={act.completed}
                        onChange={e => setAct(i, "pctComplete", Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-14 border border-slate-200 rounded px-2 py-0.5 text-xs text-right disabled:bg-slate-50 disabled:text-slate-400" />
                      <span className="text-xs text-slate-400">%</span>
                    </div>

                    {/* Deadline row */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Deadline</span>
                      <input type="date" value={act.dueDate}
                        onChange={e => setAct(i, "dueDate", e.target.value)}
                        className={`border rounded px-2 py-0.5 text-xs ${overdue ? "border-red-300 text-red-600" : "border-slate-200 text-slate-700"}`} />
                      {overdue && <span className="text-xs text-red-500">Overdue</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50 rounded-b-xl sticky bottom-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-white">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-md hover:bg-slate-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY VIEW
// ============================================================

function SummaryView({ items }) {
  const today = new Date();
  const all = Object.values(items);
  const total   = all.length;
  const avgPct  = Math.round(all.reduce((s, i) => s + activityPct(i), 0) / total);
  const live    = all.filter(i => ["Go-Live","Complete"].includes(i.status)).length;
  const reds    = all.filter(i => i.rag === "Red").length;
  const overdue = all.filter(i => i.targetGoLive && new Date(i.targetGoLive) < today && i.status !== "Complete").length;

  const buStats = BUSINESS_UNITS.map(bu => {
    const bi = all.filter(i => bu.sites.includes(i.site));
    const avg = bi.length ? Math.round(bi.reduce((s,i) => s + activityPct(i), 0) / bi.length) : 0;
    return { ...bu, avg, count: bi.length };
  });

  const modStats = MODULES.map(m => {
    const mi = all.filter(i => i.mod === m.id);
    const avg = mi.length ? Math.round(mi.reduce((s,i) => s + activityPct(i), 0) / mi.length) : 0;
    return { ...m, avg, count: mi.length };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Total In-Scope Items", value: total,       icon: <Target className="h-5 w-5 text-slate-400" />,        cls: "bg-white border-slate-200" },
          { label: "Overall % Complete",   value: `${avgPct}%`,icon: <TrendingUp className="h-5 w-5 text-teal-500" />,     cls: "bg-teal-50 border-teal-200" },
          { label: "Go-Live or Complete",  value: live,        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,  cls: "bg-green-50 border-green-200" },
          { label: "Flagged Red",          value: reds,        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,   cls: reds > 0 ? "bg-red-50 border-red-200" : "bg-white border-slate-200" },
          { label: "Overdue",              value: overdue,     icon: <Clock className="h-5 w-5 text-amber-500" />,         cls: overdue > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200" },
        ].map(({ label, value, icon, cls }) => (
          <div key={label} className={`rounded-lg border p-4 ${cls}`}>
            <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs text-slate-500">{label}</span></div>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        {buStats.map(bu => (
          <div key={bu.id} className="bg-white rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-700 leading-tight">{bu.name}</p>
            <p className="text-xs text-slate-400 mb-2">{bu.count} items</p>
            <ResponsiveContainer width="100%" height={110}>
              <PieChart>
                <Pie data={[{v:bu.avg},{v:100-bu.avg}]} dataKey="v" cx="50%" cy="50%"
                  innerRadius={32} outerRadius={46} startAngle={90} endAngle={-270}>
                  <Cell fill="#0d9488" /><Cell fill="#e2e8f0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <p className="text-center text-2xl font-bold text-slate-800 -mt-2">{bu.avg}%</p>
          </div>
        ))}

        <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-700 mb-4">Completion by Module</p>
          <div className="space-y-3">
            {modStats.map(m => (
              <div key={m.id}>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>{m.short}</span>
                  <span className="text-slate-400">{m.count} sites · {m.avg}%</span>
                </div>
                <ProgressBar pct={m.avg} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MATRIX VIEW
// ============================================================

function MatrixView({ items, onEdit }) {
  const [collapsed, setCollapsed] = useState({});
  const today = new Date();

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
      <table className="w-full text-xs min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left px-3 py-2.5 font-medium text-slate-600 w-36">Site</th>
            {MODULES.map(m => (
              <th key={m.id} className="text-center px-1 py-2.5 font-medium text-slate-600 min-w-[100px]">{m.short}</th>
            ))}
            <th className="text-right px-3 py-2.5 font-medium text-slate-600 w-20">Avg %</th>
          </tr>
        </thead>
        <tbody>
          {BUSINESS_UNITS.map(bu => {
            const buItems = bu.sites.flatMap(s => MODULES.filter(m => inScope(s,m.id)).map(m => items[`${s}::${m.id}`])).filter(Boolean);
            const buAvg = buItems.length ? Math.round(buItems.reduce((s,i) => s + activityPct(i), 0) / buItems.length) : 0;
            const isOpen = !collapsed[bu.id];

            return (
              <React.Fragment key={bu.id}>
                <tr className="bg-slate-800 cursor-pointer select-none" onClick={() => setCollapsed(p => ({ ...p, [bu.id]: !p[bu.id] }))}>
                  <td colSpan={9} className="px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isOpen ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-400" />}
                        <span className="text-xs font-semibold text-white">{bu.name}</span>
                        <span className="text-xs text-slate-400">{bu.province} · {bu.sites.length} sites</span>
                      </div>
                      <span className="text-xs text-slate-300">{buAvg}% avg</span>
                    </div>
                  </td>
                </tr>

                {isOpen && bu.sites.map((site, si) => {
                  const siteItems = MODULES.filter(m => inScope(site,m.id)).map(m => items[`${site}::${m.id}`]).filter(Boolean);
                  const siteAvg = siteItems.length ? Math.round(siteItems.reduce((s,i) => s + activityPct(i), 0) / siteItems.length) : 0;
                  return (
                    <tr key={site} className={`border-b border-slate-100 ${si % 2 === 0 ? "bg-white" : "bg-slate-50/60"}`}>
                      <td className="px-3 py-2 font-medium text-slate-700">{site}</td>
                      {MODULES.map(m => {
                        if (!inScope(site, m.id)) return <td key={m.id} className="px-1 py-2 text-center"><span className="text-slate-200">N/A</span></td>;
                        const item = items[`${site}::${m.id}`];
                        if (!item) return <td key={m.id} />;
                        const overdue = item.targetGoLive && new Date(item.targetGoLive) < today && item.status !== "Complete";
                        const hasActs = item.activities?.length > 0;
                        return (
                          <td key={m.id} className="px-1 py-1.5 text-center">
                            <button onClick={() => onEdit(`${site}::${m.id}`)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs transition-all hover:shadow-sm ${STATUS_CLS[item.status]} ${overdue ? "ring-1 ring-red-400" : ""}`}>
                              <RagDot rag={item.rag} size="w-1.5 h-1.5" />
                              {item.status === "Not Started" ? "—" : item.status}
                              {hasActs && <Activity className="h-2.5 w-2.5 ml-0.5 opacity-50" />}
                            </button>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-right font-medium text-slate-600">{siteAvg}%</td>
                    </tr>
                  );
                })}

                {isOpen && (
                  <tr className="border-b-2 border-slate-200 bg-slate-50">
                    <td className="px-3 py-1.5 text-slate-400 italic">Subtotal</td>
                    {MODULES.map(m => {
                      const mi = bu.sites.filter(s => inScope(s,m.id)).map(s => items[`${s}::${m.id}`]).filter(Boolean);
                      const avg = mi.length ? Math.round(mi.reduce((s,i) => s + activityPct(i), 0) / mi.length) : null;
                      return <td key={m.id} className="px-1 py-1.5 text-center text-slate-400">{avg !== null ? `${avg}%` : "—"}</td>;
                    })}
                    <td className="px-3 py-1.5 text-right font-semibold text-slate-600">{buAvg}%</td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================
// MODULE VIEW
// ============================================================

function ModuleView({ items, onEdit }) {
  const [selMod, setSelMod] = useState("shift-logs");
  const [expanded, setExpanded] = useState(new Set());
  const today = new Date();
  const selModInfo = MODULES.find(m => m.id === selMod);

  const toggle = key => setExpanded(prev => { const n = new Set(prev); if (n.has(key)) { n.delete(key); } else { n.add(key); } return n; });

  const rows = BUSINESS_UNITS.flatMap(bu =>
    bu.sites.filter(s => inScope(s, selMod)).map(s => ({ site: s, bu: bu.name, item: items[`${s}::${selMod}`] }))
  ).filter(r => r.item);

  const avg = rows.length ? Math.round(rows.reduce((s,r) => s + activityPct(r.item), 0) / rows.length) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Module View</h2>
        <select value={selMod} onChange={e => { setSelMod(e.target.value); setExpanded(new Set()); }}
          className="border border-slate-200 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700">
          {MODULES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-800">{selModInfo.name}</h3>
            <p className="text-xs text-slate-500">{rows.length} applicable sites</p>
          </div>
          <div className="flex gap-4 text-sm text-slate-500">
            <span>{rows.filter(r => r.item.status === "Complete").length} complete</span>
            <span className="text-red-600">{rows.filter(r => r.item.rag === "Red").length} red</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Overall Progress</span><span>{avg}%</span></div>
        <ProgressBar pct={avg} />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs">
              <th className="w-8" />
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Site</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">BU</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">RAG</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Owner</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Target</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600 w-36">Progress</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ site, bu, item }) => {
              const key = `${site}::${selMod}`;
              const overdue = item.targetGoLive && new Date(item.targetGoLive) < today && item.status !== "Complete";
              const pct = activityPct(item);
              const hasActs = item.activities?.length > 0;
              const isExpanded = expanded.has(key);

              return (
                <React.Fragment key={key}>
                  <tr className={`border-b border-slate-100 hover:bg-slate-50 ${isExpanded ? "bg-slate-50" : ""}`}>
                    <td className="pl-2 py-2.5 text-center">
                      <button onClick={() => toggle(key)} className="text-slate-400 hover:text-slate-600 p-0.5 rounded">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{site}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-xs">{bu}</td>
                    <td className="px-4 py-2.5"><StatusChip status={item.status} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5"><RagDot rag={item.rag} size="w-2.5 h-2.5" /><span className={`text-xs ${RAG[item.rag].text}`}>{item.rag}</span></div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 text-xs">{item.owner || "—"}</td>
                    <td className={`px-4 py-2.5 text-xs ${overdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
                      {item.targetGoLive || "—"}{overdue && " ⚠"}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><ProgressBar pct={pct} /></div>
                        <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                        {hasActs && <Activity className="h-3 w-3 text-slate-400" title={`${item.activities.length} activities`} />}
                      </div>
                    </td>
                    <td className="pr-3 py-2.5">
                      <button onClick={() => onEdit(key)} className="text-slate-300 hover:text-slate-600"><Edit3 className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <td colSpan={9} className="px-4 pb-3 pt-1">
                        <div className="ml-6 pl-4 border-l-2 border-slate-200">
                          <ActivityList activities={item.activities} onEdit={() => onEdit(key)} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// SITE VIEW
// ============================================================

function SiteView({ items, onEdit }) {
  const [selSite, setSelSite] = useState("Lindbergh");
  const [expanded, setExpanded] = useState(new Set());
  const today = new Date();
  const bu = BUSINESS_UNITS.find(b => b.sites.includes(selSite));

  const toggle = key => setExpanded(prev => { const n = new Set(prev); if (n.has(key)) { n.delete(key); } else { n.add(key); } return n; });

  const rows = MODULES.filter(m => inScope(selSite, m.id)).map(m => ({ module: m, item: items[`${selSite}::${m.id}`] })).filter(r => r.item);
  const oos  = MODULES.filter(m => !inScope(selSite, m.id));
  const avg  = rows.length ? Math.round(rows.reduce((s,r) => s + activityPct(r.item), 0) / rows.length) : 0;
  const blockers = rows.filter(r => r.item.blockers);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Site View</h2>
        <select value={selSite} onChange={e => { setSelSite(e.target.value); setExpanded(new Set()); }}
          className="border border-slate-200 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700">
          {BUSINESS_UNITS.map(b => (
            <optgroup key={b.id} label={b.name}>
              {b.sites.map(s => <option key={s} value={s}>{s}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-800">{selSite}</h3>
            <p className="text-xs text-slate-500">{bu?.name} · {rows.length} modules in scope</p>
          </div>
          <div className="flex gap-4 text-sm text-slate-500">
            <span>{rows.filter(r => r.item.status === "Complete").length}/{rows.length} complete</span>
            {rows.filter(r => r.item.rag === "Red").length > 0 && (
              <span className="text-red-600">{rows.filter(r => r.item.rag === "Red").length} red</span>
            )}
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Site Progress</span><span>{avg}%</span></div>
        <ProgressBar pct={avg} />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs">
              <th className="w-8" />
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Module</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">RAG</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Owner</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Target</th>
              <th className="text-left px-4 py-2.5 font-medium text-slate-600 w-36">Progress</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map(({ module, item }) => {
              const key = `${selSite}::${module.id}`;
              const overdue = item.targetGoLive && new Date(item.targetGoLive) < today && item.status !== "Complete";
              const pct = activityPct(item);
              const hasActs = item.activities?.length > 0;
              const isExpanded = expanded.has(key);

              return (
                <React.Fragment key={key}>
                  <tr className={`border-b border-slate-100 hover:bg-slate-50 ${isExpanded ? "bg-slate-50" : ""}`}>
                    <td className="pl-2 py-2.5 text-center">
                      <button onClick={() => toggle(key)} className="text-slate-400 hover:text-slate-600 p-0.5 rounded">
                        {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 font-medium text-slate-700">{module.name}</td>
                    <td className="px-4 py-2.5"><StatusChip status={item.status} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5"><RagDot rag={item.rag} size="w-2.5 h-2.5" /><span className={`text-xs ${RAG[item.rag].text}`}>{item.rag}</span></div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 text-xs">{item.owner || "—"}</td>
                    <td className={`px-4 py-2.5 text-xs ${overdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
                      {item.targetGoLive || "—"}{overdue && " ⚠"}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><ProgressBar pct={pct} /></div>
                        <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
                        {hasActs && <Activity className="h-3 w-3 text-slate-400" title={`${item.activities.length} activities`} />}
                      </div>
                    </td>
                    <td className="pr-3 py-2.5">
                      <button onClick={() => onEdit(key)} className="text-slate-300 hover:text-slate-600"><Edit3 className="h-3.5 w-3.5" /></button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <td colSpan={8} className="px-4 pb-3 pt-1">
                        <div className="ml-6 pl-4 border-l-2 border-slate-200">
                          <ActivityList activities={item.activities} onEdit={() => onEdit(key)} />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {oos.map(m => (
              <tr key={m.id} className="border-b border-slate-100 bg-slate-50/40">
                <td className="pl-2 py-2" />
                <td className="px-4 py-2 text-slate-300">{m.name}</td>
                <td colSpan={6} className="px-4 py-2 text-xs text-slate-300 italic">Not applicable for this site</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-4 w-4" /> Active Blockers
          </h4>
          <ul className="space-y-1.5">
            {blockers.map(({ module, item }) => (
              <li key={module.id} className="text-sm text-red-700">
                <span className="font-medium">{module.short}:</span> {item.blockers}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// TIMELINE VIEW
// ============================================================

function TimelineView({ items, onEdit }) {
  const today = new Date();
  const todayPct = toPct(today.toISOString());

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-4 h-2 bg-slate-300 rounded inline-block opacity-40" /> Track</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-2 bg-teal-500 rounded inline-block" /> Progress</span>
        <span className="flex items-center gap-1.5"><span className="w-px h-4 bg-blue-500 inline-block" /> Today</span>
        <span className="flex items-center gap-1.5"><span className="w-px h-4 bg-slate-500 inline-block" /> Target date</span>
      </div>

      {BUSINESS_UNITS.map(bu => {
        const rows = bu.sites.flatMap(site =>
          MODULES.filter(m => inScope(site, m.id) && items[`${site}::${m.id}`]?.targetGoLive).map(m => ({
            key: `${site}::${m.id}`, site, module: m, item: items[`${site}::${m.id}`],
          }))
        );

        return (
          <div key={bu.id}>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{bu.name}</h3>
            <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-x-auto">
              <div className="flex mb-3 min-w-[640px]">
                <div className="w-44 flex-shrink-0" />
                <div className="flex-1 relative h-4">
                  {MONTH_MARKS.map(iso => (
                    <div key={iso} className="absolute text-xs text-slate-400" style={{ left: `${toPct(iso)}%`, transform: "translateX(-50%)" }}>
                      {monthLabel(iso)}
                    </div>
                  ))}
                  <div className="absolute top-0 h-full w-px bg-blue-400 opacity-50" style={{ left: `${todayPct}%` }} />
                </div>
              </div>

              <div className="space-y-1.5 min-w-[640px]">
                {rows.map(({ key, site, module, item }) => {
                  const pct = activityPct(item);
                  const targetPct = toPct(item.targetGoLive);
                  const si = STATUS_OPTIONS.indexOf(item.status);
                  const estDays = Math.max(30, 110 - si * 14);
                  const startPct = toPct(new Date(new Date(item.targetGoLive) - estDays * 86400000).toISOString());
                  const trackW = Math.max(1, targetPct - startPct);
                  const fillW = trackW * pct / 100;
                  const overdue = new Date(item.targetGoLive) < today && item.status !== "Complete";
                  const barColor = overdue ? "bg-red-500" : item.rag === "Red" ? "bg-red-500" : item.rag === "Amber" ? "bg-amber-500" : "bg-teal-500";

                  return (
                    <div key={key} className="flex items-center h-6">
                      <div className="w-44 flex-shrink-0 flex justify-between items-center pr-3">
                        <span className="text-xs font-medium text-slate-700 truncate">{site}</span>
                        <span className="text-xs text-slate-400 ml-1 flex-shrink-0">{module.short}</span>
                      </div>
                      <div className="flex-1 relative h-5 cursor-pointer hover:opacity-80" onClick={() => onEdit(key)}>
                        <div className="absolute top-0 h-full w-px bg-blue-400 z-10 opacity-60" style={{ left: `${todayPct}%` }} />
                        <div className="absolute h-3 top-1 rounded bg-slate-300 opacity-30" style={{ left: `${startPct}%`, width: `${trackW}%` }} />
                        <div className={`absolute h-3 top-1 rounded ${barColor}`} style={{ left: `${startPct}%`, width: `${fillW}%` }} />
                        <div className={`absolute top-0 h-5 w-px ${overdue ? "bg-red-600" : "bg-slate-500"}`} style={{ left: `${targetPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// MAIN
// ============================================================

const NAV = [
  { id: "summary",  label: "Summary",     icon: LayoutDashboard },
  { id: "matrix",   label: "Matrix View", icon: Grid3X3 },
  { id: "module",   label: "Module View", icon: Layers },
  { id: "site",     label: "Site View",   icon: MapPin },
  { id: "timeline", label: "Timeline",    icon: GanttChart },
];

export default function RolloutDashboard() {
  const [items, setItems]   = useState(null);
  const [view, setView]     = useState("summary");
  const [editing, setEditing] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetch("/api/rollout")
      .then(r => r.json())
      .then(data => {
        if (Object.keys(data).length === 0) {
          // DB is empty — seed it from the hardcoded data
          setSeeding(true);
          const seed = createSeedData();
          fetch("/api/rollout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(seed),
          }).then(() => {
            setItems(seed);
            setSeeding(false);
          });
        } else {
          setItems(data);
        }
      });
  }, []);

  const updateItem = (key, updates) => {
    const next = { ...items[key], ...updates };
    setItems(prev => ({ ...prev, [key]: next }));
    fetch(`/api/rollout/${encodeURIComponent(key)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  };

  if (!items) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">{seeding ? "Initializing data…" : "Loading…"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <aside className="w-52 bg-slate-900 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-slate-700/60">
          <p className="text-xs font-bold text-white tracking-wide">STRATHCONA RESOURCES</p>
          <p className="text-xs text-slate-400 mt-0.5">Digitization Rollout Tracker</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setView(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                view === id ? "bg-teal-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}>
              <Icon className="h-4 w-4 flex-shrink-0" />{label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700/60 space-y-0.5">
          <p className="text-xs text-slate-500">3 Business Units · 16 Sites</p>
          <p className="text-xs text-slate-500">7 Modules · 91 In-Scope Items</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex-shrink-0">
          <p className="font-semibold text-slate-800 text-sm">{NAV.find(n => n.id === view)?.label}</p>
          <p className="text-xs text-slate-400">Operational Digitization Program · FY2026</p>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {view === "summary"  && <SummaryView  items={items} />}
          {view === "matrix"   && <MatrixView   items={items} onEdit={setEditing} />}
          {view === "module"   && <ModuleView   items={items} onEdit={setEditing} />}
          {view === "site"     && <SiteView     items={items} onEdit={setEditing} />}
          {view === "timeline" && <TimelineView items={items} onEdit={setEditing} />}
        </main>
      </div>

      {editing && (
        <EditModal itemKey={editing} items={items} onSave={updateItem} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}
