import { calculateEquity } from "./equity";
import { buildPortfolioStory, explainDeferredProject, explainSelectedProject } from "./explain";
import { getStrategyPreset } from "./presets";
import { scoreProjects } from "./score-project";
import type { OptimizerStrategy, PortfolioComponents, PortfolioResult, ScoredProject } from "./types";
import type { Proposal } from "../../types/database";

const round = (value: number) => Math.round(value * 10) / 10;
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

export interface CandidateResult {
  selected: ScoredProject[];
  spent: number;
  beneficiaries: number;
  portfolioScore: number;
  averageRisk: number;
  equity: ReturnType<typeof calculateEquity>;
  components: PortfolioComponents;
}

export function evaluateCandidate(selected: ScoredProject[], all: ScoredProject[], spent: number, beneficiaries: number, equityGuardrail: boolean, strategy: OptimizerStrategy): CandidateResult {
  if (selected.length === 0) {
    return { selected, spent: 0, beneficiaries: 0, portfolioScore: 0, averageRisk: 0, equity: calculateEquity([], all), components: { quality: 0, impact: 0, reach: 0, equity: 0, safety: 0 } };
  }

  const preset = getStrategyPreset(strategy);
  const equity = calculateEquity(selected, all);
  const totalDatasetImpact = all.reduce((sum, project) => sum + project.metrics.expectedImpact, 0);
  const totalDatasetReach = all.reduce((sum, project) => sum + Math.max(0, project.proposal.beneficiaries), 0);
  const aggregateImpact = totalDatasetImpact ? selected.reduce((sum, project) => sum + project.metrics.expectedImpact, 0) / totalDatasetImpact * 100 : 0;
  const reach = totalDatasetReach ? beneficiaries / totalDatasetReach * 100 : 0;
  const quality = average(selected.map(({ score }) => score));
  const averageRisk = spent > 0 ? selected.reduce((sum, project) => sum + project.riskScore * project.proposal.requested_amount, 0) / spent : average(selected.map(({ riskScore }) => riskScore));
  const safety = 100 - averageRisk;
  const weights = preset.portfolioWeights;
  const equityWeight = equityGuardrail ? preset.equityWeight : 0;
  const denominator = Object.values(weights).reduce((sum, value) => sum + value, 0) + equityWeight;
  const score = (
    quality * weights.quality +
    aggregateImpact * weights.aggregateImpact +
    reach * weights.reach +
    equity.districtCoverage * weights.districtCoverage +
    equity.sectorCoverage * weights.sectorCoverage +
    safety * weights.safety +
    equity.equityScore * equityWeight
  ) / denominator;

  return {
    selected,
    spent,
    beneficiaries,
    portfolioScore: round(score),
    averageRisk: round(averageRisk),
    equity,
    components: { quality: round(quality), impact: round(aggregateImpact), reach: round(reach), equity: equity.equityScore, safety: round(safety) },
  };
}

export function optimizePortfolio(proposals: Proposal[], budget: number, strategy: OptimizerStrategy = "balanced", equityGuardrail = true): PortfolioResult {
  if (!Number.isFinite(budget) || budget <= 0) throw new Error("A positive finite budget is required.");
  if (proposals.length > 24) throw new Error("Exhaustive demo optimization supports up to 24 proposals.");

  const preset = getStrategyPreset(strategy);
  const projectScores = scoreProjects(proposals, preset);
  const candidatePortfoliosEvaluated = 2 ** projectScores.length;
  let best = evaluateCandidate([], projectScores, 0, 0, equityGuardrail, strategy);

  for (let mask = 1; mask < candidatePortfoliosEvaluated; mask += 1) {
    const selected: ScoredProject[] = [];
    let spent = 0;
    let beneficiaries = 0;
    let valid = true;

    for (let index = 0; index < projectScores.length; index += 1) {
      if ((mask & (2 ** index)) === 0) continue;
      const project = projectScores[index];
      if (!project.eligible) { valid = false; break; }
      spent += project.proposal.requested_amount;
      if (spent > budget) { valid = false; break; }
      beneficiaries += Math.max(0, project.proposal.beneficiaries);
      selected.push(project);
    }

    if (!valid) continue;
    const candidate = evaluateCandidate(selected, projectScores, spent, beneficiaries, equityGuardrail, strategy);
    const isBetter = candidate.portfolioScore > best.portfolioScore + 0.0001 ||
      (Math.abs(candidate.portfolioScore - best.portfolioScore) <= 0.0001 && candidate.beneficiaries > best.beneficiaries) ||
      (Math.abs(candidate.portfolioScore - best.portfolioScore) <= 0.0001 && candidate.beneficiaries === best.beneficiaries && candidate.spent < best.spent);
    if (isBetter) best = candidate;
  }

  const selectedIds = new Set(best.selected.map(({ proposal }) => proposal.id));
  const selectedProjects = best.selected.map((project) => ({ ...project, explanation: explainSelectedProject(project) }));
  const deferredProjects = projectScores.filter(({ proposal }) => !selectedIds.has(proposal.id)).map((project) => ({ ...project, explanation: explainDeferredProject(project, budget - best.spent) }));
  const explanations = Object.fromEntries([...selectedProjects, ...deferredProjects].map(({ proposal, explanation }) => [proposal.id, explanation]));
  const result: PortfolioResult = {
    selectedProjects,
    deferredProjects,
    totalSpent: best.spent,
    remainingBudget: budget - best.spent,
    totalBeneficiaries: best.beneficiaries,
    portfolioScore: best.portfolioScore,
    equityScore: best.equity.equityScore,
    districtCoverage: best.equity.districtCoverage,
    sectorCoverage: best.equity.sectorCoverage,
    districtsRepresented: best.equity.districtsRepresented,
    averageRisk: best.averageRisk,
    candidatePortfoliosEvaluated,
    strategy,
    strategyLabel: preset.label,
    equityGuardrail,
    projectScores,
    explanations,
    portfolioStory: "",
    components: best.components,
  };
  result.portfolioStory = buildPortfolioStory(result);
  return result;
}
