"use client";

import { Building2, ChevronDown, FileSearch, Filter, MapPinned, RotateCcw, Search, UsersRound, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";

import { DashboardCard, EmptyState, StatusBadge } from "@/components/dashboard-ui";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/proposals/format";
import type { Proposal } from "@/types/database";

function PipelineMetric({ label, value, icon: Icon }: { label: string; value: string; icon: typeof FileSearch }) {
  return (
    <DashboardCard className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[9px] font-bold tracking-[0.16em] text-slate-500 uppercase">{label}</p>
        <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Icon className="size-4" /></span>
      </div>
      <p className="mt-5 text-2xl font-black tracking-[-0.04em] text-slate-950">{value}</p>
    </DashboardCard>
  );
}

function Score({ label, value }: { label: string; value: number | null }) {
  return <div><p className="text-[8px] font-bold tracking-[0.12em] text-slate-400 uppercase">{label}</p><p className="mt-1 font-mono text-sm font-black text-slate-800">{value === null ? "—" : `${value.toFixed(0)}/100`}</p></div>;
}

function ProposalCard({ proposal }: { proposal: Proposal }) {
  return (
    <DashboardCard className="group border-slate-200 transition hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(15,23,42,.07)]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[9px] font-bold tracking-[0.12em] text-slate-400 uppercase">
              <span className="text-emerald-700">{proposal.sector}</span><span className="size-1 rounded-full bg-slate-300" /><span>{proposal.district}</span>
            </div>
            <h2 className="mt-2 text-lg font-black leading-6 text-slate-950">{proposal.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Building2 className="size-3.5" />{proposal.ngo_name}</p>
          </div>
          <StatusBadge status={proposal.status} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-y border-slate-100 py-4 sm:grid-cols-4">
          <div><p className="text-[8px] font-bold tracking-[0.12em] text-slate-400 uppercase">Requested</p><p className="mt-1 text-sm font-black text-slate-800">{formatCurrency(proposal.requested_amount)}</p></div>
          <div><p className="text-[8px] font-bold tracking-[0.12em] text-slate-400 uppercase">Beneficiaries</p><p className="mt-1 text-sm font-black text-slate-800">{proposal.beneficiaries.toLocaleString("en-IN")}</p></div>
          <div><p className="text-[8px] font-bold tracking-[0.12em] text-slate-400 uppercase">Duration</p><p className="mt-1 text-sm font-black text-slate-800">{proposal.duration_months === null ? "—" : `${proposal.duration_months} months`}</p></div>
          <div><p className="text-[8px] font-bold tracking-[0.12em] text-slate-400 uppercase">Last updated</p><p className="mt-1 text-sm font-black text-slate-800">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(proposal.updated_at))}</p></div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <Score label="Impact" value={proposal.impact_score} />
          <Score label="Geo need" value={proposal.geo_need_score} />
          <Score label="Feasibility" value={proposal.feasibility_score} />
          <Score label="Risk" value={proposal.risk_score} />
          <Score label="Evidence" value={proposal.evidence_score} />
        </div>

        <details className="mt-5 border-t border-slate-100 pt-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold text-emerald-800 outline-none">
            View proposal details <ChevronDown className="size-4 transition group-open:rotate-180" />
          </summary>
          <div className="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            <div><p className="text-[9px] font-bold tracking-[0.12em] text-slate-400 uppercase">Project description</p><p className="mt-1">{proposal.description || "No description provided."}</p></div>
            <div><p className="text-[9px] font-bold tracking-[0.12em] text-slate-400 uppercase">Impact statement</p><p className="mt-1">{proposal.impact_statement || "No impact statement provided."}</p></div>
            <div><p className="text-[9px] font-bold tracking-[0.12em] text-slate-400 uppercase">Evidence</p><p className="mt-1">{proposal.evidence_description || "No evidence description provided."}</p></div>
          </div>
        </details>
      </div>
    </DashboardCard>
  );
}

export function CorporateProposalBrowser({ proposals }: { proposals: Proposal[] }) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("all");
  const [district, setDistrict] = useState("all");
  const [status, setStatus] = useState("all");
  const sectors = useMemo(() => [...new Set(proposals.map((proposal) => proposal.sector))].sort(), [proposals]);
  const districts = useMemo(() => [...new Set(proposals.map((proposal) => proposal.district))].sort(), [proposals]);
  const totalRequested = proposals.reduce((sum, proposal) => sum + proposal.requested_amount, 0);
  const totalBeneficiaries = proposals.reduce((sum, proposal) => sum + proposal.beneficiaries, 0);
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = proposals.filter((proposal) => {
    const matchesQuery = !normalizedQuery || [proposal.title, proposal.ngo_name, proposal.sector, proposal.district]
      .some((value) => value.toLocaleLowerCase().includes(normalizedQuery));
    return matchesQuery
      && (sector === "all" || proposal.sector === sector)
      && (district === "all" || proposal.district === district)
      && (status === "all" || proposal.status === status);
  });
  const filtersActive = Boolean(query) || sector !== "all" || district !== "all" || status !== "all";
  const resetFilters = () => { setQuery(""); setSector("all"); setDistrict("all"); setStatus("all"); };

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PipelineMetric label="Reviewable proposals" value={proposals.length.toLocaleString("en-IN")} icon={FileSearch} />
        <PipelineMetric label="Sectors" value={sectors.length.toLocaleString("en-IN")} icon={WalletCards} />
        <PipelineMetric label="Total requested" value={formatCurrency(totalRequested)} icon={MapPinned} />
        <PipelineMetric label="Potential beneficiaries" value={totalBeneficiaries.toLocaleString("en-IN")} icon={UsersRound} />
      </section>

      <DashboardCard className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700"><Filter className="size-4" /></span><div><h2 className="text-sm font-bold text-slate-950">Browse pipeline</h2><p className="text-[11px] text-slate-500">Read-only corporate review</p></div></div>
          <button type="button" onClick={resetFilters} disabled={!filtersActive} className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-[10px] font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"><RotateCcw className="size-3.5" /> CLEAR FILTERS</button>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><Input aria-label="Search proposals" placeholder="Search project or NGO" value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" /></div>
          <Select aria-label="Filter proposals by sector" value={sector} onChange={(event) => setSector(event.target.value)}><option value="all">All sectors</option>{sectors.map((value) => <option key={value} value={value}>{value}</option>)}</Select>
          <Select aria-label="Filter proposals by district" value={district} onChange={(event) => setDistrict(event.target.value)}><option value="all">All districts</option>{districts.map((value) => <option key={value} value={value}>{value}</option>)}</Select>
          <Select aria-label="Filter proposals by status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="submitted">Submitted</option><option value="under_review">Under review</option></Select>
        </div>
      </DashboardCard>

      <div className="mb-4 mt-8 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">Proposal directory</p><h2 className="mt-1 text-lg font-bold text-slate-950">{filtered.length.toLocaleString("en-IN")} project{filtered.length === 1 ? "" : "s"}</h2></div><p className="hidden text-xs text-slate-500 sm:block">Submitted and under review</p></div>
      {filtered.length ? <section className="grid gap-4 xl:grid-cols-2">{filtered.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)}</section> : <EmptyState title="No proposals match" description={proposals.length ? "Clear or change the filters to see more of the live proposal pipeline." : "No submitted or under-review proposals are currently available."} />}
    </>
  );
}
