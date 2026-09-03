export type UserRole = "ngo" | "corporate";

export type ProposalStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "selected"
  | "deferred";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  organization_name: string | null;
  created_at: string;
}

export interface Proposal {
  id: string;
  created_by: string;
  ngo_name: string;
  title: string;
  description: string | null;
  impact_statement: string | null;
  evidence_description: string | null;
  sector: string;
  state: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  requested_amount: number;
  beneficiaries: number;
  duration_months: number | null;
  impact_score: number | null;
  geo_need_score: number | null;
  feasibility_score: number | null;
  risk_score: number | null;
  evidence_score: number | null;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  created_by: string;
  name: string;
  budget: number;
  impact_weight: number | null;
  reach_weight: number | null;
  cost_weight: number | null;
  geographic_weight: number | null;
  alignment_weight: number | null;
  feasibility_weight: number | null;
  risk_weight: number | null;
  equity_guardrail: boolean | null;
  results: Json | null;
  created_at: string;
}

export interface Allocation {
  id: string;
  scenario_id: string;
  proposal_id: string;
  selected: boolean;
  allocated_amount: number;
  calculated_score: number | null;
  selection_reason: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Json | null;
  timestamp: string;
}
