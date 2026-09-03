"use client";

import {
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Database,
  FlaskConical,
  Gauge,
  Landmark,
  LoaderCircle,
  RotateCcw,
  Scale,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { runScenario, type ScenarioComparison } from "@/app/(corporate)/scenario-lab/actions";
import { DashboardCard, SectionHeader } from "@/components/dashboard-ui";
import { SelectedProject } from "@/components/optimizer/optimizer-results";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { STRATEGY_OPTIONS } from "@/lib/optimizer/presets";
import type { OptimizerStrategy, PortfolioResult } from "@/lib/optimizer/types";
import { formatCurrency } from "@/lib/proposals/format";

const BASELINE_BUDGET = 10_000_000;
const MIN_BUDGET = 5_000_000;
const MAX_BUDGET = 15_000_000;
const compactCurrency = (value: number) => {
  const absolute = Math.abs(value);
  const formatted = absolute >= 10_000_000
    ? `₹${(absolute / 10_000_000).toFixed(2)} Cr`
    : `₹${(absolute / 100_000).toFixed(1)}L`;
  return value < 0 ? `−${formatted}` : formatted;
};

const quickScenarios: Array<{ label: string; detail: string; budget: number; strategy: OptimizerStrategy }> = [
  { label: "₹80L", detail: "Balanced", budget: 8_000_000, strategy: "balanced" },
  { label: "₹1Cr", detail: "Balanced", budget: 10_000_000, strategy: "balanced" },
  { label: "₹1Cr", detail: "Maximum Reach", budget: 10_000_000, strategy: "maximum-reach" },
  { label: "₹1Cr", detail: "Rural First", budget: 10_000_000, strategy: "rural-first" },
  { label: "₹1Cr", detail: "Maximum Equity", budget: 10_000_000, strategy: "maximum-equity" },
];

const sectorCount = (result: PortfolioResult) => new Set(result.selectedProjects.map(({ proposal }) => proposal.sector)).size;
const signed = (value: number, digits = 0) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(digits)}`;
const signedInteger = (value: number) => `${value > 0 ? "+" : ""}${value.toLocaleString("en-IN")}`;
const signedCurrency = (value: number) => `${value > 0 ? "+" : ""}${compactCurrency(value)}`;

function ControlSummary({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Landmark }) {
  return <div className="rounded-xl border border-white/8 bg-white/[0.04] p-3.5"><div className="flex items-center justify-between"><p className="text-[9px] font-bold tracking-[0.15em] text-slate-500 uppercase">{label}</p><Icon className="size-3.5 text-emerald-300" /></div><p className="mt-2 text-sm font-black text-white">{value}</p></div>;
}

function MetricRow({ label, baseline, scenario, delta }: { label: string; baseline: string; scenario: string; delta: string }) {
  return <div className="grid grid-cols-[1.25fr_.9fr_.9fr_.7fr] items-center gap-2 border-t border-slate-100 px-4 py-3.5 first:border-t-0 sm:px-5"><span className="text-xs font-semibold text-slate-600">{label}</span><span className="text-right font-mono text-xs font-bold text-slate-700">{baseline}</span><span className="text-right font-mono text-xs font-black text-emerald-800">{scenario}</span><span className={`text-right font-mono text-[11px] font-bold ${delta.startsWith("+") ? "text-emerald-700" : delta.startsWith("−") ? "text-amber-700" : "text-slate-400"}`}>{delta}</span></div>;
}

function PortfolioPanel({ eyebrow, title, result, budget, accent = false }: { eyebrow: string; title: string; result: PortfolioResult; budget: number; accent?: boolean }) {
  const allocated = budget > 0 ? Math.min(100, result.totalSpent / budget * 100) : 0;
  return <div className={`overflow-hidden rounded-2xl border ${accent ? "border-emerald-950 bg-[#0b1e1a] text-white shadow-[0_22px_55px_rgba(8,22,19,.15)]" : "border-slate-200 bg-white text-slate-950"}`}><div className="p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className={`text-[9px] font-extrabold tracking-[0.18em] uppercase ${accent ? "text-emerald-300" : "text-slate-400"}`}>{eyebrow}</p><h3 className="mt-1 text-lg font-black">{title}</h3></div>{accent ? <Sparkles className="size-5 text-emerald-300" /> : <Target className="size-5 text-slate-400" />}</div><p className="mt-6 text-3xl font-black tracking-[-0.05em]">{compactCurrency(result.totalSpent)}</p><p className={`mt-1 text-xs ${accent ? "text-slate-400" : "text-slate-500"}`}>of {compactCurrency(budget)} allocated</p><div className={`mt-4 h-2 overflow-hidden rounded-full ${accent ? "bg-white/10" : "bg-slate-100"}`}><div className={`h-full rounded-full transition-all duration-500 ${accent ? "bg-emerald-300" : "bg-slate-700"}`} style={{ width: `${allocated}%` }} /></div></div><div className={`grid grid-cols-2 border-t ${accent ? "border-white/8" : "border-slate-100"}`}><div className={`p-4 ${accent ? "border-white/8" : "border-slate-100"} border-r`}><p className={`text-[9px] font-bold uppercase ${accent ? "text-slate-500" : "text-slate-400"}`}>Projects</p><p className="mt-1 text-xl font-black">{result.selectedProjects.length}</p></div><div className="p-4"><p className={`text-[9px] font-bold uppercase ${accent ? "text-slate-500" : "text-slate-400"}`}>Portfolio score</p><p className="mt-1 text-xl font-black">{result.portfolioScore.toFixed(1)}</p></div></div></div>;
}

function ComparisonCharts({ baseline, scenario }: { baseline: PortfolioResult; scenario: PortfolioResult }) {
  const decisionData = [
    { metric: "District", Baseline: baseline.districtCoverage, Scenario: scenario.districtCoverage },
    { metric: "Sector", Baseline: baseline.sectorCoverage, Scenario: scenario.sectorCoverage },
    { metric: "Equity", Baseline: baseline.equityScore, Scenario: scenario.equityScore },
    { metric: "Portfolio", Baseline: baseline.portfolioScore, Scenario: scenario.portfolioScore },
    { metric: "Risk", Baseline: baseline.averageRisk, Scenario: scenario.averageRisk },
  ];
  const shapeData = [
    { metric: "Projects", Baseline: baseline.selectedProjects.length, Scenario: scenario.selectedProjects.length },
    { metric: "Districts", Baseline: baseline.districtsRepresented.length, Scenario: scenario.districtsRepresented.length },
    { metric: "Sectors", Baseline: sectorCount(baseline), Scenario: sectorCount(scenario) },
  ];
  const tooltipStyle = { border: "1px solid #dbe4e1", borderRadius: "12px", boxShadow: "0 16px 34px rgba(15,23,42,.12)", fontSize: "12px" };

  return <div className="grid gap-5 xl:grid-cols-2"><DashboardCard className="p-5 sm:p-6"><p className="text-[9px] font-extrabold tracking-[0.18em] text-emerald-700 uppercase">Decision quality</p><h3 className="mt-1 font-bold text-slate-950">Score comparison</h3><div className="mt-5 h-72" role="img" aria-label="Bar chart comparing baseline and scenario coverage, equity, portfolio score and risk"><ResponsiveContainer width="100%" height="100%"><BarChart data={decisionData} margin={{ left: -20, right: 8 }}><CartesianGrid vertical={false} stroke="#edf1f0" strokeDasharray="3 4" /><XAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)}/100`]} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} animationDuration={520} /><Bar dataKey="Scenario" fill="#047857" radius={[4, 4, 0, 0]} animationDuration={520} /></BarChart></ResponsiveContainer></div></DashboardCard><DashboardCard className="p-5 sm:p-6"><p className="text-[9px] font-extrabold tracking-[0.18em] text-emerald-700 uppercase">Portfolio shape</p><h3 className="mt-1 font-bold text-slate-950">Projects and coverage</h3><div className="mt-5 h-72" role="img" aria-label="Bar chart comparing baseline and scenario project, district and sector counts"><ResponsiveContainer width="100%" height="100%"><BarChart data={shapeData} margin={{ left: -20, right: 8 }}><CartesianGrid vertical={false} stroke="#edf1f0" strokeDasharray="3 4" /><XAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: 11 }} /><Bar dataKey="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} animationDuration={520} /><Bar dataKey="Scenario" fill="#047857" radius={[4, 4, 0, 0]} animationDuration={520} /></BarChart></ResponsiveContainer></div></DashboardCard></div>;
}

function ScenarioResults({ comparison, onReset }: { comparison: ScenarioComparison; onReset: () => void }) {
  const { baseline, scenario, scenarioBudget } = comparison;
  const projectDelta = scenario.selectedProjects.length - baseline.selectedProjects.length;
  const beneficiaryDelta = scenario.totalBeneficiaries - baseline.totalBeneficiaries;
  const districtDelta = scenario.districtsRepresented.length - baseline.districtsRepresented.length;
  const sectorDelta = sectorCount(scenario) - sectorCount(baseline);
  const equityDelta = scenario.equityScore - baseline.equityScore;
  const scoreDelta = scenario.portfolioScore - baseline.portfolioScore;
  const riskDelta = scenario.averageRisk - baseline.averageRisk;
  const allocatedDelta = scenario.totalSpent - baseline.totalSpent;
  const baselineAverageCost = baseline.selectedProjects.length ? baseline.totalSpent / baseline.selectedProjects.length : 0;
  const scenarioAverageCost = scenario.selectedProjects.length ? scenario.totalSpent / scenario.selectedProjects.length : 0;
  const baselineIds = new Set(baseline.selectedProjects.map(({ proposal }) => proposal.id));
  const projectMixChanged = scenario.selectedProjects.some(({ proposal }) => !baselineIds.has(proposal.id)) || scenario.selectedProjects.length !== baseline.selectedProjects.length;
  const changes: string[] = [];

  if (scenarioBudget < BASELINE_BUDGET && scenarioAverageCost < baselineAverageCost) changes.push(`Reducing the budget by ${compactCurrency(BASELINE_BUDGET - scenarioBudget)} shifts the selected portfolio toward lower-cost projects.`);
  if (scenario.strategy === "maximum-reach" && beneficiaryDelta > 0 && projectMixChanged) changes.push(`Maximum Reach adds ${beneficiaryDelta.toLocaleString("en-IN")} beneficiaries while changing the project mix.`);
  if (!scenario.equityGuardrail && scenarioBudget === BASELINE_BUDGET && scenario.strategy === "balanced" && (districtDelta < 0 || equityDelta < -0.05)) changes.push("With the Equity Guardrail off, geographic representation or the calculated equity score decreased.");
  if (districtDelta > 0) changes.push(`The scenario expands geographic representation by ${districtDelta} district${districtDelta === 1 ? "" : "s"}.`);
  if (projectDelta > 0) changes.push(`The scenario funds ${projectDelta} additional project${projectDelta === 1 ? "" : "s"}.`);
  if (beneficiaryDelta < 0) changes.push(`The scenario reaches ${Math.abs(beneficiaryDelta).toLocaleString("en-IN")} fewer beneficiaries than the baseline.`);
  if (riskDelta < -0.05) changes.push(`Average portfolio risk falls by ${Math.abs(riskDelta).toFixed(1)} points.`);
  if (!changes.length) changes.push(projectMixChanged ? "The selected project mix changes, while the headline comparison metrics remain close to the baseline." : "This configuration reproduces the current baseline portfolio and metrics.");

  return <section id="scenario-result" className="animate-rise mt-12 scroll-mt-28"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-extrabold tracking-[0.2em] text-emerald-700 uppercase">Simulation result</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Baseline vs. scenario</h2><p className="mt-2 text-sm text-slate-500">A direct comparison calculated from the same eligible proposal pipeline.</p></div><button type="button" onClick={onReset} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"><RotateCcw className="size-3.5" /> RESET SCENARIO</button></div><div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center"><PortfolioPanel eyebrow="Current baseline" title="₹1 Cr · Balanced · Equity ON" result={baseline} budget={BASELINE_BUDGET} /><div className="mx-auto grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-xs font-black text-slate-400 shadow-sm">VS</div><PortfolioPanel eyebrow="Scenario" title={`${scenario.strategyLabel} · Equity ${scenario.equityGuardrail ? "ON" : "OFF"}`} result={scenario} budget={scenarioBudget} accent /></div>
    <DashboardCard className="mt-5"><div className="grid grid-cols-[1.25fr_.9fr_.9fr_.7fr] gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[9px] font-extrabold tracking-[0.13em] text-slate-400 uppercase sm:px-5"><span>Metric</span><span className="text-right">Baseline</span><span className="text-right">Scenario</span><span className="text-right">Difference</span></div><MetricRow label="Budget" baseline={compactCurrency(BASELINE_BUDGET)} scenario={compactCurrency(scenarioBudget)} delta={signedCurrency(scenarioBudget - BASELINE_BUDGET)} /><MetricRow label="Amount allocated" baseline={compactCurrency(baseline.totalSpent)} scenario={compactCurrency(scenario.totalSpent)} delta={signedCurrency(allocatedDelta)} /><MetricRow label="Projects funded" baseline={`${baseline.selectedProjects.length}`} scenario={`${scenario.selectedProjects.length}`} delta={signedInteger(projectDelta)} /><MetricRow label="Beneficiaries" baseline={baseline.totalBeneficiaries.toLocaleString("en-IN")} scenario={scenario.totalBeneficiaries.toLocaleString("en-IN")} delta={signedInteger(beneficiaryDelta)} /><MetricRow label="District coverage" baseline={`${baseline.districtsRepresented.length} (${baseline.districtCoverage.toFixed(1)}%)`} scenario={`${scenario.districtsRepresented.length} (${scenario.districtCoverage.toFixed(1)}%)`} delta={signedInteger(districtDelta)} /><MetricRow label="Sector coverage" baseline={`${sectorCount(baseline)} (${baseline.sectorCoverage.toFixed(1)}%)`} scenario={`${sectorCount(scenario)} (${scenario.sectorCoverage.toFixed(1)}%)`} delta={signedInteger(sectorDelta)} /><MetricRow label="Equity score" baseline={baseline.equityScore.toFixed(1)} scenario={scenario.equityScore.toFixed(1)} delta={signed(equityDelta, 1)} /><MetricRow label="Portfolio score" baseline={baseline.portfolioScore.toFixed(1)} scenario={scenario.portfolioScore.toFixed(1)} delta={signed(scoreDelta, 1)} /><MetricRow label="Average risk" baseline={baseline.averageRisk.toFixed(1)} scenario={scenario.averageRisk.toFixed(1)} delta={signed(riskDelta, 1)} /></DashboardCard>
    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white"><Sparkles className="size-4" /></span><div><h3 className="font-bold text-emerald-950">What changed?</h3><div className="mt-2 space-y-1.5">{changes.map((change) => <p key={change} className="text-sm leading-6 text-emerald-900/75">{change}</p>)}</div></div></div><p className="mt-4 text-[10px] font-semibold text-emerald-800/60">{scenario.candidatePortfoliosEvaluated.toLocaleString("en-IN")} candidate portfolios evaluated for this scenario.</p></div>
    <div className="mt-10"><SectionHeader eyebrow="Visual comparison" title="How the decision profile moved" /><ComparisonCharts baseline={baseline} scenario={scenario} /></div>
    <div className="mt-10"><SectionHeader eyebrow={`${scenario.selectedProjects.length} projects`} title="Scenario-selected portfolio" action={<p className="hidden text-xs text-slate-500 sm:block">Existing deterministic “Why selected?” explanations</p>} /><div className="grid gap-5 lg:grid-cols-2">{scenario.selectedProjects.map((project, index) => <SelectedProject key={project.proposal.id} project={project} index={index} />)}</div></div>
  </section>;
}

function StoryStep({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-white/8 bg-white/[0.035] p-3.5"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-400/10 text-emerald-300">{icon}</span><div className="min-w-0"><p className="text-[8px] font-bold tracking-[0.14em] text-slate-500 uppercase">{label}</p><p className="mt-1 truncate text-xs font-black text-white">{value}</p></div></div>;
}

export function ScenarioLabWorkspace({ initialProposalCount, loadError }: { initialProposalCount?: number; loadError?: string }) {
  const [budget, setBudget] = useState(BASELINE_BUDGET);
  const [strategy, setStrategy] = useState<OptimizerStrategy>("balanced");
  const [equityGuardrail, setEquityGuardrail] = useState(true);
  const [comparison, setComparison] = useState<ScenarioComparison | null>(null);
  const [error, setError] = useState<string | null>(loadError ?? null);
  const [running, setRunning] = useState(false);
  const strategyOption = STRATEGY_OPTIONS.find(({ key }) => key === strategy);
  const budgetDelta = budget - BASELINE_BUDGET;

  const changeControls = (next: { budget?: number; strategy?: OptimizerStrategy; equity?: boolean }) => {
    if (next.budget !== undefined) setBudget(next.budget);
    if (next.strategy !== undefined) setStrategy(next.strategy);
    if (next.equity !== undefined) setEquityGuardrail(next.equity);
    setComparison(null);
    setError(loadError ?? null);
  };

  const simulate = async () => {
    setRunning(true);
    setError(null);
    setComparison(null);
    try {
      const response = await runScenario({ budget, strategy, equityGuardrail });
      if (response.error) setError(response.error);
      else if (response.comparison) {
        setComparison(response.comparison);
        requestAnimationFrame(() => document.getElementById("scenario-result")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    } catch {
      setError("The Scenario Lab could not be reached. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    setBudget(BASELINE_BUDGET);
    setStrategy("balanced");
    setEquityGuardrail(true);
    setComparison(null);
    setError(loadError ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <div className="mx-auto max-w-[1500px]"><section className="animate-rise relative overflow-hidden rounded-[24px] border border-emerald-950 bg-[#0b1e1a] text-white shadow-[0_24px_65px_rgba(8,22,19,.16)]"><div className="data-matrix absolute inset-0 opacity-40" /><div className="relative grid lg:grid-cols-[1.35fr_.65fr]"><div className="px-6 py-9 sm:px-9 sm:py-11 lg:px-11 lg:py-14"><p className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.22em] text-emerald-300 uppercase"><FlaskConical className="size-3.5" /> CSR digital twin</p><h1 className="mt-5 max-w-4xl text-3xl font-black tracking-[-0.05em] sm:text-4xl lg:text-[48px] lg:leading-[1.08]">WHAT IF YOUR CSR STRATEGY CHANGES?</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">Simulate budgets, priorities and geographic equity before committing capital.</p><div className="mt-7 flex flex-wrap gap-2 text-[9px] font-bold tracking-[0.14em] text-slate-400 uppercase"><span className="rounded-full border border-white/10 px-3 py-1.5">Pre-spend simulation</span><span className="rounded-full border border-white/10 px-3 py-1.5">Deterministic</span><span className="rounded-full border border-white/10 px-3 py-1.5">Real proposal pipeline</span></div></div><aside className="relative border-t border-white/8 bg-black/10 p-6 lg:border-l lg:border-t-0 lg:p-7"><div className="flex items-center justify-between"><p className="text-[9px] font-extrabold tracking-[0.2em] text-emerald-300 uppercase">Simulation status</p><span className="font-mono text-[9px] text-slate-600">IGAI/LAB-08</span></div><div className="mt-5 space-y-3"><ControlSummary label="Eligible pipeline" value={initialProposalCount === undefined ? "— PROPOSALS" : `${initialProposalCount.toLocaleString("en-IN")} PROPOSALS`} icon={Database} /><ControlSummary label="Current budget" value={compactCurrency(budget)} icon={Landmark} /><ControlSummary label="Decision mode" value={`${strategyOption?.label ?? "Balanced"} · Equity ${equityGuardrail ? "ON" : "OFF"}`} icon={Gauge} /></div></aside></div></section>

    {error ? <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{error}</div> : null}

    <DashboardCard className="mt-6 border-slate-200 shadow-[0_16px_45px_rgba(15,23,42,.055)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:px-8"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700"><Settings2 className="size-4" /></span><div><h2 className="font-bold text-slate-950">Build a scenario</h2><p className="text-xs text-slate-500">Change the capital constraint and decision posture.</p></div></div><span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[9px] font-bold tracking-[0.14em] text-slate-500 uppercase">Runs only on command</span></div><div className="grid gap-7 p-6 sm:p-8 xl:grid-cols-[1.1fr_1fr_.85fr_auto] xl:items-end"><div className="space-y-3"><div className="flex items-center justify-between"><Label htmlFor="scenario-budget">CSR budget</Label><span className={`text-[10px] font-bold ${budgetDelta === 0 ? "text-slate-400" : budgetDelta > 0 ? "text-emerald-700" : "text-amber-700"}`}>{budgetDelta === 0 ? "Baseline" : `${budgetDelta > 0 ? "+" : "−"}${compactCurrency(Math.abs(budgetDelta))} vs baseline`}</span></div><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span><Input id="scenario-budget" type="number" min={MIN_BUDGET} max={MAX_BUDGET} step={500_000} value={budget} onChange={(event) => changeControls({ budget: Number(event.target.value) })} className="pl-8 font-mono font-bold" /></div><input aria-label="CSR budget slider" type="range" min={MIN_BUDGET} max={MAX_BUDGET} step={500_000} value={Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, budget || MIN_BUDGET))} onChange={(event) => changeControls({ budget: Number(event.target.value) })} className="h-2 w-full cursor-pointer accent-emerald-700" /><div className="flex justify-between font-mono text-[9px] text-slate-400"><span>₹50L</span><strong className="text-slate-700">{formatCurrency(budget || 0)}</strong><span>₹1.5Cr</span></div></div><div className="space-y-2"><Label htmlFor="scenario-strategy">Strategy</Label><Select id="scenario-strategy" value={strategy} onChange={(event) => changeControls({ strategy: event.target.value as OptimizerStrategy })} className="font-semibold">{STRATEGY_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</Select><p className="min-h-10 text-xs leading-5 text-slate-400">{strategyOption?.description}</p></div><div className="space-y-2"><Label>Equity guardrail</Label><button type="button" role="switch" aria-checked={equityGuardrail} onClick={() => changeControls({ equity: !equityGuardrail })} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3.5 text-xs font-bold transition ${equityGuardrail ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}><span className="flex items-center gap-2"><Scale className="size-4" />{equityGuardrail ? "ON" : "OFF"}</span><span className={`relative h-5 w-9 rounded-full transition ${equityGuardrail ? "bg-emerald-600" : "bg-slate-300"}`}><span className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition ${equityGuardrail ? "left-[18px]" : "left-0.5"}`} /></span></button><p className="text-xs leading-5 text-slate-400">District diversity and underserved-region representation influence portfolio selection.</p></div><button type="button" onClick={simulate} disabled={running || Boolean(loadError) || budget < MIN_BUDGET || budget > MAX_BUDGET} className="inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-[10px] font-extrabold tracking-[0.1em] text-white shadow-[0_10px_24px_rgba(4,120,87,.2)] transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">{running ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{running ? "EVALUATING..." : "RUN SCENARIO"}</button></div>{running ? <div className="border-t border-slate-100 px-6 py-4 sm:px-8"><div className="flex items-center justify-between text-[10px] font-bold text-slate-500"><span>Evaluating candidate portfolios...</span><span>Deterministic exhaustive search</span></div><div className="optimizer-progress mt-3 h-1 overflow-hidden rounded-full bg-emerald-100" aria-label="Evaluating candidate portfolios" /></div> : null}</DashboardCard>

    <section className="mt-8"><SectionHeader eyebrow="Quick scenarios" title="Start with a decision posture" action={<p className="hidden text-xs text-slate-500 sm:block">Select, review controls, then run</p>} /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{quickScenarios.map((quick) => { const active = budget === quick.budget && strategy === quick.strategy && equityGuardrail; return <button type="button" key={`${quick.label}-${quick.detail}`} onClick={() => changeControls({ budget: quick.budget, strategy: quick.strategy, equity: true })} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${active ? "border-emerald-600 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white"}`}><div className="flex items-center justify-between"><span className={`font-mono text-lg font-black ${active ? "text-emerald-800" : "text-slate-900"}`}>{quick.label}</span>{active ? <span className="grid size-6 place-items-center rounded-full bg-emerald-700 text-white"><Check className="size-3.5" /></span> : <ArrowRight className="size-4 text-slate-300" />}</div><p className="mt-3 text-xs font-bold text-slate-600">{quick.detail}</p><p className="mt-1 text-[9px] font-semibold tracking-[0.12em] text-slate-400 uppercase">Equity guardrail on</p></button>; })}</div></section>

    <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-950 bg-[#0b1e1a] p-5 sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><BarChart3 className="size-4" /></span><div><p className="text-[9px] font-extrabold tracking-[0.18em] text-emerald-300 uppercase">Decision flow</p><h2 className="mt-1 font-bold text-white">Pre-spend portfolio simulation</h2></div></div><div className="flex flex-col gap-2 lg:flex-row lg:items-center"><StoryStep label="Baseline" value="₹1 Cr · Balanced" icon={<Landmark className="size-4" />} /><ArrowRight className="mx-auto size-4 rotate-90 text-slate-600 lg:rotate-0" /><StoryStep label="Change" value="Budget / Strategy / Equity" icon={<Settings2 className="size-4" />} /><ArrowRight className="mx-auto size-4 rotate-90 text-slate-600 lg:rotate-0" /><StoryStep label="Run" value="Scenario" icon={<FlaskConical className="size-4" />} /><ArrowRight className="mx-auto size-4 rotate-90 text-slate-600 lg:rotate-0" /><StoryStep label="IGAI" value="Recomputes portfolio" icon={<ShieldCheck className="size-4" />} /><ArrowRight className="mx-auto size-4 rotate-90 text-slate-600 lg:rotate-0" /><StoryStep label="Compare" value="Impact" icon={<UsersRound className="size-4" />} /></div></section>

    {comparison ? <ScenarioResults comparison={comparison} onReset={reset} /> : <div className="mt-8 grid min-h-44 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center"><div><span className="mx-auto grid size-11 place-items-center rounded-xl bg-slate-100 text-slate-500"><CircleDollarSign className="size-5" /></span><h3 className="mt-4 font-bold text-slate-900">Your comparison will appear here</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Choose a scenario and run the deterministic engine to compare it with the ₹1 crore Balanced baseline.</p></div></div>}
  </div>;
}
