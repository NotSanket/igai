import { ArrowLeft, CalendarDays, IndianRupee, MapPin, Pencil, UsersRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { AppShell } from "@/components/app-shell";
import { DashboardCard, StatusBadge } from "@/components/dashboard-ui";
import { ProposalForm } from "@/components/proposals/proposal-form";
import { requireRole } from "@/lib/auth/session";
import { formatCurrency, normalizeProposal } from "@/lib/proposals/format";
import type { ProposalFormValues } from "@/lib/proposals/schema";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/types/database";

export default async function ProposalDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const { user, profile } = await requireRole("ngo");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle<Proposal>();

  if (!data && !error) notFound();

  if (error) {
    return <AppShell profile={profile} role="ngo" pageTitle="Proposal"><DashboardCard className="mx-auto max-w-3xl border-rose-200 p-6"><p className="font-bold text-rose-800">This proposal could not be loaded</p><p className="mt-1 text-sm text-rose-600">Refresh the page in a moment. No data has been changed.</p></DashboardCard></AppShell>;
  }

  const proposal = normalizeProposal(data!);
  const { edit } = await searchParams;

  if (edit === "1") {
    return (
      <AppShell profile={profile} role="ngo" pageTitle="Edit Proposal">
        <div className="mx-auto max-w-5xl">
          <div className="mb-7"><p className="text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">Update submission</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Edit proposal</h1><p className="mt-3 text-sm text-slate-600">Changes will update this proposal while preserving its current review status.</p></div>
          <ProposalForm mode="edit" proposalId={proposal.id} initialValues={{ title: proposal.title, description: proposal.description ?? "", sector: proposal.sector as ProposalFormValues["sector"], requested_amount: proposal.requested_amount, beneficiaries: proposal.beneficiaries, state: proposal.state, district: proposal.district, duration_months: proposal.duration_months ?? 12, impact_statement: proposal.impact_statement ?? "", evidence_description: proposal.evidence_description ?? "" }} />
        </div>
      </AppShell>
    );
  }

  const facts = [
    { label: "Funding requested", value: formatCurrency(proposal.requested_amount), icon: IndianRupee },
    { label: "Expected reach", value: proposal.beneficiaries.toLocaleString("en-IN"), icon: UsersRound },
    { label: "Duration", value: `${proposal.duration_months ?? "—"} months`, icon: CalendarDays },
    { label: "Location", value: `${proposal.district}, ${proposal.state}`, icon: MapPin },
  ];
  const scores = [
    ["Impact", proposal.impact_score], ["Geographic need", proposal.geo_need_score], ["Feasibility", proposal.feasibility_score], ["Risk", proposal.risk_score], ["Evidence", proposal.evidence_score],
  ] as const;

  return (
    <AppShell profile={profile} role="ngo" pageTitle="Proposal Detail">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><Link href="/ngo/proposals" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-800"><ArrowLeft className="size-4" /> All proposals</Link><Link href={`/ngo/proposals/${proposal.id}?edit=1`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800"><Pencil className="size-4" /> Edit proposal</Link></div>
        <DashboardCard className="p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">Project overview</p><h1 className="mt-2 max-w-3xl text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">{proposal.title}</h1><p className="mt-3 text-sm font-semibold text-slate-700">{proposal.ngo_name}</p><p className="mt-1 text-xs text-slate-500">{proposal.sector} · {proposal.district}, {proposal.state} · Submitted {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(proposal.created_at))}</p></div><StatusBadge status={proposal.status} /></div>
          <p className="mt-7 max-w-4xl whitespace-pre-wrap text-sm leading-7 text-slate-600">{proposal.description}</p>
        </DashboardCard>
        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{facts.map(({ label, value, icon: Icon }) => <DashboardCard key={label} className="p-5"><span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="size-4" /></span><p className="mt-5 text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">{label}</p><p className="mt-1 font-bold text-slate-900">{value}</p></DashboardCard>)}</section>
        <section className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <DashboardCard className="p-6 sm:p-8"><p className="text-[10px] font-bold tracking-[0.18em] text-emerald-700 uppercase">Impact</p><h2 className="mt-1 text-lg font-bold text-slate-950">Supporting narrative</h2><div className="mt-5 space-y-6"><div><p className="text-xs font-bold text-slate-500 uppercase">Impact statement</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{proposal.impact_statement || "No impact statement added yet."}</p></div><div><p className="text-xs font-bold text-slate-500 uppercase">Evidence description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{proposal.evidence_description || "No evidence description added yet."}</p></div></div></DashboardCard>
          <DashboardCard className="p-6 sm:p-8"><p className="text-[10px] font-bold tracking-[0.18em] text-emerald-700 uppercase">Initial assessment</p><h2 className="mt-1 text-lg font-bold text-slate-950">Deterministic scores</h2><p className="mt-2 text-xs leading-5 text-slate-500">Rule-based indicators only. No AI is used.</p><div className="mt-5 space-y-4">{scores.map(([label, score]) => <div key={label}><div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold text-slate-600">{label}</span><span className="font-bold text-slate-900">{score ?? "—"}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${score ?? 0}%` }} /></div></div>)}</div></DashboardCard>
        </section>
      </div>
    </AppShell>
  );
}
