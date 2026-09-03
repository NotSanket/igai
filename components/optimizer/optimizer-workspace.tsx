"use client";

import { Activity, Database, Landmark, LoaderCircle, Scale, Settings2, Sparkles } from "lucide-react";
import { useState } from "react";

import { runOptimizer } from "@/app/(corporate)/optimizer/actions";
import { DashboardCard } from "@/components/dashboard-ui";
import { OptimizerResults } from "@/components/optimizer/optimizer-results";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { STRATEGY_OPTIONS } from "@/lib/optimizer/presets";
import type { OptimizerStrategy, PortfolioResult } from "@/lib/optimizer/types";
import { formatCurrency } from "@/lib/proposals/format";

const compactCurrency = (value: number) => value >= 10_000_000 ? `₹${(value / 10_000_000).toFixed(2)} Cr` : `₹${(value / 100_000).toFixed(1)}L`;

function StatusDatum({ label, value, icon: Icon, live = false }: { label: string; value: string; icon: typeof Activity; live?: boolean }) {
  return <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.035] p-3.5"><span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/8 bg-white/5 text-emerald-300"><Icon className="size-3.5" /></span><div><p className="flex items-center gap-2 text-[9px] font-bold tracking-[0.16em] text-slate-500 uppercase">{label}{live ? <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" /> : null}</p><p className="mt-1 text-sm font-extrabold text-slate-100">{value}</p></div></div>;
}

export function OptimizerWorkspace({ initialProposalCount }: { initialProposalCount?: number }) {
  const [budget, setBudget] = useState(10_000_000);
  const [strategy, setStrategy] = useState<OptimizerStrategy>("balanced");
  const [equityGuardrail, setEquityGuardrail] = useState(true);
  const [result, setResult] = useState<PortfolioResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const optimize = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const response = await runOptimizer({ budget, strategy, equityGuardrail });
      if (response.error) setError(response.error);
      else if (response.result) setResult(response.result);
    } catch {
      setError("The optimizer could not be reached. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <section className="animate-rise relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,.07)]">
        <div className="data-matrix pointer-events-none absolute inset-0 opacity-35" />
        <div className="relative grid lg:grid-cols-[1.45fr_.55fr]">
          <div className="px-6 py-9 sm:px-9 sm:py-11 lg:px-11 lg:py-14"><p className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.22em] text-emerald-700 uppercase"><span className="h-px w-8 bg-emerald-600" /> Portfolio optimization</p><h1 className="mt-5 max-w-4xl text-3xl font-black tracking-[-0.045em] text-slate-950 sm:text-4xl lg:text-[46px] lg:leading-[1.08]">How should your CSR budget be spent?</h1><p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">Evaluate competing projects against impact, reach, cost efficiency, risk and geographic equity — then fund the strongest combination within budget.</p><div className="mt-7 flex flex-wrap gap-2 text-[9px] font-bold tracking-[0.14em] text-slate-500 uppercase"><span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Exhaustive search</span><span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Deterministic scoring</span><span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">Explainable selection</span></div></div>
          <aside className="relative border-t border-slate-200 bg-[#0b1e1a] p-6 lg:border-l lg:border-t-0 lg:p-7" aria-label="Optimizer system status"><div className="flex items-center justify-between"><p className="text-[9px] font-extrabold tracking-[0.2em] text-emerald-300 uppercase">Live intelligence</p><span className="font-mono text-[9px] text-slate-600">IGAI/OPT-05</span></div><div className="mt-5 space-y-3"><StatusDatum label="System" value="READY" icon={Activity} live /><StatusDatum label="Eligible pipeline" value={initialProposalCount === undefined ? "— PROPOSALS" : `${initialProposalCount.toLocaleString("en-IN")} PROPOSALS`} icon={Database} /><StatusDatum label="Available capital" value={compactCurrency(budget || 0)} icon={Landmark} /></div><div className="mt-5 border-t border-white/8 pt-4"><div className="flex items-center justify-between text-[9px] font-bold tracking-[0.12em] text-slate-500 uppercase"><span>Decision engine</span><span className="text-emerald-300">Server-side</span></div><div className="mt-2 grid grid-cols-12 gap-1">{Array.from({ length: 12 }, (_, index) => <span key={index} className={`h-1 rounded-full ${index < 10 ? "bg-emerald-500/60" : "bg-white/10"}`} />)}</div></div></aside>
        </div>
      </section>

      <DashboardCard className="mt-6 overflow-hidden border-slate-200 shadow-[0_16px_45px_rgba(15,23,42,.055)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:px-8"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700"><Settings2 className="size-4" /></span><div><h2 className="font-bold text-slate-950">Optimization controls</h2><p className="text-xs text-slate-500">Set the capital constraint and decision posture.</p></div></div><span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[9px] font-bold tracking-[0.14em] text-slate-500 uppercase">Runs on command</span></div>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[.8fr_1.05fr_.85fr_auto] lg:items-end">
          <div className="space-y-2"><Label htmlFor="budget">CSR budget</Label><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">₹</span><Input id="budget" className="pl-8 font-mono font-bold" type="number" min="1" step="100000" value={budget} onChange={(event) => setBudget(Number(event.target.value))} /></div><p className="text-xs text-slate-400">{formatCurrency(budget || 0)} available</p></div>
          <div className="space-y-2"><Label htmlFor="strategy">Strategy</Label><Select id="strategy" className="font-semibold" value={strategy} onChange={(event) => setStrategy(event.target.value as OptimizerStrategy)}>{STRATEGY_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</Select><p className="truncate text-xs text-slate-400">{STRATEGY_OPTIONS.find(({ key }) => key === strategy)?.description}</p></div>
          <div className="space-y-2"><Label>Geographic equity guardrail</Label><button type="button" role="switch" aria-checked={equityGuardrail} onClick={() => setEquityGuardrail((enabled) => !enabled)} className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 shadow-sm outline-none transition hover:border-emerald-300 focus-visible:ring-4 focus-visible:ring-emerald-500/15"><span className="flex items-center gap-2"><Scale className="size-4 text-emerald-700" />{equityGuardrail ? "ON" : "OFF"}</span><span className={`relative h-6 w-11 rounded-full transition ${equityGuardrail ? "bg-emerald-700" : "bg-slate-300"}`}><span className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition ${equityGuardrail ? "left-6" : "left-1"}`} /></span></button><p className="text-xs text-slate-400">{equityGuardrail ? "District diversity influences selection." : "Raw portfolio objective takes priority."}</p></div>
          <button type="button" onClick={optimize} disabled={running || !Number.isFinite(budget) || budget <= 0} className="inline-flex h-12 min-w-64 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 text-[11px] font-extrabold tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(6,95,70,.18)] outline-none transition hover:-translate-y-0.5 hover:bg-emerald-900 focus-visible:ring-4 focus-visible:ring-emerald-500/20 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0">{running ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{running ? "EVALUATING PORTFOLIOS" : "OPTIMIZE PORTFOLIO"}</button>
        </div>
        {running ? <div className="border-t border-emerald-100 bg-emerald-50/60 px-6 py-4 sm:px-8" aria-live="polite"><div className="flex items-center justify-between gap-4"><p className="text-[10px] font-extrabold tracking-[0.14em] text-emerald-800 uppercase">Evaluating candidate portfolios</p><span className="font-mono text-[10px] text-emerald-700">Exhaustive subset search</span></div><div className="optimizer-progress mt-3 h-1 overflow-hidden rounded-full bg-emerald-100" /></div> : null}
      </DashboardCard>

      {error ? <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{error}</div> : null}

      {!result && !running ? <div className="mt-8 grid min-h-60 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/65 p-8 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm"><Scale className="size-5" /></span><h2 className="mt-4 font-bold text-slate-900">Decision engine ready</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Run the optimizer to compare every valid project combination against the selected budget, strategy and equity setting.</p></div></div> : null}
      {result ? <OptimizerResults result={result} budget={budget} /> : null}
    </div>
  );
}
