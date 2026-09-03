import { Plus } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { DashboardCard, SectionHeader } from "@/components/dashboard-ui";
import { ProposalList } from "@/components/proposals/proposal-list";
import { requireRole } from "@/lib/auth/session";
import { normalizeProposal } from "@/lib/proposals/format";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/types/database";

export default async function NgoProposalsPage() {
  const { user, profile } = await requireRole("ngo");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });
  const proposals = ((data ?? []) as Proposal[]).map(normalizeProposal);

  return (
    <AppShell profile={profile} role="ngo" pageTitle="My Proposals">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">Funding pipeline</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">My proposals</h1><p className="mt-2 text-sm text-slate-500">Review, update, and track every project submitted by your organisation.</p></div>
          <Link href="/ngo/proposals/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800"><Plus className="size-4" /> New proposal</Link>
        </div>
        {error ? (
          <DashboardCard className="border-rose-200 p-6"><p className="font-bold text-rose-800">Proposals could not be loaded</p><p className="mt-1 text-sm text-rose-600">Refresh the page in a moment. Your saved data has not been changed.</p></DashboardCard>
        ) : (
          <section><SectionHeader eyebrow={`${proposals.length} total`} title="Submitted projects" /><ProposalList proposals={proposals} /></section>
        )}
      </div>
    </AppShell>
  );
}
