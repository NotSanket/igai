"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardCard } from "@/components/dashboard-ui";
import type { ScoredProject } from "@/lib/optimizer/types";
import { formatCurrency } from "@/lib/proposals/format";

const tooltipStyle = { border: "1px solid #dbe4e1", borderRadius: "12px", boxShadow: "0 16px 34px rgba(15,23,42,.12)", fontSize: "12px" };

function ChartTitle({ title, detail }: { title: string; detail: string }) {
  return <div><div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-500" /><h3 className="font-bold text-slate-950">{title}</h3></div><p className="mt-1 pl-3.5 text-xs text-slate-500">{detail}</p></div>;
}

function EmptyChart() {
  return <div className="mt-5 grid h-60 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-400">No mapped proposals match these filters.</div>;
}

export function ImpactMapCharts({ projects }: { projects: ScoredProject[] }) {
  const districtData = Object.values(projects.reduce<Record<string, { district: string; funding: number; beneficiaries: number }>>((totals, { proposal }) => {
    const current = totals[proposal.district] ?? { district: proposal.district, funding: 0, beneficiaries: 0 };
    totals[proposal.district] = {
      district: proposal.district,
      funding: current.funding + proposal.requested_amount,
      beneficiaries: current.beneficiaries + proposal.beneficiaries,
    };
    return totals;
  }, {}));
  const funding = [...districtData].sort((a, b) => b.funding - a.funding).slice(0, 10);
  const beneficiaries = [...districtData].sort((a, b) => b.beneficiaries - a.beneficiaries).slice(0, 10);
  const sectors = Object.entries(projects.reduce<Record<string, number>>((totals, { proposal }) => {
    totals[proposal.sector] = (totals[proposal.sector] ?? 0) + 1;
    return totals;
  }, {})).map(([sector, count]) => ({ sector, count })).sort((a, b) => b.count - a.count);

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6">
        <ChartTitle title="Funding by district" detail="Top visible districts by requested capital" />
        {funding.length ? <div className="mt-5 h-72" role="img" aria-label="Bar chart of requested funding by district"><ResponsiveContainer width="100%" height="100%"><BarChart data={funding} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid horizontal={false} stroke="#edf1f0" strokeDasharray="3 4" /><XAxis type="number" tickFormatter={(value) => `₹${Math.round(Number(value) / 100000)}L`} tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="district" width={82} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f2f7f5" }} contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), "Requested"]} /><Bar dataKey="funding" fill="#0f766e" radius={[0, 5, 5, 0]} maxBarSize={18} animationDuration={520} /></BarChart></ResponsiveContainer></div> : <EmptyChart />}
      </DashboardCard>
      <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6">
        <ChartTitle title="Beneficiaries by district" detail="Top visible districts by direct reach" />
        {beneficiaries.length ? <div className="mt-5 h-72" role="img" aria-label="Bar chart of beneficiaries by district"><ResponsiveContainer width="100%" height="100%"><BarChart data={beneficiaries} layout="vertical" margin={{ left: 4, right: 12 }}><CartesianGrid horizontal={false} stroke="#edf1f0" strokeDasharray="3 4" /><XAxis type="number" tickFormatter={(value) => Number(value).toLocaleString("en-IN")} tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="district" width={82} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f2f7f5" }} contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString("en-IN"), "Beneficiaries"]} /><Bar dataKey="beneficiaries" fill="#0369a1" radius={[0, 5, 5, 0]} maxBarSize={18} animationDuration={520} /></BarChart></ResponsiveContainer></div> : <EmptyChart />}
      </DashboardCard>
      <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6">
        <ChartTitle title="Projects by sector" detail="Visible portfolio composition" />
        {sectors.length ? <div className="mt-5 h-72" role="img" aria-label="Bar chart of projects by sector"><ResponsiveContainer width="100%" height="100%"><BarChart data={sectors} margin={{ left: -25, right: 4, bottom: 52 }}><CartesianGrid vertical={false} stroke="#edf1f0" strokeDasharray="3 4" /><XAxis dataKey="sector" interval={0} angle={-28} textAnchor="end" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f2f7f5" }} contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString("en-IN"), "Projects"]} /><Bar dataKey="count" fill="#334155" radius={[5, 5, 0, 0]} maxBarSize={28} animationDuration={520} /></BarChart></ResponsiveContainer></div> : <EmptyChart />}
      </DashboardCard>
    </div>
  );
}
