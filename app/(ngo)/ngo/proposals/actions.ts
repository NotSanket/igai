"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireRole } from "@/lib/auth/session";
import { proposalSchema, type ValidatedProposalValues } from "@/lib/proposals/schema";
import { calculateInitialScores, getDistrictCoordinates } from "@/lib/proposals/scoring";
import { createClient } from "@/lib/supabase/server";

export type ProposalActionResult = { error: string } | undefined;

function proposalFields(values: ValidatedProposalValues) {
  return {
    title: values.title,
    description: values.description,
    sector: values.sector,
    requested_amount: values.requested_amount,
    beneficiaries: values.beneficiaries,
    state: values.state,
    district: values.district,
    duration_months: values.duration_months,
    impact_statement: values.impact_statement,
    evidence_description: values.evidence_description,
    ...getDistrictCoordinates(values.district),
    ...calculateInitialScores(values),
  };
}

export async function createProposal(input: unknown): Promise<ProposalActionResult> {
  const parsed = proposalSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the highlighted fields and try again." };

  const { user, profile } = await requireRole("ngo");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .insert({
      ...proposalFields(parsed.data),
      created_by: user.id,
      ngo_name: profile.organization_name ?? profile.full_name ?? profile.email ?? "NGO partner",
      status: "submitted",
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    console.error("Proposal creation failed", error?.code);
    return { error: "We could not submit the proposal. Please try again." };
  }

  revalidatePath("/ngo/dashboard");
  revalidatePath("/ngo/proposals");
  redirect("/ngo/proposals");
}

export async function updateProposal(id: string, input: unknown): Promise<ProposalActionResult> {
  if (!z.string().uuid().safeParse(id).success) return { error: "This proposal link is invalid." };
  const parsed = proposalSchema.safeParse(input);
  if (!parsed.success) return { error: "Check the highlighted fields and try again." };

  const { user } = await requireRole("ngo");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proposals")
    .update(proposalFields(parsed.data))
    .eq("id", id)
    .eq("created_by", user.id)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error || !data) {
    console.error("Proposal update failed", error?.code);
    return { error: "We could not save these changes. Refresh and try again." };
  }

  revalidatePath("/ngo/dashboard");
  revalidatePath("/ngo/proposals");
  revalidatePath(`/ngo/proposals/${id}`);
  redirect(`/ngo/proposals/${id}`);
}
