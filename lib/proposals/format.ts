import type { Proposal } from "@/types/database";

export const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value));

export function normalizeProposal(proposal: Proposal): Proposal {
  return {
    ...proposal,
    requested_amount: Number(proposal.requested_amount),
    beneficiaries: Number(proposal.beneficiaries),
    duration_months: proposal.duration_months === null ? null : Number(proposal.duration_months),
    impact_score: proposal.impact_score === null ? null : Number(proposal.impact_score),
    geo_need_score: proposal.geo_need_score === null ? null : Number(proposal.geo_need_score),
    feasibility_score: proposal.feasibility_score === null ? null : Number(proposal.feasibility_score),
    risk_score: proposal.risk_score === null ? null : Number(proposal.risk_score),
    evidence_score: proposal.evidence_score === null ? null : Number(proposal.evidence_score),
  };
}
