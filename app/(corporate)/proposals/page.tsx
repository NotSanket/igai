import { AppShell } from "@/components/app-shell";
import { DashboardCard } from "@/components/dashboard-ui";
import { CorporateProposalBrowser } from "@/components/proposals/corporate-proposal-browser";
import { requireRole } from "@/lib/auth/session";
import { normalizeProposal } from "@/lib/proposals/format";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/types/database";

export default async function CorporateProposalsPage() {
  const { profile } = await requireRole("corporate");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .in("status", ["submitted", "under_review"])
    .order("updated_at", { ascending: false });
  const proposals = ((data ?? []) as Proposal[]).map(normalizeProposal);

  return (
    <AppShell profile={profile} role="corporate" pageTitle="Proposal Pipeline">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7">
          <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">Live funding pipeline</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Corporate proposals</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Browse submitted projects available for CSR portfolio evaluation. Proposal content remains controlled by the submitting NGO.</p>
        </div>

        {error ? (
          <DashboardCard className="border-rose-200 p-6">
            <p className="font-bold text-rose-800">Proposals could not be loaded</p>
            <p className="mt-1 text-sm text-rose-600">Refresh the page in a moment. No records have been changed.</p>
          </DashboardCard>
        ) : (
          <CorporateProposalBrowser proposals={proposals} />
        )}
      </div>
    </AppShell>
  );
}
