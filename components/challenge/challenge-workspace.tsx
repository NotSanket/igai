"use client";

import { Check, CircleDollarSign, LoaderCircle, RotateCcw, Sparkles, Target } from "lucide-react";
import { useMemo, useState } from "react";

import { runChallenge, type ManualPortfolioSnapshot } from "@/app/(corporate)/challenge/actions";
import { SectionHeader } from "@/components/dashboard-ui";
import { SelectedProject } from "@/components/optimizer/optimizer-results";
import { calculateEquity } from "@/lib/optimizer/equity";
import type { PortfolioResult, ScoredProject } from "@/lib/optimizer/types";
import { formatCurrency } from "@/lib/proposals/format";

const challengeBudget = 10_000_000;
const compactCurrency = (value: number) => value >= 10_000_000 ? `₹${(value / 10_000_000).toFixed(2)} Cr` : `₹${(value / 100_000).toFixed(1)}L`;

interface Comparison {
  manual: ManualPortfolioSnapshot;
  optimized: PortfolioResult;
}

function RiskBadge({ project }: { project: ScoredProject }) {
  const styles = project.riskLevel === "LOW" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : project.riskLevel === "MEDIUM" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-rose-200 bg-rose-50 text-rose-700";
  return <span className={`rounded-full border px-2 py-1 text-[9px] font-extrabold tracking-[0.1em] ${styles}`}>{project.riskLevel} · {Math.round(project.riskScore)}</span>;
}

function ProposalCard({ project, selected, disabled, overBy, onToggle }: { project: ScoredProject; selected: boolean; disabled: boolean; overBy: number; onToggle: () => void }) {
  return (
    <article className={`animate-rise rounded-2xl border bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,.045)] transition duration-300 sm:p-6 ${selected ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,.08)]"}`}>
      <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><span className="text-[9px] font-extrabold tracking-[0.15em] text-emerald-700 uppercase">{project.proposal.sector}</span><span className="size-1 rounded-full bg-slate-300" /><span className="text-[9px] font-bold tracking-[0.12em] text-slate-400 uppercase">{project.proposal.district}</span></div><h3 className="mt-2 text-base font-bold leading-6 text-slate-950">{project.proposal.title}</h3><p className="mt-1 text-xs text-slate-500">{project.proposal.ngo_name}</p></div><span className="font-mono text-xl font-black text-slate-900">{Math.round(project.score)}</span></div>
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-slate-100 py-4 sm:grid-cols-4"><div><p className="text-[9px] font-bold text-slate-400 uppercase">Funding</p><p className="mt-1 text-sm font-bold text-slate-800">{compactCurrency(project.proposal.requested_amount)}</p></div><div><p className="text-[9px] font-bold text-slate-400 uppercase">Reach</p><p className="mt-1 text-sm font-bold text-slate-800">{project.proposal.beneficiaries.toLocaleString("en-IN")}</p></div><div><p className="text-[9px] font-bold text-slate-400 uppercase">Impact</p><p className="mt-1 text-sm font-bold text-slate-800">{project.metrics.expectedImpact.toFixed(0)}</p></div><div><p className="text-[9px] font-bold text-slate-400 uppercase">Evidence</p><p className="mt-1 text-sm font-bold text-slate-800">{project.metrics.evidenceConfidence.toFixed(0)}</p></div></div>
      <div className="mt-4 flex items-center justify-between gap-3"><RiskBadge project={project} /><button type="button" aria-pressed={selected} disabled={disabled && !selected} onClick={onToggle} className={`inline-flex h-9 min-w-28 items-center justify-center gap-2 rounded-lg border px-3 text-[10px] font-extrabold tracking-[0.1em] outline-none transition focus-visible:ring-4 focus-visible:ring-emerald-500/15 ${selected ? "border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800" : disabled ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400" : "border-slate-300 bg-white text-slate-700 hover:border-emerald-500 hover:text-emerald-700"}`}>{selected ? <Check className="size-3.5" /> : null}{selected ? "SELECTED" : "SELECT"}</button></div>
      {disabled && !selected ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-semibold text-amber-700">Exceeds the remaining budget by {formatCurrency(overBy)}.</p> : null}
    </article>
  );
}

function AllocationMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/8 bg-white/[0.04] p-3"><p className="text-[8px] font-bold tracking-[0.14em] text-slate-500 uppercase">{label}</p><p className="mt-1.5 font-mono text-sm font-black text-white">{value}</p></div>;
}

function ComparisonColumn({ title, accent, metrics }: { title: string; accent: boolean; metrics: Array<[string, string]> }) {
  return <div className={`rounded-2xl border p-5 sm:p-6 ${accent ? "border-emerald-800 bg-[#0b1e1a] text-white shadow-[0_22px_55px_rgba(8,22,19,.16)]" : "border-slate-200 bg-white text-slate-950"}`}><div className="flex items-center justify-between gap-3"><p className={`text-[10px] font-extrabold tracking-[0.18em] uppercase ${accent ? "text-emerald-300" : "text-slate-500"}`}>{title}</p>{accent ? <Sparkles className="size-4 text-emerald-300" /> : <Target className="size-4 text-slate-400" />}</div><div className="mt-5 divide-y divide-current/10">{metrics.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-5 py-3"><span className={`text-xs ${accent ? "text-slate-400" : "text-slate-500"}`}>{label}</span><span className="font-mono text-sm font-black">{value}</span></div>)}</div></div>;
}

function ChallengeComparison({ comparison, onReset }: { comparison: Comparison; onReset: () => void }) {
  const { manual, optimized } = comparison;
  const beneficiaryDelta = optimized.totalBeneficiaries - manual.totalBeneficiaries;
  const districtDelta = optimized.districtsRepresented.length - manual.districtsRepresented;
  const scoreDelta = optimized.portfolioScore - manual.portfolioScore;
  const riskImprovement = manual.averageRisk - optimized.averageRisk;
  const improvements = [
    beneficiaryDelta > 0 ? `+${beneficiaryDelta.toLocaleString("en-IN")} beneficiaries` : null,
    districtDelta > 0 ? `+${districtDelta} districts` : null,
    scoreDelta > 0.05 ? `+${scoreDelta.toFixed(1)} portfolio score` : null,
    manual.totalBeneficiaries > 0 && beneficiaryDelta > 0 ? `+${(beneficiaryDelta / manual.totalBeneficiaries * 100).toFixed(1)}% reach` : null,
    riskImprovement > 0.05 ? `${riskImprovement.toFixed(1)} points lower risk` : null,
  ].filter((value): value is string => Boolean(value));
  const reasons = [
    beneficiaryDelta > 0 ? `reaches ${beneficiaryDelta.toLocaleString("en-IN")} more beneficiaries` : null,
    districtDelta > 0 ? `adds ${districtDelta} district${districtDelta === 1 ? "" : "s"}` : null,
    scoreDelta > 0.05 ? `improves portfolio score by ${scoreDelta.toFixed(1)} points` : null,
    riskImprovement > 0.05 ? `reduces average risk by ${riskImprovement.toFixed(1)} points` : null,
  ].filter((value): value is string => Boolean(value));
  const manualMetrics: Array<[string, string]> = [
    ["Amount allocated", compactCurrency(manual.totalSpent)], ["Projects funded", manual.projectsFunded.toLocaleString("en-IN")],
    ["Beneficiaries", manual.totalBeneficiaries.toLocaleString("en-IN")], ["District coverage", `${manual.districtsRepresented} (${manual.districtCoverage.toFixed(1)}%)`],
    ["Sector coverage", `${manual.sectorsRepresented} (${manual.sectorCoverage.toFixed(1)}%)`], ["Equity score", `${manual.equityScore.toFixed(1)}/100`],
    ["Portfolio score", `${manual.portfolioScore.toFixed(1)}/100`], ["Average risk", `${manual.averageRisk.toFixed(1)}/100`],
  ];
  const optimizedMetrics: Array<[string, string]> = [
    ["Amount allocated", compactCurrency(optimized.totalSpent)], ["Projects funded", optimized.selectedProjects.length.toLocaleString("en-IN")],
    ["Beneficiaries", optimized.totalBeneficiaries.toLocaleString("en-IN")], ["District coverage", `${optimized.districtsRepresented.length} (${optimized.districtCoverage.toFixed(1)}%)`],
    ["Sector coverage", `${new Set(optimized.selectedProjects.map(({ proposal }) => proposal.sector)).size} (${optimized.sectorCoverage.toFixed(1)}%)`], ["Equity score", `${optimized.equityScore.toFixed(1)}/100`],
    ["Portfolio score", `${optimized.portfolioScore.toFixed(1)}/100`], ["Average risk", `${optimized.averageRisk.toFixed(1)}/100`],
  ];

  return (
    <section className="animate-rise mt-12 scroll-mt-28" id="challenge-result"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-extrabold tracking-[0.2em] text-emerald-700 uppercase">Challenge result</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Human allocation vs. exhaustive search</h2><p className="mt-2 text-sm text-slate-500">Same ₹1 crore budget · Balanced strategy · Equity guardrail on</p></div><button type="button" onClick={onReset} className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50"><RotateCcw className="size-3.5" /> Reset challenge</button></div>
      <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center"><ComparisonColumn title="Your allocation" accent={false} metrics={manualMetrics} /><div className="mx-auto grid size-11 place-items-center rounded-full border border-slate-200 bg-white text-xs font-black text-slate-400 shadow-sm">VS</div><ComparisonColumn title="IGAI recommends" accent metrics={optimizedMetrics} /></div>
      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white"><Sparkles className="size-4" /></span><div><h3 className="font-bold text-emerald-950">Decision summary</h3><p className="mt-2 text-sm leading-6 text-emerald-900/75">{reasons.length ? `IGAI found a stronger portfolio under the same ₹1 crore constraint: it ${reasons.join(", and ")}.` : "Your allocation matched the strongest portfolio score found under the current constraint."}</p></div></div>{improvements.length ? <div className="mt-4 flex flex-wrap gap-2">{improvements.map((improvement) => <span key={improvement} className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-emerald-800">{improvement}</span>)}</div> : null}<p className="mt-4 text-[10px] font-semibold text-emerald-800/60">{optimized.candidatePortfoliosEvaluated.toLocaleString("en-IN")} candidate portfolios evaluated.</p></div>
      <div className="mt-10"><SectionHeader eyebrow={`${optimized.selectedProjects.length} projects`} title="IGAI-selected portfolio" /><div className="grid gap-5 lg:grid-cols-2">{optimized.selectedProjects.map((project, index) => <SelectedProject key={project.proposal.id} project={project} index={index} />)}</div></div>
    </section>
  );
}

export function ChallengeWorkspace({ projects, loadError }: { projects: ScoredProject[]; loadError?: string }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [error, setError] = useState<string | null>(loadError ?? null);
  const [running, setRunning] = useState(false);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedProjects = useMemo(() => projects.filter(({ proposal }) => selectedIdSet.has(proposal.id)), [projects, selectedIdSet]);
  const spent = selectedProjects.reduce((sum, project) => sum + project.proposal.requested_amount, 0);
  const remaining = challengeBudget - spent;
  const beneficiaries = selectedProjects.reduce((sum, project) => sum + project.proposal.beneficiaries, 0);
  const districts = new Set(selectedProjects.map(({ proposal }) => proposal.district));
  const sectors = new Set(selectedProjects.map(({ proposal }) => proposal.sector));
  const equity = calculateEquity(selectedProjects, projects);
  const averageRisk = spent > 0 ? selectedProjects.reduce((sum, project) => sum + project.riskScore * project.proposal.requested_amount, 0) / spent : 0;
  const utilisation = Math.max(0, Math.min(100, spent / challengeBudget * 100));

  const toggleProject = (project: ScoredProject) => {
    const selected = selectedIdSet.has(project.proposal.id);
    if (!selected && spent + project.proposal.requested_amount > challengeBudget) return;
    setSelectedIds((current) => selected ? current.filter((id) => id !== project.proposal.id) : [...current, project.proposal.id]);
    setComparison(null);
    setError(null);
  };

  const beatAllocation = async () => {
    setRunning(true);
    setError(null);
    setComparison(null);
    try {
      const response = await runChallenge({ selectedIds });
      if (response.error) setError(response.error);
      else if (response.comparison) {
        setComparison(response.comparison);
        requestAnimationFrame(() => document.getElementById("challenge-result")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      }
    } catch {
      setError("The challenge comparison could not be reached. Please try again.");
    } finally {
      setRunning(false);
    }
  };

  const reset = () => { setSelectedIds([]); setComparison(null); setError(loadError ?? null); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="mx-auto max-w-[1500px]">
      <section className="animate-rise relative overflow-hidden rounded-[24px] border border-emerald-950 bg-[#0b1e1a] px-6 py-9 text-white shadow-[0_24px_65px_rgba(8,22,19,.16)] sm:px-9 sm:py-11 lg:px-11 lg:py-14"><div className="data-matrix absolute inset-0 opacity-40" /><div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.22em] text-emerald-300 uppercase"><Target className="size-3.5" /> The ₹1 Crore Challenge</p><h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl lg:text-[58px]">YOU HAVE ₹1 CRORE.</h1><p className="mt-4 text-lg font-semibold text-slate-300">Which projects would you fund?</p><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Build your own CSR portfolio from the live proposal pipeline. Then let IGAI exhaustively search every combination under the exact same constraint.</p></div><div className="grid min-w-64 grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="text-[9px] font-bold tracking-[0.14em] text-slate-500 uppercase">Eligible projects</p><p className="mt-2 font-mono text-xl font-black">{projects.length}</p></div><div className="rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="text-[9px] font-bold tracking-[0.14em] text-slate-500 uppercase">Strategy</p><p className="mt-2 text-sm font-black">Balanced</p></div></div></div></section>

      {error ? <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">{error}</div> : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px] xl:items-start">
        <section><SectionHeader eyebrow="Live proposal pipeline" title="Choose your projects" action={<p className="hidden text-xs text-slate-500 sm:block">Select any combination within budget</p>} />{projects.length ? <div className="grid gap-4 lg:grid-cols-2">{projects.map((project) => { const selected = selectedIdSet.has(project.proposal.id); const overBy = Math.max(0, project.proposal.requested_amount - remaining); return <ProposalCard key={project.proposal.id} project={project} selected={selected} disabled={!selected && overBy > 0} overBy={overBy} onToggle={() => toggleProject(project)} />; })}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">No eligible proposals are available.</div>}</section>

        <aside className="overflow-hidden rounded-2xl border border-emerald-950 bg-[#0b1e1a] text-white shadow-[0_20px_55px_rgba(8,22,19,.14)] xl:sticky xl:top-28"><div className="border-b border-white/8 px-5 py-5"><div className="flex items-center justify-between"><div><p className="text-[9px] font-extrabold tracking-[0.18em] text-emerald-300 uppercase">Your allocation</p><p className="mt-1 text-sm text-slate-400">Live budget position</p></div><CircleDollarSign className="size-5 text-emerald-300" /></div><p className="mt-5 text-3xl font-black tracking-[-0.05em]">{compactCurrency(spent)}</p><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full transition-all duration-300 ${utilisation > 90 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${utilisation}%` }} /></div><div className="mt-2 flex justify-between font-mono text-[9px] text-slate-500"><span>{utilisation.toFixed(0)}% allocated</span><span>{compactCurrency(remaining)} remaining</span></div></div><div className="grid grid-cols-2 gap-2 p-5"><AllocationMetric label="Projects" value={selectedProjects.length.toLocaleString("en-IN")} /><AllocationMetric label="Beneficiaries" value={beneficiaries.toLocaleString("en-IN")} /><AllocationMetric label="Districts" value={districts.size.toLocaleString("en-IN")} /><AllocationMetric label="Sectors" value={sectors.size.toLocaleString("en-IN")} /><AllocationMetric label="Equity score" value={`${equity.equityScore.toFixed(1)}/100`} /><AllocationMetric label="Average risk" value={`${averageRisk.toFixed(1)}/100`} /></div><div className="border-t border-white/8 p-5"><button type="button" onClick={beatAllocation} disabled={running || selectedIds.length === 0 || Boolean(loadError)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-300 px-5 text-[10px] font-extrabold tracking-[0.1em] text-emerald-950 outline-none transition hover:-translate-y-0.5 hover:bg-emerald-200 focus-visible:ring-4 focus-visible:ring-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">{running ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{running ? "EVALUATING PORTFOLIOS..." : "BEAT MY ALLOCATION"}</button><button type="button" onClick={reset} disabled={selectedIds.length === 0 && !comparison} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg text-[10px] font-bold tracking-[0.08em] text-slate-400 transition hover:bg-white/5 hover:text-white disabled:opacity-40"><RotateCcw className="size-3.5" /> RESET CHALLENGE</button>{running ? <div className="optimizer-progress mt-3 h-1 overflow-hidden rounded-full bg-emerald-900" aria-label="Evaluating candidate portfolios" /> : null}</div></aside>
      </div>

      {comparison ? <ChallengeComparison comparison={comparison} onReset={reset} /> : null}
    </div>
  );
}
