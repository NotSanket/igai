"use server";

import { z } from "zod";

import { requireRole } from "@/lib/auth/session";
import { evaluateCandidate, optimizePortfolio } from "@/lib/optimizer/optimize";
import { normalizeProposal } from "@/lib/proposals/format";
import { createClient } from "@/lib/supabase/server";
import type { PortfolioResult } from "@/lib/optimizer/types";
import type { Proposal } from "@/types/database";

const challengeBudget = 10_000_000;
const requestSchema = z.object({ selectedIds: z.array(z.string().uuid()).min(1).max(24) });

export interface ManualPortfolioSnapshot {
  totalSpent: number;
  remainingBudget: number;
  projectsFunded: number;
  totalBeneficiaries: number;
  districtsRepresented: number;
  sectorsRepresented: number;
  districtCoverage: number;
  sectorCoverage: number;
  equityScore: number;
  portfolioScore: number;
  averageRisk: number;
}

export type ChallengeActionResult =
  | { comparison: { manual: ManualPortfolioSnapshot; optimized: PortfolioResult }; error?: never }
  | { comparison?: never; error: string };

export async function runChallenge(input: { selectedIds: string[] }): Promise<ChallengeActionResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { error: "Select at least one valid proposal before running the challenge." };

  await requireRole("corporate");
  const supabase = await createClient();
  const { data, error } = await supabase.from("proposals").select("*").in("status", ["submitted", "under_review"]).order("created_at", { ascending: true });
  if (error) {
    console.error("Challenge proposal fetch failed", error.code);
    return { error: "The proposal pipeline could not be loaded. Please try again." };
  }

  const proposals = ((data ?? []) as Proposal[]).map(normalizeProposal);
  if (proposals.length === 0) return { error: "No submitted proposals are available for the challenge." };
  if (proposals.length > 24) return { error: "The demo-scale exhaustive optimizer supports up to 24 eligible proposals." };

  const selectedIdSet = new Set(parsed.data.selectedIds);
  if (selectedIdSet.size !== parsed.data.selectedIds.length) return { error: "The selected proposal list contains duplicates." };
  const selectedProposals = proposals.filter(({ id }) => selectedIdSet.has(id));
  if (selectedProposals.length !== selectedIdSet.size) return { error: "One or more selected proposals are no longer available." };
  const selectedSpend = selectedProposals.reduce((sum, proposal) => sum + proposal.requested_amount, 0);
  if (selectedSpend > challengeBudget) return { error: "Your allocation exceeds the ₹1 crore challenge budget." };

  try {
    const optimized = optimizePortfolio(proposals, challengeBudget, "balanced", true);
    const manualProjects = optimized.projectScores.filter(({ proposal }) => selectedIdSet.has(proposal.id));
    const manualBeneficiaries = manualProjects.reduce((sum, project) => sum + Math.max(0, project.proposal.beneficiaries), 0);
    const evaluated = evaluateCandidate(manualProjects, optimized.projectScores, selectedSpend, manualBeneficiaries, true, "balanced");
    const manual: ManualPortfolioSnapshot = {
      totalSpent: selectedSpend,
      remainingBudget: challengeBudget - selectedSpend,
      projectsFunded: manualProjects.length,
      totalBeneficiaries: manualBeneficiaries,
      districtsRepresented: new Set(manualProjects.map(({ proposal }) => proposal.district)).size,
      sectorsRepresented: new Set(manualProjects.map(({ proposal }) => proposal.sector)).size,
      districtCoverage: evaluated.equity.districtCoverage,
      sectorCoverage: evaluated.equity.sectorCoverage,
      equityScore: evaluated.equity.equityScore,
      portfolioScore: evaluated.portfolioScore,
      averageRisk: evaluated.averageRisk,
    };
    return { comparison: { manual, optimized } };
  } catch (challengeError) {
    console.error("Challenge comparison failed", challengeError instanceof Error ? challengeError.message : "Unknown error");
    return { error: "The challenge comparison could not be calculated." };
  }
}
