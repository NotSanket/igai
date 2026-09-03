import type { OptimizerStrategy, StrategyPreset } from "./types";

export const STRATEGY_PRESETS: Record<OptimizerStrategy, StrategyPreset> = {
  balanced: {
    key: "balanced",
    label: "Balanced",
    description: "Balances impact, reach, efficiency, need, feasibility, evidence and risk.",
    projectWeights: { impact: 0.2, reach: 0.15, costEfficiency: 0.15, geographicNeed: 0.15, alignment: 0.15, feasibility: 0.1, evidence: 0.05, risk: 0.05 },
    portfolioWeights: { quality: 0.32, aggregateImpact: 0.18, reach: 0.18, districtCoverage: 0.08, sectorCoverage: 0.07, safety: 0.07 },
    equityWeight: 0.1,
    preferredSectors: [],
  },
  "maximum-impact": {
    key: "maximum-impact",
    label: "Maximum Impact",
    description: "Prioritises expected impact while retaining delivery and risk checks.",
    projectWeights: { impact: 0.38, reach: 0.12, costEfficiency: 0.08, geographicNeed: 0.1, alignment: 0.12, feasibility: 0.08, evidence: 0.04, risk: 0.08 },
    portfolioWeights: { quality: 0.3, aggregateImpact: 0.3, reach: 0.12, districtCoverage: 0.05, sectorCoverage: 0.04, safety: 0.07 },
    equityWeight: 0.12,
    preferredSectors: [],
  },
  "maximum-reach": {
    key: "maximum-reach",
    label: "Maximum Reach",
    description: "Favours beneficiary reach and cost-efficient scale.",
    projectWeights: { impact: 0.15, reach: 0.35, costEfficiency: 0.15, geographicNeed: 0.08, alignment: 0.1, feasibility: 0.07, evidence: 0.03, risk: 0.07 },
    portfolioWeights: { quality: 0.25, aggregateImpact: 0.12, reach: 0.35, districtCoverage: 0.05, sectorCoverage: 0.04, safety: 0.07 },
    equityWeight: 0.12,
    preferredSectors: [],
  },
  "rural-first": {
    key: "rural-first",
    label: "Rural First",
    description: "Raises geographic need and alignment for rural-serving sectors.",
    projectWeights: { impact: 0.16, reach: 0.12, costEfficiency: 0.1, geographicNeed: 0.25, alignment: 0.14, feasibility: 0.08, evidence: 0.04, risk: 0.11 },
    portfolioWeights: { quality: 0.28, aggregateImpact: 0.13, reach: 0.12, districtCoverage: 0.13, sectorCoverage: 0.05, safety: 0.07 },
    equityWeight: 0.22,
    preferredSectors: ["Rural Development", "Water & Sanitation", "Livelihood", "Environment"],
  },
  "healthcare-first": {
    key: "healthcare-first",
    label: "Healthcare First",
    description: "Raises corporate alignment for healthcare proposals.",
    projectWeights: { impact: 0.2, reach: 0.14, costEfficiency: 0.1, geographicNeed: 0.12, alignment: 0.25, feasibility: 0.08, evidence: 0.04, risk: 0.07 },
    portfolioWeights: { quality: 0.38, aggregateImpact: 0.18, reach: 0.14, districtCoverage: 0.06, sectorCoverage: 0.03, safety: 0.07 },
    equityWeight: 0.14,
    preferredSectors: ["Healthcare"],
  },
  "low-risk": {
    key: "low-risk",
    label: "Low Risk",
    description: "Increases the influence of feasibility, evidence and risk controls.",
    projectWeights: { impact: 0.14, reach: 0.08, costEfficiency: 0.08, geographicNeed: 0.08, alignment: 0.1, feasibility: 0.18, evidence: 0.12, risk: 0.22 },
    portfolioWeights: { quality: 0.34, aggregateImpact: 0.1, reach: 0.1, districtCoverage: 0.06, sectorCoverage: 0.05, safety: 0.23 },
    equityWeight: 0.12,
    preferredSectors: [],
  },
  "maximum-equity": {
    key: "maximum-equity",
    label: "Maximum Equity",
    description: "Maximises geographic need, district diversity and underserved coverage.",
    projectWeights: { impact: 0.14, reach: 0.1, costEfficiency: 0.1, geographicNeed: 0.3, alignment: 0.12, feasibility: 0.07, evidence: 0.04, risk: 0.13 },
    portfolioWeights: { quality: 0.24, aggregateImpact: 0.11, reach: 0.1, districtCoverage: 0.15, sectorCoverage: 0.06, safety: 0.05 },
    equityWeight: 0.29,
    preferredSectors: [],
  },
};

export const STRATEGY_OPTIONS = Object.values(STRATEGY_PRESETS).map(({ key, label, description }) => ({ key, label, description }));

export function getStrategyPreset(strategy: OptimizerStrategy) {
  return STRATEGY_PRESETS[strategy];
}
