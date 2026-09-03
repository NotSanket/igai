import { DEFAULT_TAMIL_NADU_COORDINATES, TAMIL_NADU_DISTRICTS } from "@/lib/proposals/constants";
import type { ValidatedProposalValues } from "@/lib/proposals/schema";

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function getDistrictCoordinates(districtName: string) {
  const district = TAMIL_NADU_DISTRICTS.find(({ name }) => name === districtName);
  return district
    ? { latitude: district.latitude, longitude: district.longitude }
    : DEFAULT_TAMIL_NADU_COORDINATES;
}

export function calculateInitialScores(proposal: ValidatedProposalValues) {
  const reach = Math.min(28, Math.log10(proposal.beneficiaries + 1) * 8);
  const costPerBeneficiary = proposal.requested_amount / proposal.beneficiaries;
  const deliveryFit = proposal.duration_months <= 36 ? 16 : 10;
  const narrativeDepth = Math.min(16, proposal.description.length / 80);
  const evidenceDepth = proposal.evidence_description ? Math.min(30, 10 + proposal.evidence_description.length / 25) : 8;
  const impactDepth = proposal.impact_statement ? Math.min(18, 6 + proposal.impact_statement.length / 40) : 5;

  return {
    impact_score: clamp(42 + reach + impactDepth),
    geo_need_score: clamp(58 + (proposal.district.charCodeAt(0) % 19)),
    feasibility_score: clamp(48 + deliveryFit + Math.max(0, 24 - costPerBeneficiary / 2500)),
    risk_score: clamp(100 - (45 + deliveryFit + (proposal.evidence_description ? 14 : 4))),
    evidence_score: clamp(38 + evidenceDepth + narrativeDepth),
  };
}
