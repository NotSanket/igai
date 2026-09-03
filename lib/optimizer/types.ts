import type { Proposal } from "../../types/database";

export type OptimizerStrategy =
  | "balanced"
  | "maximum-impact"
  | "maximum-reach"
  | "rural-first"
  | "healthcare-first"
  | "low-risk"
  | "maximum-equity";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ProjectWeights {
  impact: number;
  reach: number;
  costEfficiency: number;
  geographicNeed: number;
  alignment: number;
  feasibility: number;
  evidence: number;
  risk: number;
}

export interface PortfolioWeights {
  quality: number;
  aggregateImpact: number;
  reach: number;
  districtCoverage: number;
  sectorCoverage: number;
  safety: number;
}

export interface StrategyPreset {
  key: OptimizerStrategy;
  label: string;
  description: string;
  projectWeights: ProjectWeights;
  portfolioWeights: PortfolioWeights;
  equityWeight: number;
  preferredSectors: string[];
}

export interface ScoringContext {
  maxBeneficiaries: number;
  maxRequestedAmount: number;
  minCostPerBeneficiary: number;
  maxCostPerBeneficiary: number;
}

export interface ProjectScoreMetrics {
  expectedImpact: number;
  beneficiaryReach: number;
  costEfficiency: number;
  geographicNeed: number;
  corporateAlignment: number;
  feasibility: number;
  evidenceConfidence: number;
  calculatedRisk: number;
}

export interface ScoredProject {
  proposal: Proposal;
  score: number;
  costPerBeneficiary: number | null;
  riskScore: number;
  riskLevel: RiskLevel;
  eligible: boolean;
  metrics: ProjectScoreMetrics;
  explanation: string;
}

export interface EquityMetrics {
  equityScore: number;
  districtCoverage: number;
  sectorCoverage: number;
  districtsRepresented: string[];
}

export interface PortfolioComponents {
  quality: number;
  impact: number;
  reach: number;
  equity: number;
  safety: number;
}

export interface PortfolioResult {
  selectedProjects: ScoredProject[];
  deferredProjects: ScoredProject[];
  totalSpent: number;
  remainingBudget: number;
  totalBeneficiaries: number;
  portfolioScore: number;
  equityScore: number;
  districtCoverage: number;
  sectorCoverage: number;
  districtsRepresented: string[];
  averageRisk: number;
  candidatePortfoliosEvaluated: number;
  strategy: OptimizerStrategy;
  strategyLabel: string;
  equityGuardrail: boolean;
  projectScores: ScoredProject[];
  explanations: Record<string, string>;
  portfolioStory: string;
  components: PortfolioComponents;
}
