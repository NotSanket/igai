"use client";

import type { LatLngBoundsExpression } from "leaflet";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

import { StatusBadge } from "@/components/dashboard-ui";
import type { ScoredProject } from "@/lib/optimizer/types";
import { formatCurrency } from "@/lib/proposals/format";

const tamilNaduCenter: [number, number] = [11.1271, 78.6569];

function MapViewport({ positions }: { positions: Array<[number, number]> }) {
  const map = useMap();

  useEffect(() => {
    if (!positions.length) {
      map.setView(tamilNaduCenter, 7);
      return;
    }

    map.fitBounds(positions as LatLngBoundsExpression, { padding: [34, 34], maxZoom: 10 });
  }, [map, positions]);

  return null;
}

export function ImpactMapCanvas({ projects, selectedIds }: { projects: ScoredProject[]; selectedIds: string[] }) {
  const selectedSet = new Set(selectedIds);
  const positions = projects.map(({ proposal }) => [Number(proposal.latitude), Number(proposal.longitude)] as [number, number]);

  return (
    <MapContainer center={tamilNaduCenter} zoom={7} scrollWheelZoom className="h-full min-h-[520px] w-full bg-slate-100" aria-label="Interactive map of CSR proposal locations">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewport positions={positions} />
      {projects.map((project) => {
        const { proposal } = project;
        const selected = selectedSet.has(proposal.id);
        const underReview = proposal.status === "under_review";
        const color = selected ? "#047857" : underReview ? "#d97706" : "#0369a1";

        return (
          <CircleMarker
            key={proposal.id}
            center={[Number(proposal.latitude), Number(proposal.longitude)]}
            radius={selected ? 10 : 7}
            pathOptions={{ color: "#ffffff", weight: selected ? 3 : 2, fillColor: color, fillOpacity: selected ? 0.95 : 0.82 }}
          >
            <Popup minWidth={270} maxWidth={330}>
              <div className="p-1 text-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-extrabold tracking-[0.14em] text-emerald-700 uppercase">{proposal.sector} · {proposal.district}</p>
                    <h3 className="mt-1 text-sm font-black leading-5">{proposal.title}</h3>
                    <p className="mt-1 text-[11px] text-slate-500">{proposal.ngo_name}</p>
                  </div>
                  {selected ? <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[8px] font-extrabold text-emerald-800">SELECTED</span> : null}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-100 py-3">
                  <div><p className="text-[8px] font-bold text-slate-400 uppercase">Funding</p><p className="mt-1 text-xs font-bold">{formatCurrency(proposal.requested_amount)}</p></div>
                  <div><p className="text-[8px] font-bold text-slate-400 uppercase">Beneficiaries</p><p className="mt-1 text-xs font-bold">{proposal.beneficiaries.toLocaleString("en-IN")}</p></div>
                  <div><p className="text-[8px] font-bold text-slate-400 uppercase">Impact score</p><p className="mt-1 text-xs font-bold">{project.metrics.expectedImpact.toFixed(0)}/100</p></div>
                  <div><p className="text-[8px] font-bold text-slate-400 uppercase">Geographic need</p><p className="mt-1 text-xs font-bold">{project.metrics.geographicNeed.toFixed(0)}/100</p></div>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3"><StatusBadge status={proposal.status} /><span className="text-[9px] font-semibold text-slate-400">{selected ? "₹1 Cr Balanced baseline" : "Available proposal"}</span></div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
