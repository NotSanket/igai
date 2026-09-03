"use client";

import dynamic from "next/dynamic";
import { BarChart3, CircleDollarSign, Filter, Map, MapPinned, RotateCcw, Scale, Target, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardCard, SectionHeader } from "@/components/dashboard-ui";
import { ImpactMapCharts } from "@/components/impact-map/impact-map-charts";
import { Select } from "@/components/ui/select";
import { calculateEquity } from "@/lib/optimizer/equity";
import type { ScoredProject } from "@/lib/optimizer/types";
import { formatCurrency } from "@/lib/proposals/format";

const ImpactMapCanvas = dynamic(() => import("@/components/impact-map/impact-map-canvas").then((module) => module.ImpactMapCanvas), {
  ssr: false,
  loading: () => <div className="grid min-h-[620px] place-items-center bg-slate-100 text-xs font-bold tracking-[0.12em] text-slate-400 uppercase">Loading geographic intelligence...</div>,
});

const hasCoordinates = ({ proposal }: ScoredProject) => {
  const latitude = Number(proposal.latitude);
  const longitude = Number(proposal.longitude);
  return proposal.latitude !== null && proposal.longitude !== null
    && Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

function KpiCard({ label, value, context, icon: Icon, index }: { label: string; value: string; context: string; icon: typeof MapPinned; index: number }) {
  return <DashboardCard style={{ animationDelay: `${index * 60}ms` }} className="group p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,.08)]"><div className="flex items-start justify-between"><p className="text-[9px] font-bold tracking-[0.16em] text-slate-500 uppercase">{label}</p><span className="grid size-9 place-items-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-emerald-50 group-hover:text-emerald-700"><Icon className="size-4" /></span></div><p className="mt-6 text-2xl font-black tracking-[-0.04em] text-slate-950">{value}</p><p className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">{context}</p></DashboardCard>;
}

function EquityMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-xl border border-white/8 bg-white/[0.04] p-4"><p className="text-[8px] font-bold tracking-[0.14em] text-slate-500 uppercase">{label}</p><p className="mt-2 font-mono text-xl font-black text-white">{value}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{detail}</p></div>;
}

function GeographicFallback({ projects }: { projects: ScoredProject[] }) {
  const districts = Object.entries(projects.reduce<Record<string, number>>((totals, { proposal }) => {
    totals[proposal.district] = (totals[proposal.district] ?? 0) + 1;
    return totals;
  }, {})).sort(([, first], [, second]) => second - first);

  return <div className="grid min-h-[620px] place-items-center bg-slate-50 p-8 text-center"><div className="max-w-xl"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-200 text-slate-600"><MapPinned className="size-5" /></span><h3 className="mt-4 font-bold text-slate-900">No valid coordinates match these filters</h3><p className="mt-2 text-sm leading-6 text-slate-500">The route remains available. Add valid latitude and longitude values or clear filters to restore map markers.</p>{districts.length ? <div className="mt-5 flex flex-wrap justify-center gap-2">{districts.map(([district, count]) => <span key={district} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-600">{district} · {count}</span>)}</div> : null}</div></div>;
}

export function ImpactMapWorkspace({ projects, baselineSelectedIds, loadError }: { projects: ScoredProject[]; baselineSelectedIds: string[]; loadError?: string }) {
  const [sector, setSector] = useState("all");
  const [district, setDistrict] = useState("all");
  const [status, setStatus] = useState("all");
  const [portfolio, setPortfolio] = useState("all");
  const selectedSet = useMemo(() => new Set(baselineSelectedIds), [baselineSelectedIds]);
  const sectors = useMemo(() => [...new Set(projects.map(({ proposal }) => proposal.sector))].sort(), [projects]);
  const districts = useMemo(() => [...new Set(projects.map(({ proposal }) => proposal.district))].sort(), [projects]);
  const statuses = useMemo(() => [...new Set(projects.map(({ proposal }) => proposal.status))].sort(), [projects]);
  const filteredProjects = useMemo(() => projects.filter(({ proposal }) =>
    (sector === "all" || proposal.sector === sector)
    && (district === "all" || proposal.district === district)
    && (status === "all" || proposal.status === status)
    && (portfolio === "all" || selectedSet.has(proposal.id))), [district, portfolio, projects, sector, selectedSet, status]);
  const mappedProjects = useMemo(() => filteredProjects.filter(hasCoordinates), [filteredProjects]);
  const invalidCoordinateCount = filteredProjects.length - mappedProjects.length;
  const totalFunding = mappedProjects.reduce((sum, { proposal }) => sum + proposal.requested_amount, 0);
  const totalBeneficiaries = mappedProjects.reduce((sum, { proposal }) => sum + proposal.beneficiaries, 0);
  const averageNeed = mappedProjects.length ? mappedProjects.reduce((sum, { metrics }) => sum + metrics.geographicNeed, 0) / mappedProjects.length : 0;
  const representedDistricts = new Set(mappedProjects.map(({ proposal }) => proposal.district));
  const equity = calculateEquity(mappedProjects, projects);
  const districtCounts = mappedProjects.reduce<Record<string, number>>((counts, { proposal }) => {
    counts[proposal.district] = (counts[proposal.district] ?? 0) + 1;
    return counts;
  }, {});
  const concentration = mappedProjects.length ? Math.max(...Object.values(districtCounts)) / mappedProjects.length * 100 : 0;
  const sortedNeeds = projects.map(({ metrics }) => metrics.geographicNeed).sort((first, second) => first - second);
  const medianNeed = sortedNeeds.length ? sortedNeeds[Math.floor(sortedNeeds.length / 2)] : 0;
  const underservedDistricts = new Set(projects.filter(({ metrics }) => metrics.geographicNeed >= medianNeed).map(({ proposal }) => proposal.district));
  const underservedRepresented = [...representedDistricts].filter((name) => underservedDistricts.has(name)).length;
  const filtersActive = sector !== "all" || district !== "all" || status !== "all" || portfolio !== "all";
  const resetFilters = () => { setSector("all"); setDistrict("all"); setStatus("all"); setPortfolio("all"); };

  return <div className="mx-auto max-w-[1500px]"><section className="animate-rise relative overflow-hidden rounded-[24px] border border-emerald-950 bg-[#0b1e1a] px-6 py-9 text-white shadow-[0_24px_65px_rgba(8,22,19,.16)] sm:px-9 sm:py-11 lg:px-11 lg:py-14"><div className="data-matrix absolute inset-0 opacity-40" /><div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.22em] text-emerald-300 uppercase"><Map className="size-3.5" /> Geographic intelligence</p><h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl lg:text-[58px]">IMPACT MAP</h1><p className="mt-4 text-lg font-semibold text-slate-300">Where CSR capital reaches</p><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Visualize project distribution, geographic need, and the reach of every allocation.</p></div><div className="grid min-w-64 grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="text-[9px] font-bold tracking-[0.14em] text-slate-500 uppercase">Live pipeline</p><p className="mt-2 font-mono text-xl font-black">{projects.length}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="text-[9px] font-bold tracking-[0.14em] text-slate-500 uppercase">Baseline selected</p><p className="mt-2 font-mono text-xl font-black">{baselineSelectedIds.length}</p></div></div></div></section>

    {loadError ? <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{loadError}</div> : null}

    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><KpiCard label="Projects mapped" value={mappedProjects.length.toLocaleString("en-IN")} context={`${invalidCoordinateCount} without valid coordinates`} icon={MapPinned} index={0} /><KpiCard label="Districts covered" value={representedDistricts.size.toLocaleString("en-IN")} context={`${equity.districtCoverage.toFixed(1)}% of pipeline districts`} icon={Target} index={1} /><KpiCard label="Beneficiaries" value={totalBeneficiaries.toLocaleString("en-IN")} context="Direct reach represented" icon={UsersRound} index={2} /><KpiCard label="Funding requested" value={formatCurrency(totalFunding)} context="Visible proposal demand" icon={CircleDollarSign} index={3} /><KpiCard label="Average geo need" value={mappedProjects.length ? `${averageNeed.toFixed(1)}/100` : "—"} context="Existing proposal need score" icon={Scale} index={4} /></section>

    <DashboardCard className="mt-6"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Filter className="size-4" /></span><div><h2 className="text-sm font-bold text-slate-950">Map filters</h2><p className="text-[11px] text-slate-500">KPIs and charts update with the visible markers.</p></div></div><button type="button" onClick={resetFilters} disabled={!filtersActive} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[10px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"><RotateCcw className="size-3.5" /> CLEAR FILTERS</button></div><div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4"><Select aria-label="Filter by sector" value={sector} onChange={(event) => setSector(event.target.value)}><option value="all">All sectors</option>{sectors.map((value) => <option key={value} value={value}>{value}</option>)}</Select><Select aria-label="Filter by district" value={district} onChange={(event) => setDistrict(event.target.value)}><option value="all">All districts</option>{districts.map((value) => <option key={value} value={value}>{value}</option>)}</Select><Select aria-label="Filter by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value.replace("_", " ")}</option>)}</Select><Select aria-label="Filter by baseline selection" value={portfolio} onChange={(event) => setPortfolio(event.target.value)}><option value="all">All proposals</option><option value="selected" disabled={!baselineSelectedIds.length}>Selected · ₹1 Cr baseline</option></Select></div></DashboardCard>

    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,.07)]"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6"><div><p className="text-[9px] font-extrabold tracking-[0.18em] text-emerald-700 uppercase">Live proposal geography</p><h2 className="mt-1 font-bold text-slate-950">Tamil Nadu allocation landscape</h2></div><div className="flex flex-wrap items-center gap-4 text-[10px] font-semibold text-slate-500"><span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-emerald-700 ring-2 ring-emerald-100" />Selected</span><span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-sky-700" />Available proposal</span><span className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-amber-600" />Under review</span></div></div><div className="relative min-h-[620px]">{mappedProjects.length ? <ImpactMapCanvas projects={mappedProjects} selectedIds={baselineSelectedIds} /> : <GeographicFallback projects={filteredProjects} />}</div>{invalidCoordinateCount ? <div className="border-t border-amber-100 bg-amber-50 px-5 py-3 text-[11px] font-medium text-amber-800">{invalidCoordinateCount} proposal{invalidCoordinateCount === 1 ? " is" : "s are"} omitted from map metrics and visualizations because coordinates are missing or invalid.</div> : null}</section>

    <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-950 bg-[#0b1e1a] p-5 text-white shadow-[0_20px_55px_rgba(8,22,19,.13)] sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="max-w-2xl"><p className="text-[9px] font-extrabold tracking-[0.2em] text-emerald-300 uppercase">Geographic equity</p><h2 className="mt-2 text-xl font-black tracking-tight">Is capital reaching diverse and high-need regions?</h2><p className="mt-2 text-sm leading-6 text-slate-400">These indicators reuse the same district coverage, sector coverage, need and concentration concepts used by the deterministic equity engine.</p></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[9px] font-bold tracking-[0.12em] text-emerald-300 uppercase">Live filtered view</span></div><div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><EquityMetric label="Equity score" value={`${equity.equityScore.toFixed(1)}/100`} detail="Existing equity calculation" /><EquityMetric label="Districts covered" value={`${representedDistricts.size}`} detail={`${equity.districtCoverage.toFixed(1)}% coverage`} /><EquityMetric label="Underserved represented" value={`${underservedRepresented}`} detail="Districts at or above median need" /><EquityMetric label="Geographic need" value={mappedProjects.length ? averageNeed.toFixed(1) : "—"} detail="Average existing need score" /><EquityMetric label="Largest concentration" value={`${concentration.toFixed(1)}%`} detail="Share in the leading district" /></div></section>

    <section className="mt-10"><SectionHeader eyebrow="Distribution intelligence" title="District and sector breakdown" action={<p className="hidden text-xs text-slate-500 sm:block">Based on visible mapped proposals</p>} /><ImpactMapCharts projects={mappedProjects} /></section>

    {!projects.length && !loadError ? <div className="mt-8 grid min-h-56 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center"><div><BarChart3 className="mx-auto size-6 text-slate-400" /><h3 className="mt-3 font-bold text-slate-900">No reviewable proposals yet</h3><p className="mt-2 text-sm text-slate-500">Submitted proposals will appear here when coordinates are available.</p></div></div> : null}
  </div>;
}
