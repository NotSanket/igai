import { AppShell } from "@/components/app-shell";
import { ImpactMapWorkspace } from "@/components/impact-map/impact-map-workspace";
import { requireRole } from "@/lib/auth/session";
import { optimizePortfolio } from "@/lib/optimizer/optimize";
import { getStrategyPreset } from "@/lib/optimizer/presets";
import { scoreProjects } from "@/lib/optimizer/score-project";
import { normalizeProposal } from "@/lib/proposals/format";
import { createClient } from "@/lib/supabase/server";
import type { Proposal } from "@/types/database";

const baselineBudget = 10_000_000;

export default async function ImpactMapPage() {
  const { profile } = await requireRole("corporate");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .select("*")
    .in("status", ["submitted", "under_review"])
    .order("created_at", { ascending: true });

  const proposals = ((data ?? []) as Proposal[]).map(normalizeProposal);
  const projects = scoreProjects(proposals, getStrategyPreset("balanced"));
  let baselineSelectedIds: string[] = [];

  if (proposals.length > 0 && proposals.length <= 24) {
    baselineSelectedIds = optimizePortfolio(proposals, baselineBudget, "balanced", true)
      .selectedProjects.map(({ proposal }) => proposal.id);
  }

  return (
    <AppShell profile={profile} role="corporate" pageTitle="Impact Map">
      <ImpactMapWorkspace
        projects={projects}
        baselineSelectedIds={baselineSelectedIds}
        loadError={error ? "The proposal pipeline could not be loaded. Refresh the page to try again." : undefined}
      />
    </AppShell>
  );
}
