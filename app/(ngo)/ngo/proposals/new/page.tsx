import { AppShell } from "@/components/app-shell";
import { ProposalForm } from "@/components/proposals/proposal-form";
import { requireRole } from "@/lib/auth/session";

export default async function NewProposalPage() {
  const { profile } = await requireRole("ngo");

  return (
    <AppShell profile={profile} role="ngo" pageTitle="Submit Proposal">
      <div className="mx-auto max-w-5xl">
        <div className="mb-7"><p className="text-[10px] font-bold tracking-[0.2em] text-emerald-700 uppercase">New submission</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Create a funding proposal</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Share a clear plan, realistic reach, and the funding needed. You can edit the proposal after submission.</p></div>
        <ProposalForm mode="create" />
      </div>
    </AppShell>
  );
}
