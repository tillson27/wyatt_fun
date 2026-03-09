"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  BarChart3,
  MapPin,
  Calendar,
  Grid3X3,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/meetings", label: "Meetings", icon: MessageSquare },
  { href: "/summaries/daily", label: "Daily Summary", icon: Calendar },
  { href: "/summaries/weekly", label: "Weekly Summary", icon: BarChart3 },
  { href: "/sites", label: "Sites", icon: MapPin },
  { href: "/rollout", label: "Rollout Dashboard", icon: Grid3X3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-slate-50 min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-lg font-bold text-slate-900">SAGD Tracker</h1>
        <p className="text-xs text-slate-500">Project Implementation</p>
      </div>
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="text-xs text-slate-400 pt-4 border-t">
        16 Sites &middot; 2 Vendors &middot; 6 Streams
      </div>
    </aside>
  );
}
