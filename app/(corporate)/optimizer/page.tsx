import { AppShell } from "@/components/app-shell";
import { OptimizerWorkspace } from "@/components/optimizer/optimizer-workspace";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export default async function OptimizerPage() {
  const { profile } = await requireRole("corporate");
  const supabase = await createClient();
  const { count } = await supabase.from("proposals").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review"]);

  return <AppShell profile={profile} role="corporate" pageTitle="Portfolio Optimizer"><OptimizerWorkspace initialProposalCount={count ?? undefined} /></AppShell>;
}
