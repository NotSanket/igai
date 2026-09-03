import type { Proposal } from "../../types/database";
import type { ScoredProject, ScoringContext, StrategyPreset } from "./types";

const clamp = (value: number) => Math.max(0, Math.min(100, value));
const round = (value: number) => Math.round(value * 10) / 10;
const finiteNumber = (value: number | null | undefined, fallback = 0) => value !== null && value !== undefined && Number.isFinite(Number(value)) ? Number(value) : fallback;

function costPerBeneficiary(proposal: Proposal) {
  const amount = finiteNumber(proposal.requested_amount);
  const beneficiaries = finiteNumber(proposal.beneficiaries);
  return amount > 0 && beneficiaries > 0 ? amount / beneficiaries : null;
}

export function createScoringContext(proposals: Proposal[]): ScoringContext {
  const costs = proposals.map(costPerBeneficiary).filter((value): value is number => value !== null && Number.isFinite(value));
  return {
    maxBeneficiaries: Math.max(1, ...proposals.map(({ beneficiaries }) => finiteNumber(beneficiaries))),
    maxRequestedAmount: Math.max(1, ...proposals.map(({ requested_amount }) => finiteNumber(requested_amount))),
    minCostPerBeneficiary: costs.length ? Math.min(...costs) : 0,
    maxCostPerBeneficiary: costs.length ? Math.max(...costs) : 1,
  };
}

function normalizeCostEfficiency(cost: number | null, context: ScoringContext) {
  if (cost === null) return 0;
  const range = context.maxCostPerBeneficiary - context.minCostPerBeneficiary;
  return range <= 0 ? 100 : clamp(100 * (context.maxCostPerBeneficiary - cost) / range);
}

function alignmentFor(proposal: Proposal, preset: StrategyPreset) {
  if (preset.preferredSectors.length === 0) return 75;
  return preset.preferredSectors.includes(proposal.sector) ? 100 : 45;
}

export function scoreProject(proposal: Proposal, context: ScoringContext, preset: StrategyPreset): ScoredProject {
  const amount = finiteNumber(proposal.requested_amount);
  const beneficiaries = finiteNumber(proposal.beneficiaries);
  const cost = costPerBeneficiary(proposal);
  const costEfficiency = normalizeCostEfficiency(cost, context);
  const existingRisk = clamp(finiteNumber(proposal.risk_score, 60));
  const evidence = clamp(finiteNumber(proposal.evidence_score));
  const incompleteFields = [proposal.description, proposal.district, proposal.sector, proposal.duration_months, proposal.impact_score, proposal.geo_need_score, proposal.feasibility_score, proposal.evidence_score].filter((value) => value === null || value === undefined || value === "").length;
  const costRisk = 100 - costEfficiency;
  const sizeRisk = clamp(amount / context.maxRequestedAmount * 100);
  const durationRisk = clamp(finiteNumber(proposal.duration_months) / 48 * 100);
  const calculatedRisk = clamp(existingRisk * 0.5 + costRisk * 0.15 + sizeRisk * 0.1 + durationRisk * 0.08 + (100 - evidence) * 0.12 + clamp(incompleteFields * 12.5) * 0.05);
  const metrics = {
    expectedImpact: clamp(finiteNumber(proposal.impact_score)),
    beneficiaryReach: clamp(Math.sqrt(Math.max(0, beneficiaries) / context.maxBeneficiaries) * 100),
    costEfficiency,
    geographicNeed: clamp(finiteNumber(proposal.geo_need_score)),
    corporateAlignment: alignmentFor(proposal, preset),
    feasibility: clamp(finiteNumber(proposal.feasibility_score)),
    evidenceConfidence: evidence,
    calculatedRisk,
  };
  const weights = preset.projectWeights;
  const score =
    metrics.expectedImpact * weights.impact +
    metrics.beneficiaryReach * weights.reach +
    metrics.costEfficiency * weights.costEfficiency +
    metrics.geographicNeed * weights.geographicNeed +
    metrics.corporateAlignment * weights.alignment +
    metrics.feasibility * weights.feasibility +
    metrics.evidenceConfidence * weights.evidence +
    (100 - metrics.calculatedRisk) * weights.risk;
  const riskLevel = calculatedRisk < 35 ? "LOW" : calculatedRisk < 60 ? "MEDIUM" : "HIGH";

  return {
    proposal,
    score: round(clamp(score)),
    costPerBeneficiary: cost === null ? null : round(cost),
    riskScore: round(calculatedRisk),
    riskLevel,
    eligible: amount > 0,
    metrics: {
      expectedImpact: round(metrics.expectedImpact),
      beneficiaryReach: round(metrics.beneficiaryReach),
      costEfficiency: round(metrics.costEfficiency),
      geographicNeed: round(metrics.geographicNeed),
      corporateAlignment: round(metrics.corporateAlignment),
      feasibility: round(metrics.feasibility),
      evidenceConfidence: round(metrics.evidenceConfidence),
      calculatedRisk: round(metrics.calculatedRisk),
    },
    explanation: "",
  };
}

export function scoreProjects(proposals: Proposal[], preset: StrategyPreset) {
  const context = createScoringContext(proposals);
  return proposals.map((proposal) => scoreProject(proposal, context, preset));
}
