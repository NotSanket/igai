import type { PortfolioResult, ScoredProject } from "./types";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const integer = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

export function explainSelectedProject(project: ScoredProject) {
  const reasons: string[] = [];
  if (project.metrics.expectedImpact >= 85) reasons.push(`expected impact is ${Math.round(project.metrics.expectedImpact)}/100`);
  if (project.metrics.beneficiaryReach >= 70) reasons.push(`it reaches ${integer(project.proposal.beneficiaries)} beneficiaries`);
  if (project.metrics.costEfficiency >= 75 && project.costPerBeneficiary !== null) reasons.push(`${money(project.proposal.requested_amount)} equates to ${money(project.costPerBeneficiary)} per beneficiary`);
  if (project.metrics.geographicNeed >= 85) reasons.push(`${project.proposal.district} has a geographic-need score of ${Math.round(project.metrics.geographicNeed)}/100`);
  if (project.riskLevel === "LOW") reasons.push(`calculated risk is low at ${Math.round(project.riskScore)}/100`);
  if (reasons.length === 0) reasons.push(`its weighted project score is ${Math.round(project.score)}/100`);
  return `Selected because ${reasons.slice(0, 2).join(" and ")}.`;
}

export function explainDeferredProject(project: ScoredProject, remainingBudget: number) {
  if (!project.eligible) return "Deferred because the proposal does not contain a valid positive requested amount.";
  if (project.proposal.requested_amount > remainingBudget) return `Deferred because its ${money(project.proposal.requested_amount)} request exceeds the ${money(remainingBudget)} remaining after the stronger portfolio combination.`;
  return `Deferred because the exhaustive search found a combination with a higher overall portfolio score; this project scored ${Math.round(project.score)}/100.`;
}

export function buildPortfolioStory(result: Pick<PortfolioResult, "totalSpent" | "selectedProjects" | "totalBeneficiaries" | "equityScore" | "districtsRepresented" | "strategyLabel">) {
  return `Using the ${result.strategyLabel} strategy, IGAI allocated ${money(result.totalSpent)} across ${result.selectedProjects.length} projects, reaching ${integer(result.totalBeneficiaries)} beneficiaries across ${result.districtsRepresented.length} districts while maintaining an equity score of ${Math.round(result.equityScore)}/100.`;
}
