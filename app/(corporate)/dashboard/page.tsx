import { ArrowRight, FileStack, IndianRupee, UsersRound, WalletCards } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DistrictProjectsChart, FundingSectorChart, ProposalDistributionChart } from "@/components/dashboard-charts";
import { MetricCard, SectionHeader } from "@/components/dashboard-ui";
import { ProposalTable } from "@/components/proposal-table";
import { corporateMetrics, corporateProposals } from "@/lib/data/dashboard";
import { requireRole } from "@/lib/auth/session";

const metricIcons = [WalletCards, FileStack, IndianRupee, UsersRound];

export default async function CorporateDashboardPage() {
  const { profile } = await requireRole("corporate");

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

        <section id="portfolio-analytics" className="mt-10 scroll-mt-28">
          <SectionHeader eyebrow="Portfolio intelligence" title="Visual Analytics" action={<p className="hidden text-xs text-slate-500 sm:block">Demo data · Phase 2</p>} />
          <div className="grid gap-5 xl:grid-cols-2">
            <FundingSectorChart />
            <ProposalDistributionChart />
            <div className="xl:col-span-2"><DistrictProjectsChart /></div>
          </div>
        </section>

        <section id="recent-proposals" className="mt-10 scroll-mt-28 pb-6"><ProposalTable proposals={corporateProposals} /></section>
      </div>
    </AppShell>
  );
}
