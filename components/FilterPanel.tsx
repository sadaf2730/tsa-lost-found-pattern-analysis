"use client";

import React, { useMemo } from "react";
import SearchableSelect from "./SearchableSelect";
import FilterChips from "./FilterChips";
import { useFilterContext } from "@/context/FilterContext";
import { FilterOptions } from "@/lib/types";
import { SlidersHorizontal, RotateCcw, Play } from "lucide-react";

interface FilterPanelProps {
  filterOptions: FilterOptions;
  onAnalyze?: () => void;
}

export default function FilterPanel({ filterOptions, onAnalyze }: FilterPanelProps) {
  const { filters, setFilter, resetFilters, applyFilters } = useFilterContext();

  // Cascading Airports based on selected State
  const availableAirports = useMemo(() => {
    if (filters.state !== "All" && filterOptions.state_airport_map[filters.state]) {
      return filterOptions.state_airport_map[filters.state];
    }
    return filterOptions.airports;
  }, [filters.state, filterOptions]);

  const handleAnalyzeClick = () => {
    applyFilters();
    if (onAnalyze) onAnalyze();
  };

  return (
    <section className="w-full bg-tsa-surface border border-tsa-border rounded-2xl p-5 shadow-card space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-tsa-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-tsa-primary/20 border border-tsa-accent/30 text-tsa-accent">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-tsa-text tracking-tight flex items-center gap-2">
              Global Filter Control
            </h2>
            <p className="text-xs text-tsa-muted">
              Dynamically slice analytics across years, states, airports, and categories
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={resetFilters}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-tsa-bg border border-tsa-border hover:border-tsa-accent/50 text-tsa-text text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-tsa-muted" />
            <span>Reset</span>
          </button>

          <button
            onClick={handleAnalyzeClick}
            type="button"
            className="px-4 py-2 rounded-xl bg-tsa-primary hover:bg-tsa-accent text-white font-semibold text-xs flex items-center gap-1.5 shadow-md hover:shadow-glow transition-all duration-200"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Analyze Dashboard</span>
          </button>
        </div>
      </div>

      {/* Grid of 6 Searchable Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <SearchableSelect
          label="Year"
          options={filterOptions.years}
          value={filters.year}
          onChange={(val) => setFilter("year", val)}
        />

        <SearchableSelect
          label="State"
          options={filterOptions.states}
          value={filters.state}
          onChange={(val) => setFilter("state", val)}
        />

        <SearchableSelect
          label="Airport"
          options={availableAirports}
          value={filters.airport}
          onChange={(val) => setFilter("airport", val)}
          placeholder={filters.state !== "All" ? `Airports in ${filters.state}...` : "Select Airport..."}
        />

        <SearchableSelect
          label="Claim Type"
          options={filterOptions.claim_types}
          value={filters.claimType}
          onChange={(val) => setFilter("claimType", val)}
        />

        <SearchableSelect
          label="Item Category"
          options={filterOptions.item_categories}
          value={filters.itemCategory}
          onChange={(val) => setFilter("itemCategory", val)}
        />

        <SearchableSelect
          label="Month"
          options={filterOptions.months}
          value={filters.month}
          onChange={(val) => setFilter("month", val)}
        />
      </div>

      {/* Active Filter Badges */}
      <FilterChips />
    </section>
  );
}
