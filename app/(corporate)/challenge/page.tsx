import { AppShell } from "@/components/app-shell";
import { ChallengeWorkspace } from "@/components/challenge/challenge-workspace";
import { requireRole } from "@/lib/auth/session";
import { getStrategyPreset } from "@/lib/optimizer/presets";
import { scoreProjects } from "@/lib/optimizer/score-project";
import { normalizeProposal } from "@/lib/proposals/format";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/types/database";

export default async function ChallengePage() {
  const { profile } = await requireRole("corporate");
  const supabase = await createClient();
  const { data, error } = await supabase.from("proposals").select("*").in("status", ["submitted", "under_review"]).order("created_at", { ascending: true });
  const proposals = ((data ?? []) as Proposal[]).map(normalizeProposal);
  const projects = scoreProjects(proposals, getStrategyPreset("balanced"));

  return <AppShell profile={profile} role="corporate" pageTitle="₹1 Crore Challenge"><ChallengeWorkspace projects={projects} loadError={error ? "The proposal pipeline could not be loaded. Refresh the page to try again." : undefined} /></AppShell>;
}
