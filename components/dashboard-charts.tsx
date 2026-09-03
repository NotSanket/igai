"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardCard } from "@/components/dashboard-ui";
const tooltipStyle = { border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 14px 30px rgba(15,23,42,.1)", fontSize: "12px" };

export interface FundingSectorDatum { name: string; value: number; color: string }
export interface ProposalDistributionDatum { name: string; proposals: number }
export interface DistrictProjectDatum { name: string; projects: number }

export function FundingSectorChart({ data }: { data: FundingSectorDatum[] }) {
  return (
    <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6">
      <ChartTitle title="Funding by Sector" subtitle="Requested capital across the live pipeline" />
      {data.length ? <div className="mt-4 grid items-center gap-2 sm:grid-cols-[1fr_0.9fr]">
        <div className="h-64 min-w-0" role="img" aria-label="Donut chart showing requested funding by sector"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="transparent" animationDuration={520}>{data.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${value}%`, "Requested funding"]} /></PieChart></ResponsiveContainer></div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-1">{data.map((item) => <div key={item.name} className="flex items-center gap-2 text-[11px] text-slate-600"><span className="size-2 rounded-full" style={{ background: item.color }} /><span className="min-w-0 flex-1 truncate">{item.name}</span><span className="font-bold text-slate-800">{item.value}%</span></div>)}</div>
      </div> : <ChartEmptyState />}
    </DashboardCard>
  );
}

export function ProposalDistributionChart({ data }: { data: ProposalDistributionDatum[] }) {
  return (
    <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6">
      <ChartTitle title="Proposal Distribution" subtitle="Pipeline across priority sectors" />
      {data.length ? <div className="mt-8 h-64 min-w-0" role="img" aria-label="Bar chart showing proposal count by sector"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ left: -20, right: 4 }}><CartesianGrid vertical={false} stroke="#e8eceb" strokeDasharray="3 4" /><XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-24} textAnchor="end" height={58} /><YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f1f5f4" }} contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString("en-IN"), "Proposals"]} /><Bar dataKey="proposals" fill="#0f766e" radius={[5, 5, 0, 0]} maxBarSize={30} animationDuration={520} /></BarChart></ResponsiveContainer></div> : <ChartEmptyState />}
    </DashboardCard>
  );
}

export function DistrictProjectsChart({ data }: { data: DistrictProjectDatum[] }) {
  return (
    <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6">
      <ChartTitle title="Projects by District" subtitle="Top geographic concentration" />
      {data.length ? <div className="mt-6 h-[286px] min-w-0" role="img" aria-label="Horizontal bar chart showing projects by district"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} layout="vertical" margin={{ left: 8, right: 20 }}><CartesianGrid horizontal={false} stroke="#e8eceb" strokeDasharray="3 4" /><XAxis type="number" allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={92} tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f1f5f4" }} contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString("en-IN"), "Projects"]} /><Bar dataKey="projects" fill="#0369a1" radius={[0, 6, 6, 0]} maxBarSize={22} animationDuration={520} /></BarChart></ResponsiveContainer></div> : <ChartEmptyState />}
    </DashboardCard>
  );
}

function ChartTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><div className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-emerald-500" /><h3 className="font-bold text-slate-950">{title}</h3></div><p className="mt-1 pl-3.5 text-xs text-slate-500">{subtitle}</p></div>;
}

function ChartEmptyState() {
  return <div className="mt-5 grid h-60 place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-400">No proposal data available.</div>;
}
