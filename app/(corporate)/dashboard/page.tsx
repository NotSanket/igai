import { ArrowRight, FileStack, IndianRupee, UsersRound, WalletCards } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DistrictProjectsChart, FundingSectorChart, ProposalDistributionChart } from "@/components/dashboard-charts";
import { DashboardCard, MetricCard, SectionHeader } from "@/components/dashboard-ui";
import { ProposalTable } from "@/components/proposal-table";
import { requireRole } from "@/lib/auth/session";
import type { ProposalRow } from "@/lib/data/dashboard";
import { formatCurrency, normalizeProposal } from "@/lib/proposals/format";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/types/database";

const metricIcons = [WalletCards, FileStack, IndianRupee, UsersRound];
const demoBudget = 10_000_000;
const sectorColors = ["#0f766e", "#0284c7", "#4f46e5", "#b45309", "#15803d", "#7c3aed", "#be123c", "#475569"];

export default async function CorporateDashboardPage() {
  const { profile } = await requireRole("corporate");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .in("status", ["submitted", "under_review"])
    .order("updated_at", { ascending: false });
  const proposals = ((data ?? []) as Proposal[]).map(normalizeProposal);
  const totalRequested = proposals.reduce((total, proposal) => total + proposal.requested_amount, 0);
  const totalBeneficiaries = proposals.reduce((total, proposal) => total + proposal.beneficiaries, 0);
  const sectorTotals = proposals.reduce<Record<string, { amount: number; proposals: number }>>((totals, proposal) => {
    const current = totals[proposal.sector] ?? { amount: 0, proposals: 0 };
    totals[proposal.sector] = { amount: current.amount + proposal.requested_amount, proposals: current.proposals + 1 };
    return totals;
  }, {});
  const sectorEntries = Object.entries(sectorTotals).sort(([, a], [, b]) => b.amount - a.amount);
  const fundingBySector = sectorEntries.map(([name, values], index) => ({
    name,
    value: totalRequested ? Math.round((values.amount / totalRequested) * 1000) / 10 : 0,
    color: sectorColors[index % sectorColors.length],
  }));
  const proposalDistribution = sectorEntries.map(([name, values]) => ({ name, proposals: values.proposals }));
  const districtProjects = Object.entries(proposals.reduce<Record<string, number>>((totals, proposal) => {
    totals[proposal.district] = (totals[proposal.district] ?? 0) + 1;
    return totals;
  }, {})).sort(([, a], [, b]) => b - a).slice(0, 8).map(([name, projects]) => ({ name, projects }));
  const corporateMetrics = [
    { label: "Available budget", value: "₹1.00 Cr", context: "Demo CSR allocation target", trend: "Ready to allocate" },
    { label: "Active proposals", value: proposals.length.toLocaleString("en-IN"), context: `Across ${sectorEntries.length} priority sectors`, trend: `${proposals.filter(({ status }) => status === "under_review").length} under review` },
    { label: "Total requested", value: formatCurrency(totalRequested), context: `${(totalRequested / demoBudget).toFixed(2)}× available capital`, trend: "Requires prioritization" },
    { label: "Potential beneficiaries", value: totalBeneficiaries.toLocaleString("en-IN"), context: "Estimated direct reach", trend: `${new Set(proposals.map(({ district }) => district)).size} districts represented` },
  ];
  const corporateProposals: ProposalRow[] = proposals.slice(0, 6).map((proposal) => ({
    project: proposal.title,
    ngo: proposal.ngo_name,
    sector: proposal.sector,
    district: proposal.district,
    requested: formatCurrency(proposal.requested_amount),
    beneficiaries: proposal.beneficiaries.toLocaleString("en-IN"),
    status: proposal.status,
    updated: new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(proposal.updated_at)),
  }));

  return (
    <AppShell profile={profile} role="corporate" pageTitle="Corporate Overview">
      <div className="mx-auto max-w-[1500px]">
        <section className="animate-rise relative overflow-hidden rounded-[24px] border border-slate-200 bg-[#0c211d] px-6 py-8 text-white shadow-[0_22px_60px_rgba(8,22,19,.12)] sm:px-9 sm:py-10 lg:px-11">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <div className="absolute -right-16 -top-28 size-72 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="relative max-w-3xl">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-emerald-300 uppercase"><span className="h-px w-8 bg-emerald-400/60" /> Allocation command center</p>
            <h1 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-[44px]">Good evening, CSR Team.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">Turn your CSR budget into a measurable, balanced portfolio of impact.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#portfolio-analytics" className="group inline-flex items-center gap-2 rounded-xl bg-emerald-300 px-5 py-3 text-xs font-extrabold tracking-[0.08em] text-emerald-950 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-200 active:translate-y-0">OPTIMIZE ₹1 CRORE <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></Link>
              <Link href="#recent-proposals" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:bg-white/10">VIEW PROPOSALS</Link>
            </div>
          </div>
          <div className="absolute bottom-5 right-7 hidden gap-8 text-[9px] font-semibold tracking-[0.18em] text-emerald-100/25 uppercase lg:flex"><span>Allocation</span><span>Impact</span><span>Equity</span></div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {corporateMetrics.map((metric, index) => <MetricCard key={metric.label} {...metric} index={index} icon={metricIcons[index]} />)}
        </section>

        {error ? <DashboardCard className="mt-6 border-rose-200 p-5"><p className="font-bold text-rose-800">Proposal data could not be loaded</p><p className="mt-1 text-sm text-rose-600">Refresh the page in a moment. No records have been changed.</p></DashboardCard> : null}

        <section id="portfolio-analytics" className="mt-10 scroll-mt-28">
          <SectionHeader eyebrow="Portfolio intelligence" title="Visual Analytics" action={<p className="hidden text-xs text-slate-500 sm:block">Live Supabase pipeline</p>} />
          <div className="grid gap-5 xl:grid-cols-2">
            <FundingSectorChart data={fundingBySector} />
            <ProposalDistributionChart data={proposalDistribution} />
            <div className="xl:col-span-2"><DistrictProjectsChart data={districtProjects} /></div>
          </div>
        </section>

        <section id="recent-proposals" className="mt-10 scroll-mt-28 pb-6"><ProposalTable proposals={corporateProposals} /></section>
      </div>
    </AppShell>
  );
}
