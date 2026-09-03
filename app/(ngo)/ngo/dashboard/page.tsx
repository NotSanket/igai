import { ArrowRight, CircleCheckBig, FileStack, Send, UsersRound } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DashboardCard, MetricCard, SectionHeader } from "@/components/dashboard-ui";
import { ProposalList } from "@/components/proposals/proposal-list";
import { requireRole } from "@/lib/auth/session";
import { normalizeProposal } from "@/lib/proposals/format";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/types/database";

const metricIcons = [FileStack, Send, CircleCheckBig, UsersRound];

export default async function NgoDashboardPage() {
  const { user, profile } = await requireRole("ngo");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });
  const proposals = ((data ?? []) as Proposal[]).map(normalizeProposal);
  const selected = proposals.filter(({ status }) => status === "selected").length;
  const submitted = proposals.filter(({ status }) => status === "submitted" || status === "under_review").length;
  const beneficiaries = proposals.reduce((total, proposal) => total + proposal.beneficiaries, 0);
  const ngoMetrics = [
    { label: "Total proposals", value: proposals.length.toLocaleString("en-IN"), context: "All projects in your funding pipeline" },
    { label: "Submitted", value: submitted.toLocaleString("en-IN"), context: "Awaiting or undergoing review" },
    { label: "Selected", value: selected.toLocaleString("en-IN"), context: "Projects selected for funding" },
    { label: "Potential beneficiaries", value: beneficiaries.toLocaleString("en-IN"), context: "Beneficiaries across all proposals" },
  ];

  return (
    <AppShell profile={profile} role="ngo" pageTitle="NGO Overview">
      <div className="mx-auto max-w-[1500px]">
        <section className="animate-rise relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,.06)] sm:px-9 sm:py-10 lg:px-11">
          <div className="absolute inset-y-0 right-0 hidden w-[36%] bg-[linear-gradient(135deg,transparent,rgba(16,185,129,.08))] lg:block" />
          <div className="absolute right-16 top-1/2 hidden size-36 -translate-y-1/2 rounded-full border border-dashed border-emerald-200 lg:block" /><div className="absolute right-[7.7rem] top-1/2 hidden size-14 -translate-y-1/2 rounded-full border border-emerald-100 bg-emerald-50 lg:block" />
          <div className="relative max-w-3xl">
            <p className="mb-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase"><span className="h-px w-8 bg-emerald-500" /> Partner workspace</p>
            <h1 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-[44px]">Welcome back.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">Track your submitted projects and their journey toward funding.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ngo/proposals/new" className="group inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-extrabold tracking-[0.08em] text-white transition hover:-translate-y-0.5 hover:bg-emerald-800 active:translate-y-0">SUBMIT NEW PROPOSAL <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></Link>
              <Link href="/ngo/proposals" className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold tracking-[0.08em] text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50">VIEW MY PROPOSALS</Link>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{ngoMetrics.map((metric, index) => <MetricCard key={metric.label} {...metric} index={index} icon={metricIcons[index]} />)}</section>

        <section id="my-proposals" className="mt-10 scroll-mt-28 pb-6">
          <SectionHeader eyebrow="Recent activity" title="Latest proposals" action={<Link href="/ngo/proposals" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">View all</Link>} />
          {error ? <DashboardCard className="border-rose-200 p-6"><p className="font-bold text-rose-800">Dashboard data could not be loaded</p><p className="mt-1 text-sm text-rose-600">Refresh the page in a moment. Your data is safe.</p></DashboardCard> : <ProposalList proposals={proposals.slice(0, 4)} />}
        </section>
      </div>
    </AppShell>
  );
}
