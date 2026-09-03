import { ArrowUpRight, Pencil } from "lucide-react";
import Link from "next/link";

import { EmptyState, StatusBadge } from "@/components/dashboard-ui";
import { formatCurrency } from "@/lib/proposals/format";
import type { Proposal } from "@/types/database";

export function ProposalList({ proposals, emptyAction = true }: { proposals: Proposal[]; emptyAction?: boolean }) {
  if (proposals.length === 0) {
    return (
      <EmptyState
        title="No proposals submitted yet"
        description="Create your first funding proposal and it will appear here."
        action={emptyAction ? <Link href="/ngo/proposals/new" className="inline-flex rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">Submit a proposal</Link> : undefined}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,.04)]">
      <table className="w-full min-w-[1180px] text-left">
        <thead className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold tracking-[0.16em] text-slate-500 uppercase">
          <tr><th className="px-6 py-4">Project</th><th className="px-4 py-4">Sector</th><th className="px-4 py-4">District</th><th className="px-4 py-4">Funding</th><th className="px-4 py-4">Beneficiaries</th><th className="px-4 py-4">Duration</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Last updated</th><th className="px-6 py-4 text-right">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {proposals.map((proposal) => (
            <tr key={proposal.id} className="group transition hover:bg-emerald-50/30">
              <td className="px-6 py-5"><Link href={`/ngo/proposals/${proposal.id}`} className="font-bold text-slate-900 transition group-hover:text-emerald-800">{proposal.title}</Link><p className="mt-1 text-xs text-slate-500">{proposal.state}</p></td>
              <td className="px-4 py-5 text-sm text-slate-600">{proposal.sector}</td>
              <td className="px-4 py-5 text-sm text-slate-600">{proposal.district}</td>
              <td className="px-4 py-5 text-sm font-semibold text-slate-800">{formatCurrency(proposal.requested_amount)}</td>
              <td className="px-4 py-5 text-sm text-slate-600">{proposal.beneficiaries.toLocaleString("en-IN")}</td>
              <td className="px-4 py-5 text-sm text-slate-600">{proposal.duration_months ?? "—"} mo</td>
              <td className="px-4 py-5"><StatusBadge status={proposal.status} /></td>
              <td className="px-4 py-5 text-xs text-slate-500">{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(proposal.updated_at))}</td>
              <td className="px-6 py-5"><div className="flex justify-end gap-2"><Link href={`/ngo/proposals/${proposal.id}?edit=1`} aria-label={`Edit ${proposal.title}`} className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"><Pencil className="size-4" /></Link><Link href={`/ngo/proposals/${proposal.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800">View <ArrowUpRight className="size-3.5" /></Link></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
