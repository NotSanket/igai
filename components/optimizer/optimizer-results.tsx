"use client";

import { ArrowDown, Check, CheckCircle2, CircleDollarSign, CircleHelp, Clock3, Gauge, Landmark, MapPinned, Scale, ShieldCheck, UsersRound } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { DashboardCard, SectionHeader } from "@/components/dashboard-ui";
import { OptimizerCharts } from "@/components/optimizer/optimizer-charts";
import type { PortfolioResult, ScoredProject } from "@/lib/optimizer/types";

const compactCurrency = (value: number) => value >= 10_000_000 ? `₹${(value / 10_000_000).toFixed(2)} Cr` : `₹${(value / 100_000).toFixed(1)}L`;
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

function AnimatedNumber({ value, formatter }: { value: number; formatter: (value: number) => string }) {
  const previous = useRef(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const from = previous.current;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 460;
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(from + (value - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else previous.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatter(display)}</>;
}

function ResultMetric({ label, value, icon: Icon }: { label: string; value: ReactNode; icon: typeof CircleDollarSign }) {
  return <div className="rounded-xl border border-white/10 bg-white/[0.045] p-4"><div className="flex items-center justify-between gap-3"><p className="text-[9px] font-bold tracking-[0.16em] text-slate-400 uppercase">{label}</p><Icon className="size-3.5 text-emerald-300" /></div><p className="mt-3 text-xl font-black tracking-[-0.04em] text-white">{value}</p></div>;
}

function RiskPill({ project }: { project: ScoredProject }) {
  const styles = project.riskLevel === "LOW" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : project.riskLevel === "MEDIUM" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-rose-200 bg-rose-50 text-rose-700";
  return <span className={`rounded-full border px-2.5 py-1 text-[9px] font-extrabold tracking-[0.12em] ${styles}`}>{project.riskLevel} RISK · {Math.round(project.riskScore)}</span>;
}

function DriverBar({ label, value, detail, risk = false, index }: { label: string; value: number; detail: string; risk?: boolean; index: number }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return <div title={detail} className="group"><div className="mb-2 flex items-center justify-between gap-4"><span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">{label}<CircleHelp className="size-3 text-slate-300 transition group-hover:text-emerald-600" /></span><span className="font-mono text-xs font-bold text-slate-900">{safeValue.toFixed(1)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full origin-left rounded-full ${risk ? "bg-amber-500" : "bg-emerald-700"} animate-grow-bar`} style={{ width: `${safeValue}%`, animationDelay: `${index * 55}ms` }} /></div><p className="mt-1.5 text-[10px] leading-4 text-slate-400 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">{detail}</p></div>;
}

function EquityBar({ label, value, detail, inverse = false }: { label: string; value: number; detail: string; inverse?: boolean }) {
  return <div><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold text-slate-700">{label}</p><p className="mt-1 text-[10px] text-slate-400">{detail}</p></div><p className="font-mono text-sm font-black text-slate-900">{value.toFixed(1)}%</p></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${inverse && value > 50 ? "bg-amber-500" : "bg-emerald-700"}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>;
}

export function SelectedProject({ project, index }: { project: ScoredProject; index: number }) {
  return (
    <DashboardCard style={{ animationDelay: `${index * 55}ms` }} className="group border-slate-200 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_20px_45px_rgba(15,23,42,.08)] sm:p-6">
      <div className="flex items-start gap-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700"><Check className="size-4" strokeWidth={3} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[9px] font-extrabold tracking-[0.16em] text-emerald-700 uppercase">Selected</span><span className="size-1 rounded-full bg-slate-300" /><span className="text-[9px] font-bold tracking-[0.12em] text-slate-400 uppercase">{project.proposal.sector}</span></div><h3 className="mt-2 text-base font-bold leading-6 text-slate-950">{project.proposal.title}</h3><p className="mt-1 text-xs text-slate-500">{project.proposal.ngo_name} · {project.proposal.district}</p></div><span className="font-mono text-xl font-black tracking-tight text-slate-900">{Math.round(project.score)}</span></div>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-slate-100 py-4 sm:grid-cols-4"><div><p className="text-[9px] font-bold text-slate-400 uppercase">Funding</p><p className="mt-1 text-sm font-bold text-slate-800">{compactCurrency(project.proposal.requested_amount)}</p></div><div><p className="text-[9px] font-bold text-slate-400 uppercase">Beneficiaries</p><p className="mt-1 text-sm font-bold text-slate-800">{project.proposal.beneficiaries.toLocaleString("en-IN")}</p></div><div><p className="text-[9px] font-bold text-slate-400 uppercase">Impact</p><p className="mt-1 text-sm font-bold text-slate-800">{project.metrics.expectedImpact.toFixed(0)}/100</p></div><div><p className="text-[9px] font-bold text-slate-400 uppercase">Evidence</p><p className="mt-1 text-sm font-bold text-slate-800">{project.metrics.evidenceConfidence.toFixed(0)}/100</p></div></div>
      <div className="mt-4"><RiskPill project={project} /></div>
      <details className="group/details mt-4 rounded-xl border border-slate-100 bg-slate-50/70 open:border-emerald-100 open:bg-emerald-50/40"><summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-xs font-bold text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Why selected?<span className="grid size-6 place-items-center rounded-md bg-white text-slate-400 transition group-open/details:rotate-90"><ArrowDown className="size-3 -rotate-90" /></span></summary><p className="border-t border-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">{project.explanation}</p></details>
    </DashboardCard>
  );
}

export function OptimizerResults({ result, budget }: { result: PortfolioResult; budget: number }) {
  const selected = result.selectedProjects;
  const driverValues = [
    { label: "Expected Impact", value: average(selected.map(({ metrics }) => metrics.expectedImpact)), detail: "Average expected-impact assessment across funded projects." },
    { label: "Beneficiary Reach", value: average(selected.map(({ metrics }) => metrics.beneficiaryReach)), detail: "Selected project reach normalized against the current proposal pipeline." },
    { label: "Cost Efficiency", value: average(selected.map(({ metrics }) => metrics.costEfficiency)), detail: "How much beneficiary reach is generated relative to requested funding." },
    { label: "Geographic Need", value: average(selected.map(({ metrics }) => metrics.geographicNeed)), detail: "Average geographic-need assessment across funded districts." },
    { label: "Feasibility", value: average(selected.map(({ metrics }) => metrics.feasibility)), detail: "Average delivery feasibility derived from proposal-level inputs." },
    { label: "Evidence Confidence", value: average(selected.map(({ metrics }) => metrics.evidenceConfidence)), detail: "Strength of supporting evidence across funded projects." },
    { label: "Risk", value: result.averageRisk, detail: "Estimated implementation risk based on proposal-level risk signals.", risk: true },
  ];
  const districtCounts = selected.reduce<Record<string, number>>((counts, project) => {
    counts[project.proposal.district] = (counts[project.proposal.district] ?? 0) + 1;
    return counts;
  }, {});
  const concentration = selected.length ? Math.max(...Object.values(districtCounts)) / selected.length * 100 : 0;
  const allNeeds = result.projectScores.map(({ metrics }) => metrics.geographicNeed).sort((a, b) => a - b);
  const medianNeed = allNeeds.length ? allNeeds[Math.floor(allNeeds.length / 2)] : 0;
  const underservedDistricts = new Set(result.projectScores.filter(({ metrics }) => metrics.geographicNeed >= medianNeed).map(({ proposal }) => proposal.district));
  const underservedCovered = new Set(selected.filter(({ proposal }) => underservedDistricts.has(proposal.district)).map(({ proposal }) => proposal.district));
  const underservedCoverage = underservedDistricts.size ? underservedCovered.size / underservedDistricts.size * 100 : 0;
  const flow = [
    { label: "CSR budget", value: compactCurrency(budget), icon: CircleDollarSign },
    { label: "Projects funded", value: selected.length.toLocaleString("en-IN"), icon: CheckCircle2 },
    { label: "Capital deployed", value: compactCurrency(result.totalSpent), icon: Landmark },
    { label: "Beneficiaries", value: result.totalBeneficiaries.toLocaleString("en-IN"), icon: UsersRound },
    { label: "Districts reached", value: result.districtsRepresented.length.toLocaleString("en-IN"), icon: MapPinned },
    { label: "Portfolio posture", value: result.equityGuardrail ? "Equity balanced" : "Objective focused", icon: Scale },
  ];

  return (
    <div className="animate-rise mt-10 space-y-12">
      <section className="relative overflow-hidden rounded-[24px] border border-emerald-900 bg-[#0b1e1a] p-6 text-white shadow-[0_26px_70px_rgba(8,22,19,.18)] sm:p-8 lg:p-10">
        <div className="data-matrix absolute inset-0 opacity-40" /><div className="relative"><div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.2em] text-emerald-300 uppercase"><CheckCircle2 className="size-3.5" /> Portfolio recommendation</p><span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[9px] font-bold tracking-[0.16em] text-emerald-200 uppercase">{result.candidatePortfoliosEvaluated.toLocaleString("en-IN")} candidates evaluated</span></div><div className="mt-8 grid gap-8 xl:grid-cols-[.9fr_1.6fr] xl:items-end"><div><p className="text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">Total allocated</p><p className="mt-2 text-5xl font-black tracking-[-0.06em] sm:text-6xl"><AnimatedNumber value={result.totalSpent} formatter={compactCurrency} /></p><p className="mt-3 text-sm text-slate-400"><AnimatedNumber value={result.remainingBudget} formatter={compactCurrency} /> remains unallocated</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3"><ResultMetric label="Projects funded" value={<AnimatedNumber value={selected.length} formatter={(value) => Math.round(value).toLocaleString("en-IN")} />} icon={CheckCircle2} /><ResultMetric label="Beneficiaries" value={<AnimatedNumber value={result.totalBeneficiaries} formatter={(value) => Math.round(value).toLocaleString("en-IN")} />} icon={UsersRound} /><ResultMetric label="Districts" value={<AnimatedNumber value={result.districtsRepresented.length} formatter={(value) => Math.round(value).toLocaleString("en-IN")} />} icon={MapPinned} /><ResultMetric label="Portfolio score" value={<><AnimatedNumber value={result.portfolioScore} formatter={(value) => value.toFixed(1)} /><span className="text-xs text-slate-500">/100</span></>} icon={Gauge} /><ResultMetric label="Equity score" value={<><AnimatedNumber value={result.equityScore} formatter={(value) => value.toFixed(1)} /><span className="text-xs text-slate-500">/100</span></>} icon={Scale} /><ResultMetric label="Average risk" value={<><AnimatedNumber value={result.averageRisk} formatter={(value) => value.toFixed(1)} /><span className="text-xs text-slate-500">/100</span></>} icon={ShieldCheck} /></div></div></div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <DashboardCard className="p-6 sm:p-8"><p className="text-[10px] font-extrabold tracking-[0.18em] text-emerald-700 uppercase">Why IGAI chose this portfolio</p><h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Decision drivers</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Each bar aggregates actual calculated metrics from the selected projects.</p><div className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">{driverValues.map((driver, index) => <DriverBar key={driver.label} {...driver} index={index} />)}</div></DashboardCard>
        <DashboardCard className="p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold tracking-[0.18em] text-emerald-700 uppercase">Geographic equity</p><h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">Guardrail diagnostics</h2></div><span className={`flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-extrabold tracking-[0.14em] uppercase ${result.equityGuardrail ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}><span className={`size-1.5 rounded-full ${result.equityGuardrail ? "animate-pulse bg-emerald-500" : "bg-slate-400"}`} />{result.equityGuardrail ? "Equity guardrail active" : "Guardrail off"}</span></div><div className="mt-7 space-y-6"><EquityBar label="Equity score" value={result.equityScore} detail="Combined geographic diversity and need." /><EquityBar label="District coverage" value={result.districtCoverage} detail="Share of pipeline districts represented." /><EquityBar label="Underserved district coverage" value={underservedCoverage} detail="High-need districts represented in this portfolio." /><EquityBar label="Geographic concentration" value={concentration} detail="Share of funded projects in the most represented district." inverse /></div></DashboardCard>
      </section>

      <section><SectionHeader eyebrow="Decision pathway" title="Portfolio story" /><DashboardCard className="relative overflow-hidden p-6 sm:p-8"><p className="max-w-5xl text-sm font-medium leading-7 text-slate-600">{result.portfolioStory}</p><div className="relative mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-6"><div className="absolute left-[8%] right-[8%] top-7 hidden h-px bg-slate-200 xl:block" />{flow.map(({ label, value, icon: Icon }, index) => <div key={label} className="relative rounded-xl border border-slate-100 bg-white p-4 text-center shadow-[0_6px_18px_rgba(15,23,42,.04)]"><span className="relative mx-auto grid size-8 place-items-center rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-700"><Icon className="size-3.5" /></span><p className="mt-3 text-sm font-black text-slate-900">{value}</p><p className="mt-1 text-[9px] font-bold tracking-[0.12em] text-slate-400 uppercase">{label}</p>{index < flow.length - 1 ? <ArrowDown className="absolute -bottom-2.5 left-1/2 z-10 size-4 -translate-x-1/2 rounded-full bg-white p-0.5 text-slate-300 xl:hidden" /> : null}</div>)}</div></DashboardCard></section>

      <section><SectionHeader eyebrow="Decision evidence" title="Portfolio visualizations" /><OptimizerCharts result={result} /></section>

      <section><SectionHeader eyebrow={`${selected.length} projects`} title="Selected for funding" /><div className="grid gap-5 lg:grid-cols-2">{selected.map((project, index) => <SelectedProject key={project.proposal.id} project={project} index={index} />)}</div></section>

      <section className="pb-6"><SectionHeader eyebrow={`${result.deferredProjects.length} projects`} title="Deferred under current budget" /><div className="mb-4 flex gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600"><Clock3 className="mt-0.5 size-4 shrink-0 text-slate-500" /><p><span className="font-bold text-slate-800">Deferred does not mean rejected.</span> These projects were not included in the strongest portfolio under the current budget and strategy.</p></div><DashboardCard className="overflow-hidden"><div className="divide-y divide-slate-100">{result.deferredProjects.map((project) => <div key={project.proposal.id} className="grid gap-4 p-5 transition hover:bg-slate-50/60 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center"><div className="flex gap-3"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500"><Clock3 className="size-4" /></span><div><p className="text-[9px] font-bold tracking-[0.14em] text-slate-400 uppercase">Deferred · {project.proposal.sector} · {project.proposal.district}</p><h3 className="mt-1 font-bold text-slate-900">{project.proposal.title}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{project.explanation}</p></div></div><div className="grid grid-cols-3 gap-5 pl-11 lg:pl-0"><div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase">Request</p><p className="mt-1 text-sm font-bold text-slate-800">{compactCurrency(project.proposal.requested_amount)}</p></div><div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase">Reach</p><p className="mt-1 text-sm font-bold text-slate-800">{project.proposal.beneficiaries.toLocaleString("en-IN")}</p></div><div className="text-right"><p className="text-[9px] font-bold text-slate-400 uppercase">Score</p><p className="mt-1 text-sm font-bold text-slate-800">{Math.round(project.score)}</p></div></div></div>)}</div></DashboardCard></section>
    </div>
  );
}
