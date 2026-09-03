import { AppShell } from "@/components/app-shell";
import { ScenarioLabWorkspace } from "@/components/scenario-lab/scenario-lab-workspace";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function ScenarioLabPage() {
  const { profile } = await requireRole("corporate");
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("proposals")
    .select("id", { count: "exact", head: true })
    .in("status", ["submitted", "under_review"]);

  return (
    <AppShell profile={profile} role="corporate" pageTitle="Scenario Lab">
      <ScenarioLabWorkspace
        initialProposalCount={count ?? undefined}
        loadError={error ? "The proposal pipeline is unavailable. Refresh the page to try again." : undefined}
      />
    </AppShell>
  );
}
