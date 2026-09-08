"use client";

import { StateSnapshotData } from "@/lib/types";
import { MapPin, FileSpreadsheet, DollarSign, Plane, Tag, Calendar, X } from "lucide-react";

interface StateSnapshotPanelProps {
  snapshot: StateSnapshotData | null;
  onClearState?: () => void;
}

export default function StateSnapshotPanel({ snapshot, onClearState }: StateSnapshotPanelProps) {
  if (!snapshot) return null;

  return (
    <div className="bg-tsa-surface border border-tsa-accent/40 rounded-2xl p-5 shadow-card space-y-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between border-b border-tsa-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-tsa-primary/20 text-tsa-accent">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-tsa-text">
              State Geographic Snapshot — {snapshot.state}
            </h3>
            <p className="text-[11px] text-tsa-muted">Regional operational telemetry telemetry</p>
          </div>
        </div>

        {onClearState && (
          <button
            onClick={onClearState}
            className="p-1 rounded-md hover:bg-tsa-bg text-tsa-muted hover:text-tsa-text text-xs flex items-center gap-1 border border-tsa-border/50"
            title="Clear State Filter"
          >
            <X className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset State</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-tsa-bg border border-tsa-border/60 space-y-1">
          <span className="text-[11px] text-tsa-muted font-medium flex items-center gap-1">
            <FileSpreadsheet className="w-3 h-3 text-tsa-accent" /> Total Claims
          </span>
          <p className="font-bold text-tsa-text text-sm">{snapshot.totalClaims.toLocaleString()}</p>
        </div>

        <div className="p-3 rounded-xl bg-tsa-bg border border-tsa-border/60 space-y-1">
          <span className="text-[11px] text-tsa-muted font-medium flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-400" /> Total Settlement
          </span>
          <p className="font-bold text-tsa-text text-sm">
            ${snapshot.totalSettlement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-tsa-bg border border-tsa-border/60 space-y-1">
          <span className="text-[11px] text-tsa-muted font-medium flex items-center gap-1">
            <Plane className="w-3 h-3 text-tsa-accent" /> Top Airport Hub
          </span>
          <p className="font-bold text-tsa-text text-sm">{snapshot.topAirport}</p>
        </div>

        <div className="p-3 rounded-xl bg-tsa-bg border border-tsa-border/60 space-y-1">
          <span className="text-[11px] text-tsa-muted font-medium flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-400" /> Top Category
          </span>
          <p className="font-bold text-tsa-text text-sm truncate" title={snapshot.topCategory}>
            {snapshot.topCategory}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-tsa-bg border border-tsa-border/60 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] text-tsa-muted font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3 text-blue-400" /> Peak Month
          </span>
          <p className="font-bold text-tsa-text text-sm">{snapshot.peakMonth}</p>
        </div>
      </div>
    </div>
  );
}
