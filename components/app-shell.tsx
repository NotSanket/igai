"use client";

import {
  BarChart3,
  Bell,
  ChevronRight,
  CircleGauge,
  FlaskConical,
  HandCoins,
  Landmark,
  LogOut,
  Map,
  Menu,
  Send,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";

import { logout } from "@/app/actions/auth";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Profile, UserRole } from "@/types/database";

const corporateNav = [
  { label: "Overview", href: "/dashboard", icon: CircleGauge },
  { label: "Proposals", href: "/proposals", icon: BarChart3 },
  { label: "Optimize", href: "/optimizer", icon: Sparkles },
  { label: "₹1 Crore Challenge", href: "/challenge", icon: Target },
  { label: "Scenario Lab", href: "/scenario-lab", icon: FlaskConical },
  { label: "Impact Map", href: "/impact-map", icon: Map },
];

const ngoNav = [
  { label: "Overview", href: "/ngo/dashboard", icon: CircleGauge },
  { label: "Submit Proposal", href: "/ngo/proposals/new", icon: Send },
  { label: "My Proposals", href: "/ngo/proposals", icon: HandCoins },
];

interface AppShellProps {
  profile: Profile;
  role: UserRole;
  pageTitle: string;
  children: ReactNode;
}

export function AppShell({ profile, role, pageTitle, children }: AppShellProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigation = role === "corporate" ? corporateNav : ngoNav;
  const name = profile.full_name ?? profile.email ?? "IGAI user";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-slate-950">
      {open ? (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col border-r border-white/8 bg-[#081613] text-white transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/8 px-6">
          <Link href={role === "corporate" ? "/dashboard" : "/ngo/dashboard"} className="group flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-300 transition group-hover:rotate-3">
              <Landmark className="size-5" />
            </span>
            <span>
              <span className="block text-lg font-bold tracking-[0.18em]">IGAI</span>
              <span className="block text-[10px] font-medium tracking-[0.16em] text-slate-400 uppercase">Impact Intelligence</span>
            </span>
          </Link>
          <button aria-label="Close menu" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden">
            <X className="size-5" />
          </button>
        </div>

        <div className="px-4 pt-6">
          <p className="px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">Workspace</p>
          <nav className="mt-3 space-y-1" aria-label={`${role} navigation`}>
            {navigation.map((item) => {
              const active = pathname === item.href.split("?")[0];
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-white/9 text-white shadow-inner"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                  )}
                >
                  {active ? <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-emerald-400" /> : null}
                  <Icon className={cn("size-[18px] transition-transform group-hover:scale-105", active && "text-emerald-300")} />
                  <span>{item.label}</span>
                  {active ? <ChevronRight className="ml-auto size-3.5 text-slate-500" /> : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/8 p-4">
          <div className="rounded-xl bg-white/[0.04] p-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-300 text-xs font-bold text-emerald-950">{initials}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{profile.organization_name ?? name}</p>
                <p className="truncate text-xs text-slate-500">{name}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300 uppercase">{role}</Badge>
              <form action={logout}>
                <button type="submit" aria-label="Log out" className="rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white">
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[286px]">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200/80 bg-[#f5f7f6]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
          <button aria-label="Open navigation" onClick={() => setOpen(true)} className="mr-4 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm lg:hidden">
            <Menu className="size-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
              <span>Impact intelligence</span><ChevronRight className="size-3" />
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-slate-800">{pageTitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.14)]" /> System ready
            </div>
            <button aria-label="Notifications" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:text-slate-950">
              <Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-amber-500" />
            </button>
            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <div className="text-right"><p className="max-w-36 truncate text-xs font-semibold text-slate-800">{name}</p><p className="text-[11px] text-slate-500">{role === "corporate" ? "CSR decision maker" : "NGO partner"}</p></div>
              <span className="grid size-9 place-items-center rounded-xl bg-slate-900 text-xs font-bold text-white">{initials}</span>
            </div>
          </div>
        </header>
        <div className="dashboard-grid min-h-[calc(100vh-5rem)] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
