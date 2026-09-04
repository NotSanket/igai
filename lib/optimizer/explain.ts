import type { OptimizerStrategy, PortfolioResult, ScoredProject } from "./types";

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
const integer = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const rounded = (value: number) => Math.round(value);

export interface DeferredExplanationContext {
  budget: number;
  remainingBudget: number;
  strategy: OptimizerStrategy;
  equityGuardrail: boolean;
  selectedProjects: ScoredProject[];
  portfolioScore: number;
}

interface DeferredReason {
  strength: number;
  priority: number;
  text: string;
}

const strategyLabels: Record<OptimizerStrategy, string> = {
  balanced: "Balanced",
  "maximum-impact": "Maximum Impact",
  "maximum-reach": "Maximum Reach",
  "rural-first": "Rural First",
  "healthcare-first": "Healthcare First",
  "low-risk": "Low Risk",
  "maximum-equity": "Maximum Equity",
};

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

export function explainDeferredProject(project: ScoredProject, context: DeferredExplanationContext) {
  if (!project.eligible) return "Deferred because the proposal does not contain a valid positive requested amount.";

  const selected = context.selectedProjects;
  if (selected.length === 0) {
    return `Deferred because exhaustive evaluation found no eligible combination within the ${money(context.budget)} budget.`;
  }

  const reasons: DeferredReason[] = [];
  const addReason = (strength: number, priority: number, text: string) => reasons.push({ strength, priority, text });
  const selectedAverage = (read: (selectedProject: ScoredProject) => number) => average(selected.map(read));
  const strategyLabel = strategyLabels[context.strategy];

  const strategyComparison = context.strategy === "maximum-reach"
    ? { label: "reach", projectValue: project.metrics.beneficiaryReach, selectedValue: selectedAverage(({ metrics }) => metrics.beneficiaryReach) }
    : context.strategy === "maximum-impact"
      ? { label: "impact", projectValue: project.metrics.expectedImpact, selectedValue: selectedAverage(({ metrics }) => metrics.expectedImpact) }
      : context.strategy === "rural-first" || context.strategy === "maximum-equity"
        ? { label: "geographic need", projectValue: project.metrics.geographicNeed, selectedValue: selectedAverage(({ metrics }) => metrics.geographicNeed) }
        : context.strategy === "healthcare-first"
          ? { label: "healthcare alignment", projectValue: project.metrics.corporateAlignment, selectedValue: selectedAverage(({ metrics }) => metrics.corporateAlignment) }
          : null;

  if (strategyComparison) {
    const gap = strategyComparison.selectedValue - strategyComparison.projectValue;
    if (gap >= 8) {
      addReason(
        100 + gap,
        0,
        `Under ${strategyLabel}, selected projects averaged ${rounded(strategyComparison.selectedValue)}/100 ${strategyComparison.label} versus ${rounded(strategyComparison.projectValue)}/100 here, making them the closer strategy fit.`,
      );
    }
  }

  if (context.strategy === "low-risk") {
    const selectedRisk = selectedAverage(({ riskScore }) => riskScore);
    const gap = project.riskScore - selectedRisk;
    if (gap >= 8) {
      addReason(
        100 + gap,
        0,
        `Under Low Risk, selected projects averaged ${rounded(selectedRisk)}/100 calculated risk versus ${rounded(project.riskScore)}/100 here, offering the stronger safety fit.`,
      );
    }
  }

  const district = project.proposal.district.trim();
  const selectedInDistrict = district
    ? selected.filter(({ proposal }) => proposal.district.trim().toLocaleLowerCase() === district.toLocaleLowerCase()).length
    : 0;
  if (context.equityGuardrail && selectedInDistrict > 0) {
    addReason(
      96 + Math.min(9, selectedInDistrict * 3),
      1,
      `With the Equity Guardrail on, ${district} already had ${selectedInDistrict} selected ${selectedInDistrict === 1 ? "project" : "projects"}, so this proposal added less district coverage.`,
    );
  }

  const selectedRisk = selectedAverage(({ riskScore }) => riskScore);
  const riskGap = project.riskScore - selectedRisk;
  if (riskGap >= 10) {
    addReason(
      86 + riskGap,
      2,
      `Selected projects averaged ${rounded(selectedRisk)}/100 calculated risk versus ${rounded(project.riskScore)}/100 here, giving the winning portfolio a stronger delivery-safety profile.`,
    );
  }

  const selectedFeasibility = selectedAverage(({ metrics }) => metrics.feasibility);
  const feasibilityGap = selectedFeasibility - project.metrics.feasibility;
  if (feasibilityGap >= 10) {
    addReason(
      84 + feasibilityGap,
      3,
      `Selected projects averaged ${rounded(selectedFeasibility)}/100 feasibility versus ${rounded(project.metrics.feasibility)}/100 here, strengthening the winning portfolio's delivery profile.`,
    );
  }

  const similarCostSelected = selected.filter(({ proposal }) => {
    const ratio = proposal.requested_amount / project.proposal.requested_amount;
    return ratio >= 0.6 && ratio <= 1.4;
  });
  if (similarCostSelected.length > 0) {
    const comparableEvidence = average(similarCostSelected.map(({ metrics }) => metrics.evidenceConfidence));
    const evidenceGap = comparableEvidence - project.metrics.evidenceConfidence;
    if (evidenceGap >= 10) {
      addReason(
        82 + evidenceGap,
        4,
        `Similar-cost selected alternatives averaged ${rounded(comparableEvidence)}/100 evidence confidence versus ${rounded(project.metrics.evidenceConfidence)}/100 here, providing stronger support for the allocation.`,
      );
    }
  }

  const selectedCostEfficiency = selectedAverage(({ metrics }) => metrics.costEfficiency);
  const costEfficiencyGap = selectedCostEfficiency - project.metrics.costEfficiency;
  if (costEfficiencyGap >= 10 && project.costPerBeneficiary !== null) {
    addReason(
      80 + costEfficiencyGap,
      5,
      `At ${money(project.costPerBeneficiary)} per beneficiary, this proposal's efficiency was ${rounded(project.metrics.costEfficiency)}/100 versus the selected portfolio average of ${rounded(selectedCostEfficiency)}/100.`,
    );
  }

  if (project.proposal.requested_amount > context.remainingBudget) {
    const budgetGap = project.proposal.requested_amount - context.remainingBudget;
    addReason(
      78 + Math.min(12, budgetGap / Math.max(1, context.budget) * 100),
      6,
      `Its ${money(project.proposal.requested_amount)} request did not fit the ${money(context.remainingBudget)} left after the higher-value portfolio combination was selected.`,
    );
  }

  const selectedScore = selectedAverage(({ score }) => score);
  addReason(
    75 + Math.max(0, project.score - selectedScore) / 5,
    7,
    `Despite its ${rounded(project.score)}/100 project score, exhaustive evaluation found a ${rounded(context.portfolioScore)}/100 portfolio combination within ${money(context.budget)}.`,
  );

  reasons.sort((left, right) => right.strength - left.strength || left.priority - right.priority);
  return `Deferred because ${reasons[0].text.charAt(0).toLocaleLowerCase()}${reasons[0].text.slice(1)}`;
}

export function buildPortfolioStory(result: Pick<PortfolioResult, "totalSpent" | "selectedProjects" | "totalBeneficiaries" | "equityScore" | "districtsRepresented" | "strategyLabel">) {
  return `Using the ${result.strategyLabel} strategy, IGAI allocated ${money(result.totalSpent)} across ${result.selectedProjects.length} projects, reaching ${integer(result.totalBeneficiaries)} beneficiaries across ${result.districtsRepresented.length} districts while maintaining an equity score of ${Math.round(result.equityScore)}/100.`;
}
