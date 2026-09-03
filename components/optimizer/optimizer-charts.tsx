"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashboardCard } from "@/components/dashboard-ui";
import type { PortfolioResult } from "@/lib/optimizer/types";
import { formatCurrency } from "@/lib/proposals/format";

const sectorColors = ["#0f766e", "#115e59", "#0369a1", "#334155", "#15803d", "#64748b", "#0e7490", "#78716c"];
const tooltipStyle = { border: "1px solid #dbe4e1", borderRadius: "12px", boxShadow: "0 16px 34px rgba(15,23,42,.12)", fontSize: "12px", color: "#0f172a" };
const shortName = (name: string) => name.length > 24 ? `${name.slice(0, 22)}…` : name;

function ChartTitle({ question, title, detail }: { question: string; title: string; detail: string }) {
  return <div className="border-b border-slate-100 pb-4"><p className="text-[9px] font-extrabold tracking-[0.18em] text-emerald-700 uppercase">{question}</p><div className="mt-1 flex flex-wrap items-baseline justify-between gap-2"><h3 className="font-bold tracking-tight text-slate-950">{title}</h3><span className="text-[11px] text-slate-400">{detail}</span></div></div>;
}

function EmptyChart() {
  return <div className="grid h-64 place-items-center text-center text-xs text-slate-400">No projects fit the current budget.</div>;
}

export function OptimizerCharts({ result }: { result: PortfolioResult }) {
  const sectors = Object.entries(result.selectedProjects.reduce<Record<string, number>>((totals, project) => {
    totals[project.proposal.sector] = (totals[project.proposal.sector] ?? 0) + project.proposal.requested_amount;
    return totals;
  }, {})).map(([name, value], index) => ({ name, value, color: sectorColors[index % sectorColors.length] }));
  const funding = [...result.selectedProjects].sort((a, b) => b.proposal.requested_amount - a.proposal.requested_amount).map((project) => ({ name: shortName(project.proposal.title), amount: project.proposal.requested_amount }));
  const reach = [...result.selectedProjects].sort((a, b) => b.proposal.beneficiaries - a.proposal.beneficiaries).map((project) => ({ name: shortName(project.proposal.title), beneficiaries: project.proposal.beneficiaries }));
  const districts = Object.values(result.selectedProjects.reduce<Record<string, { name: string; amount: number; beneficiaries: number }>>((totals, project) => {
    const district = project.proposal.district;
    const current = totals[district] ?? { name: district, amount: 0, beneficiaries: 0 };
    totals[district] = { name: district, amount: current.amount + project.proposal.requested_amount, beneficiaries: current.beneficiaries + project.proposal.beneficiaries };
    return totals;
  }, {})).sort((a, b) => b.amount - a.amount);
  const composition = [
    { name: "Selected", value: result.selectedProjects.length, color: "#0f766e" },
    { name: "Deferred", value: result.deferredProjects.length, color: "#cbd5e1" },
  ];
  const totalProjects = result.projectScores.length;

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6">
        <ChartTitle question="Capital exposure" title="Allocation by sector" detail={`${sectors.length} sectors funded`} />
        {sectors.length ? <div className="relative mt-4 h-72" role="img" aria-label="Donut chart showing selected funding by sector"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sectors} dataKey="value" nameKey="name" innerRadius={72} outerRadius={102} paddingAngle={2} stroke="transparent" animationDuration={520}>{sectors.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), "Allocated"]} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="text-center"><p className="text-2xl font-black tracking-tight text-slate-950">{result.selectedProjects.length}</p><p className="text-[9px] font-bold tracking-[0.16em] text-slate-400 uppercase">Projects</p></div></div></div> : <EmptyChart />}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">{sectors.map((item) => <span key={item.name} className="flex items-center gap-2 text-[11px] text-slate-600"><span className="size-2 rounded-sm" style={{ backgroundColor: item.color }} />{item.name}</span>)}</div>
      </DashboardCard>

      <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6">
        <ChartTitle question="Pipeline decision" title="Portfolio composition" detail={`${totalProjects.toLocaleString("en-IN")} eligible proposals`} />
        {totalProjects ? <div className="relative mt-4 h-72" role="img" aria-label="Donut chart comparing selected and deferred proposal counts"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={composition} dataKey="value" nameKey="name" innerRadius={72} outerRadius={102} paddingAngle={3} stroke="transparent" animationDuration={520}>{composition.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [`${value} (${Math.round(Number(value) / totalProjects * 100)}%)`, name]} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="text-center"><p className="text-2xl font-black tracking-tight text-slate-950">{Math.round(result.selectedProjects.length / totalProjects * 100)}%</p><p className="text-[9px] font-bold tracking-[0.16em] text-slate-400 uppercase">Selected</p></div></div></div> : <EmptyChart />}
        <div className="mt-2 grid grid-cols-2 gap-3">{composition.map((item) => <div key={item.name} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="size-2 rounded-sm" style={{ backgroundColor: item.color }} />{item.name}</div><p className="mt-1 text-lg font-black text-slate-900">{item.value}</p></div>)}</div>
      </DashboardCard>

      <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6"><ChartTitle question="Project concentration" title="Funding allocation" detail="Selected projects · descending" />{funding.length ? <div className="mt-5 min-h-[320px]" style={{ height: Math.max(320, funding.length * 44) }} role="img" aria-label="Horizontal bar chart showing allocated funding by project"><ResponsiveContainer width="100%" height="100%"><BarChart data={funding} layout="vertical" margin={{ left: 8, right: 18 }}><CartesianGrid horizontal={false} stroke="#edf1f0" strokeDasharray="3 4" /><XAxis type="number" tickFormatter={(value) => `₹${Math.round(Number(value) / 100000)}L`} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={116} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f2f7f5" }} contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), "Funding"]} /><Bar dataKey="amount" fill="#0f766e" radius={[0, 5, 5, 0]} maxBarSize={18} animationDuration={520} /></BarChart></ResponsiveContainer></div> : <EmptyChart />}</DashboardCard>

      <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6"><ChartTitle question="Direct social reach" title="Beneficiary reach" detail="Selected projects · descending" />{reach.length ? <div className="mt-5 min-h-[320px]" style={{ height: Math.max(320, reach.length * 44) }} role="img" aria-label="Horizontal bar chart showing beneficiaries reached by project"><ResponsiveContainer width="100%" height="100%"><BarChart data={reach} layout="vertical" margin={{ left: 8, right: 18 }}><CartesianGrid horizontal={false} stroke="#edf1f0" strokeDasharray="3 4" /><XAxis type="number" tickFormatter={(value) => Number(value).toLocaleString("en-IN")} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={116} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f2f7f5" }} contentStyle={tooltipStyle} formatter={(value) => [Number(value).toLocaleString("en-IN"), "Beneficiaries"]} /><Bar dataKey="beneficiaries" fill="#0369a1" radius={[0, 5, 5, 0]} maxBarSize={18} animationDuration={520} /></BarChart></ResponsiveContainer></div> : <EmptyChart />}</DashboardCard>

      <DashboardCard className="p-5 transition hover:shadow-[0_18px_44px_rgba(15,23,42,.07)] sm:p-6 xl:col-span-2"><ChartTitle question="Geographic exposure" title="District coverage" detail={`${result.districtsRepresented.length} districts represented`} />{districts.length ? <><div className="mt-5 h-72" role="img" aria-label="Bar chart showing funding allocated by district"><ResponsiveContainer width="100%" height="100%"><BarChart data={districts} margin={{ left: 0, right: 8, bottom: 38 }}><CartesianGrid vertical={false} stroke="#edf1f0" strokeDasharray="3 4" /><XAxis dataKey="name" interval={0} angle={-22} textAnchor="end" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tickFormatter={(value) => `₹${Math.round(Number(value) / 100000)}L`} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip cursor={{ fill: "#f2f7f5" }} contentStyle={tooltipStyle} formatter={(value) => [formatCurrency(Number(value)), "Allocated"]} /><Bar dataKey="amount" fill="#334155" radius={[5, 5, 0, 0]} maxBarSize={34} animationDuration={520} /></BarChart></ResponsiveContainer></div><div className="mt-2 flex flex-wrap gap-2">{districts.map((district) => <span key={district.name} className="rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-500"><strong className="text-slate-700">{district.name}</strong> · {district.beneficiaries.toLocaleString("en-IN")} people</span>)}</div></> : <EmptyChart />}</DashboardCard>
    </div>
  );
}
