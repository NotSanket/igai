import type { ProposalStatus } from "@/types/database";

export interface DashboardMetric {
  label: string;
  value: string;
  context: string;
  trend?: string;
}

export interface ProposalRow {
  project: string;
  ngo: string;
  sector: string;
  district: string;
  requested: string;
  beneficiaries: string;
  status: ProposalStatus;
  updated: string;
}

export const corporateMetrics: DashboardMetric[] = [
  { label: "Available budget", value: "₹1.00 Cr", context: "FY 2026–27 allocation", trend: "100% unallocated" },
  { label: "Active proposals", value: "18", context: "Across 8 priority sectors", trend: "+4 this month" },
  { label: "Total requested", value: "₹2.74 Cr", context: "2.74× available capital", trend: "Requires prioritization" },
  { label: "Potential beneficiaries", value: "44,820", context: "Estimated direct reach", trend: "32 districts represented" },
];

export const ngoMetrics: DashboardMetric[] = [
  { label: "Total proposals", value: "6", context: "Across your organization" },
  { label: "Submitted", value: "3", context: "Awaiting assessment" },
  { label: "Selected", value: "2", context: "₹31.5L potential funding" },
  { label: "Potential beneficiaries", value: "8,460", context: "Across active proposals" },
];

export const sectorFunding = [
  { name: "Healthcare", value: 24, color: "#0f766e" },
  { name: "Education", value: 19, color: "#0284c7" },
  { name: "Water & Sanitation", value: 15, color: "#4f46e5" },
  { name: "Women Empowerment", value: 12, color: "#b45309" },
  { name: "Environment", value: 10, color: "#15803d" },
  { name: "Rural Development", value: 8, color: "#7c3aed" },
  { name: "Livelihood", value: 7, color: "#be123c" },
  { name: "Digital Inclusion", value: 5, color: "#475569" },
];

export const proposalDistribution = [
  { name: "Health", proposals: 4 },
  { name: "Education", proposals: 3 },
  { name: "Water", proposals: 3 },
  { name: "Women", proposals: 2 },
  { name: "Environment", proposals: 2 },
  { name: "Rural", proposals: 2 },
  { name: "Livelihood", proposals: 1 },
  { name: "Digital", proposals: 1 },
];

export const districtProjects = [
  { name: "Chennai", projects: 5 },
  { name: "Coimbatore", projects: 4 },
  { name: "Madurai", projects: 3 },
  { name: "Ramanathapuram", projects: 2 },
  { name: "Tirunelveli", projects: 2 },
  { name: "Dharmapuri", projects: 2 },
];

export const corporateProposals: ProposalRow[] = [
  { project: "Rural Maternal Health Access", ngo: "Arogya Trust", sector: "Healthcare", district: "Dharmapuri", requested: "₹24.0L", beneficiaries: "6,400", status: "under_review", updated: "2 Sep 2026" },
  { project: "Digital Government Schools Initiative", ngo: "Vidya Foundation", sector: "Education", district: "Madurai", requested: "₹38.5L", beneficiaries: "8,200", status: "submitted", updated: "1 Sep 2026" },
  { project: "Village Drinking Water Mission", ngo: "Neer Collective", sector: "Water & Sanitation", district: "Ramanathapuram", requested: "₹31.2L", beneficiaries: "5,900", status: "selected", updated: "30 Aug 2026" },
  { project: "Women Entrepreneurship Hubs", ngo: "Sakthi Network", sector: "Women Empowerment", district: "Coimbatore", requested: "₹28.0L", beneficiaries: "2,450", status: "under_review", updated: "29 Aug 2026" },
  { project: "Mobile Healthcare Vans", ngo: "Uyir Health Alliance", sector: "Healthcare", district: "Tirunelveli", requested: "₹42.0L", beneficiaries: "9,600", status: "submitted", updated: "28 Aug 2026" },
  { project: "Coastal Plastic Recovery Program", ngo: "Blue Tamil Nadu", sector: "Environment", district: "Nagapattinam", requested: "₹18.8L", beneficiaries: "3,100", status: "deferred", updated: "25 Aug 2026" },
];

export const ngoProposals: ProposalRow[] = [
  corporateProposals[0],
  { project: "Community Nutrition Hubs", ngo: "Arogya Trust", sector: "Healthcare", district: "Salem", requested: "₹16.5L", beneficiaries: "1,850", status: "submitted", updated: "31 Aug 2026" },
  { project: "Tribal Telehealth Network", ngo: "Arogya Trust", sector: "Digital Inclusion", district: "The Nilgiris", requested: "₹21.0L", beneficiaries: "2,100", status: "selected", updated: "27 Aug 2026" },
  { project: "Adolescent Wellness Program", ngo: "Arogya Trust", sector: "Healthcare", district: "Krishnagiri", requested: "₹12.8L", beneficiaries: "1,420", status: "deferred", updated: "22 Aug 2026" },
];
