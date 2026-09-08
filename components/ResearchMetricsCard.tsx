"use client";

import { FileText, Database, ShieldCheck, MapPin, Calendar } from "lucide-react";

interface ResearchMetricsCardProps {
  filteredCount: number;
  airportsCount: number;
  statesCount: number;
  yearRange: string;
}

export default function ResearchMetricsCard({
  filteredCount,
  airportsCount,
  statesCount,
  yearRange,
}: ResearchMetricsCardProps) {
  return (
    <div className="bg-tsa-surface border border-tsa-border rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-tsa-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-tsa-primary/20 text-tsa-accent">
            <FileText className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-tsa-text tracking-tight">
            Academic Research Methodology Telemetry
          </h3>
        </div>
        <span className="text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded bg-tsa-primary/20 text-tsa-accent border border-tsa-accent/30">
          Peer-Review Format
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-tsa-bg border border-tsa-border/70 space-y-1">
          <span className="text-tsa-muted text-[11px] flex items-center gap-1 font-medium">
            <Calendar className="w-3 h-3 text-tsa-accent" /> Period Covered
          </span>
          <p className="font-bold text-tsa-text text-sm">{yearRange}</p>
        </div>

        <div className="p-3 rounded-xl bg-tsa-bg border border-tsa-border/70 space-y-1">
          <span className="text-tsa-muted text-[11px] flex items-center gap-1 font-medium">
            <Database className="w-3 h-3 text-tsa-accent" /> Filtered Sample Size
          </span>
          <p className="font-bold text-tsa-text text-sm">{filteredCount.toLocaleString()} Records</p>
        </div>

        <div className="p-3 rounded-xl bg-tsa-bg border border-tsa-border/70 space-y-1">
          <span className="text-tsa-muted text-[11px] flex items-center gap-1 font-medium">
            <MapPin className="w-3 h-3 text-tsa-accent" /> Airports Included
          </span>
          <p className="font-bold text-tsa-text text-sm">{airportsCount} Hubs</p>
        </div>

        <div className="p-3 rounded-xl bg-tsa-bg border border-tsa-border/70 space-y-1">
          <span className="text-tsa-muted text-[11px] flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3 h-3 text-tsa-accent" /> States & Terr.
          </span>
          <p className="font-bold text-tsa-text text-sm">{statesCount} Regions</p>
        </div>

        <div className="p-3 rounded-xl bg-tsa-bg border border-tsa-border/70 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-tsa-muted text-[11px] font-medium">Data Source</span>
          <p className="font-semibold text-tsa-text text-[11px] truncate" title="TSA Claims Open Dataset">
            TSA Open Data Archive
          </p>
        </div>
      </div>
    </div>
  );
}
