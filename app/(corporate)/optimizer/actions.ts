"use server";

import { z } from "zod";

import { requireRole } from "@/lib/auth/session";
import { optimizePortfolio } from "@/lib/optimizer/optimize";
import type { OptimizerStrategy, PortfolioResult } from "@/lib/optimizer/types";
import { normalizeProposal } from "@/lib/proposals/format";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/types/database";

const requestSchema = z.object({
  budget: z.number().finite().positive().max(10_000_000_000),
  strategy: z.enum(["balanced", "maximum-impact", "maximum-reach", "rural-first", "healthcare-first", "low-risk", "maximum-equity"]),
  equityGuardrail: z.boolean(),
});

export type OptimizerActionResult = { result: PortfolioResult; error?: never } | { result?: never; error: string };

export async function runOptimizer(input: { budget: number; strategy: OptimizerStrategy; equityGuardrail: boolean }): Promise<OptimizerActionResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter a valid positive CSR budget and select a strategy." };

  await requireRole("corporate");
  const supabase = await createClient();
  const { data, error } = await supabase.from("proposals").select("*").in("status", ["submitted", "under_review"]).order("created_at", { ascending: true });

  if (error) {
    console.error("Optimizer proposal fetch failed", error.code);
    return { error: "The eligible proposal pipeline could not be loaded. Please try again." };
  }

  const proposals = ((data ?? []) as Proposal[]).map(normalizeProposal);
  if (proposals.length === 0) return { error: "No submitted proposals are available for optimization." };
  if (proposals.length > 24) return { error: "The demo-scale exhaustive optimizer supports up to 24 eligible proposals." };

  try {
    return { result: optimizePortfolio(proposals, parsed.data.budget, parsed.data.strategy, parsed.data.equityGuardrail) };
  } catch (optimizationError) {
    console.error("Portfolio optimization failed", optimizationError instanceof Error ? optimizationError.message : "Unknown error");
    return { error: "The portfolio could not be evaluated with these settings." };
  }
}
