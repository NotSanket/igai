import { z } from "zod";

import { PROPOSAL_SECTORS, TAMIL_NADU_DISTRICTS } from "@/lib/proposals/constants";

const optionalNarrative = z
  .string()
  .trim()
  .max(1500, "Keep this field under 1,500 characters")
  .optional()
  .transform((value) => value || null);

export const proposalSchema = z.object({
  title: z.string().trim().min(3, "Enter a project title").max(120, "Keep the title under 120 characters"),
  description: z.string().trim().min(20, "Add at least 20 characters").max(4000, "Keep the description under 4,000 characters"),
  sector: z.enum(PROPOSAL_SECTORS, { error: "Select a supported sector" }),
  requested_amount: z.number().finite().positive("Funding must be greater than zero").max(1_000_000_000, "Funding amount is too large"),
  beneficiaries: z.number().int("Use a whole number").positive("Beneficiaries must be greater than zero").max(100_000_000, "Beneficiary count is too large"),
  state: z.string().trim().min(2, "Enter a state").max(80, "Keep the state under 80 characters"),
  district: z.string().refine((value) => TAMIL_NADU_DISTRICTS.some((district) => district.name === value), "Select a Tamil Nadu district"),
  duration_months: z.number().int("Use a whole number").min(1, "Duration must be at least 1 month").max(120, "Duration cannot exceed 120 months"),
  impact_statement: optionalNarrative,
  evidence_description: optionalNarrative,
});

export type ProposalFormValues = z.input<typeof proposalSchema>;
export type ValidatedProposalValues = z.output<typeof proposalSchema>;
