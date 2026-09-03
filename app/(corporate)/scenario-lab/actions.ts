"use server";

import { z } from "zod";

import { requireRole } from "@/lib/auth/session";
import { optimizePortfolio } from "@/lib/optimizer/optimize";
import { STRATEGY_PRESETS } from "@/lib/optimizer/presets";
import type { OptimizerStrategy, PortfolioResult } from "@/lib/optimizer/types";
import { normalizeProposal } from "@/lib/proposals/format";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/types/database";

const BASELINE_BUDGET = 10_000_000;
const scenarioRequestSchema = z.object({
  budget: z.number().finite().min(5_000_000).max(15_000_000),
  strategy: z.string().refine((value): value is OptimizerStrategy => value in STRATEGY_PRESETS),
  equityGuardrail: z.boolean(),
});

export interface ScenarioComparison {
  baseline: PortfolioResult;
  scenario: PortfolioResult;
  scenarioBudget: number;
}

export type ScenarioActionResult =
  | { comparison: ScenarioComparison; error?: never }
  | { comparison?: never; error: string };

export async function runScenario(input: {
  budget: number;
  strategy: OptimizerStrategy;
  equityGuardrail: boolean;
}): Promise<ScenarioActionResult> {
  const parsed = scenarioRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Choose a budget between ₹50 lakh and ₹1.5 crore and a valid strategy." };
  }

  await requireRole("corporate");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .in("status", ["submitted", "under_review"])
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Scenario Lab proposal fetch failed", error.code);
    return { error: "The eligible proposal pipeline could not be loaded. Please try again." };
  }

  const proposals = ((data ?? []) as Proposal[]).map(normalizeProposal);
  if (proposals.length === 0) return { error: "No submitted proposals are available for simulation." };
  if (proposals.length > 24) return { error: "The demo-scale exhaustive optimizer supports up to 24 eligible proposals." };

  try {
    const baseline = optimizePortfolio(proposals, BASELINE_BUDGET, "balanced", true);
    const isBaselineScenario = parsed.data.budget === BASELINE_BUDGET
      && parsed.data.strategy === "balanced"
      && parsed.data.equityGuardrail;
    const scenario = isBaselineScenario
      ? baseline
      : optimizePortfolio(proposals, parsed.data.budget, parsed.data.strategy, parsed.data.equityGuardrail);

    return { comparison: { baseline, scenario, scenarioBudget: parsed.data.budget } };
  } catch (scenarioError) {
    console.error("Scenario Lab simulation failed", scenarioError instanceof Error ? scenarioError.message : "Unknown error");
    return { error: "The scenario could not be evaluated with these settings." };
  }
}
