import { ArrowUpRight, Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProposalStatus } from "@/types/database";

export function DashboardCard({ className, children, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn("animate-rise overflow-hidden", className)} {...props}>{children}</Card>;
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>{eyebrow ? <p className="mb-1 text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">{eyebrow}</p> : null}<h2 className="text-lg font-bold tracking-tight text-slate-950">{title}</h2></div>
      {action}
    </div>
  );
}

export function MetricCard({ label, value, context, trend, icon: Icon, index = 0 }: { label: string; value: string; context: string; trend?: string; icon: LucideIcon; index?: number }) {
  return (
    <Card style={{ animationDelay: `${index * 70}ms` }} className="metric-card animate-rise group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,.08)] sm:p-6">
      <div className="absolute right-0 top-0 h-20 w-20 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,.12),transparent_68%)]" />
      <div className="flex items-start justify-between"><p className="text-[10px] font-bold tracking-[0.18em] text-slate-500 uppercase">{label}</p><span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-700 transition duration-300 group-hover:-rotate-3 group-hover:bg-emerald-50 group-hover:text-emerald-700"><Icon className="size-[18px]" /></span></div>
      <p className="mt-7 text-3xl font-bold tracking-[-0.04em] text-slate-950 xl:text-4xl">{value}</p>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-xs leading-5 text-slate-500">{context}</p>{trend ? <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-emerald-700"><ArrowUpRight className="size-3" />{trend}</span> : null}</div>
    </Card>
  );
}

const statusStyles: Record<ProposalStatus, string> = {
  draft: "border-slate-200 bg-slate-50 text-slate-600",
  submitted: "border-sky-200 bg-sky-50 text-sky-700",
  under_review: "border-amber-200 bg-amber-50 text-amber-700",
  selected: "border-emerald-200 bg-emerald-50 text-emerald-700",
  deferred: "border-rose-200 bg-rose-50 text-rose-700",
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return <Badge className={statusStyles[status]}><span className="mr-1.5 size-1.5 rounded-full bg-current opacity-70" />{status.replace("_", " ")}</Badge>;
}

export function EmptyState({ title = "Nothing here yet", description, action }: { title?: string; description: string; action?: ReactNode }) {
  return <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Inbox className="size-5" /></span><h3 className="mt-4 font-bold text-slate-900">{title}</h3><p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div></div>;
}
