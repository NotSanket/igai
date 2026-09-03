import type { EquityMetrics, ScoredProject } from "./types";

const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value: number) => Math.round(value * 10) / 10;

export function calculateEquity(selected: ScoredProject[], allProjects: ScoredProject[]): EquityMetrics {
  if (selected.length === 0) return { equityScore: 0, districtCoverage: 0, sectorCoverage: 0, districtsRepresented: [] };

  const allDistricts = new Set(allProjects.map(({ proposal }) => proposal.district));
  const allSectors = new Set(allProjects.map(({ proposal }) => proposal.sector));
  const districtsRepresented = [...new Set(selected.map(({ proposal }) => proposal.district))].sort();
  const sectorsRepresented = new Set(selected.map(({ proposal }) => proposal.sector));
  const districtCoverage = allDistricts.size ? districtsRepresented.length / allDistricts.size * 100 : 0;
  const sectorCoverage = allSectors.size ? sectorsRepresented.size / allSectors.size * 100 : 0;
  const districtCounts = selected.reduce<Record<string, number>>((counts, { proposal }) => {
    counts[proposal.district] = (counts[proposal.district] ?? 0) + 1;
    return counts;
  }, {});
  const diversity = districtsRepresented.length / selected.length * 100;
  const concentrationPenalty = Math.max(...Object.values(districtCounts)) / selected.length * 100;
  const meanNeed = average(selected.map(({ metrics }) => metrics.geographicNeed));
  const allNeeds = allProjects.map(({ metrics }) => metrics.geographicNeed).sort((a, b) => a - b);
  const medianNeed = allNeeds.length ? allNeeds[Math.floor(allNeeds.length / 2)] : 0;
  const underservedDistricts = new Set(allProjects.filter(({ metrics }) => metrics.geographicNeed >= medianNeed).map(({ proposal }) => proposal.district));
  const underservedCovered = districtsRepresented.filter((district) => underservedDistricts.has(district)).length;
  const underservedCoverage = underservedDistricts.size ? underservedCovered / underservedDistricts.size * 100 : 0;
  const equityScore = Math.max(0, Math.min(100, districtCoverage * 0.24 + sectorCoverage * 0.12 + diversity * 0.18 + meanNeed * 0.27 + underservedCoverage * 0.24 - concentrationPenalty * 0.05));

  return {
    equityScore: round(equityScore),
    districtCoverage: round(districtCoverage),
    sectorCoverage: round(sectorCoverage),
    districtsRepresented,
  };
}
