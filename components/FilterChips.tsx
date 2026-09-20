"use client";

import { useFilterContext } from "@/context/FilterContext";
import { FilterState } from "@/lib/types";
import { getStateFullName, getAirportFullName } from "@/lib/lookups";
import { X, RotateCcw } from "lucide-react";

const FILTER_LABELS: Record<keyof FilterState, string> = {
  year: "Year",
  state: "State",
  airport: "Airport",
  claimType: "Claim Type",
  itemCategory: "Category",
  month: "Month",
};

export default function FilterChips() {
  const { filters, removeFilter, resetFilters } = useFilterContext();

  const activeEntries = (Object.entries(filters) as [keyof FilterState, string][]).filter(
    ([, val]) => val !== "All" && val !== ""
  );

  if (activeEntries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-tsa-border/50">
      <span className="text-xs font-semibold text-tsa-muted uppercase tracking-wider mr-1">
        Active Filters ({activeEntries.length}):
      </span>

      {activeEntries.map(([key, val]) => {
        let displayVal = val;
        if (key === "state") {
          displayVal = getStateFullName(val);
        } else if (key === "airport") {
          displayVal = getAirportFullName(val);
        }

        return (
          <div
            key={key}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tsa-primary/20 border border-tsa-accent/30 text-tsa-accent text-xs font-medium shadow-sm transition-all hover:border-tsa-accent"
          >
            <span className="text-tsa-muted text-[11px] font-normal">{FILTER_LABELS[key]}:</span>
            <span className="font-semibold">{displayVal}</span>
            <button
              onClick={() => removeFilter(key)}
              className="p-0.5 rounded-full hover:bg-tsa-accent/20 text-tsa-accent transition-colors"
              title={`Remove ${FILTER_LABELS[key]} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        );
      })}

      <button
        onClick={resetFilters}
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-medium transition-colors ml-auto"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
}
