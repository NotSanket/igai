import { ArrowUpRight } from "lucide-react";

import { DashboardCard, SectionHeader, StatusBadge } from "@/components/dashboard-ui";
import type { ProposalRow } from "@/lib/data/dashboard";

export function ProposalTable({ proposals, ngo = false }: { proposals: ProposalRow[]; ngo?: boolean }) {
  return (
    <DashboardCard className="p-5 sm:p-6">
      <SectionHeader eyebrow="Live pipeline" title={ngo ? "My Proposals" : "Recent Proposals"} action={<button className="flex items-center gap-1 text-xs font-bold text-emerald-700 transition hover:gap-2">View all <ArrowUpRight className="size-3.5" /></button>} />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-left">
          <thead><tr className="border-b border-slate-200 text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase"><th className="pb-3 pr-5">Project</th>{!ngo ? <th className="px-3 pb-3">NGO</th> : null}<th className="px-3 pb-3">Sector</th>{!ngo ? <th className="px-3 pb-3">District</th> : null}<th className="px-3 pb-3">Requested</th><th className="px-3 pb-3">Beneficiaries</th><th className="px-3 pb-3">Status</th>{ngo ? <th className="pl-3 pb-3">Last Updated</th> : null}</tr></thead>
          <tbody>{proposals.map((proposal) => <tr key={proposal.project} className="group border-b border-slate-100 text-sm transition last:border-0 hover:bg-slate-50/70"><td className="py-4 pr-5"><p className="max-w-[240px] font-semibold text-slate-900 group-hover:text-emerald-800">{proposal.project}</p></td>{!ngo ? <td className="px-3 py-4 text-xs text-slate-600">{proposal.ngo}</td> : null}<td className="px-3 py-4 text-xs text-slate-600">{proposal.sector}</td>{!ngo ? <td className="px-3 py-4 text-xs text-slate-600">{proposal.district}</td> : null}<td className="px-3 py-4 font-mono text-xs font-semibold text-slate-800">{proposal.requested}</td><td className="px-3 py-4 text-xs text-slate-600">{proposal.beneficiaries}</td><td className="px-3 py-4"><StatusBadge status={proposal.status} /></td>{ngo ? <td className="pl-3 py-4 text-xs text-slate-500">{proposal.updated}</td> : null}</tr>)}</tbody>
        </table>
      </div>
    </DashboardCard>
  );
}
