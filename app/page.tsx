"use client";

import React, { useEffect, useState } from "react";
import Hero from "@/components/Hero";
import FilterPanel from "@/components/FilterPanel";
import KPICard from "@/components/KPICard";
import ResearchInsightsSection from "@/components/ResearchInsightsSection";
import { loadTSADataset, LoadedDataset } from "@/lib/dataLoader";
import { useFilterContext } from "@/context/FilterContext";
import { filterClaims } from "@/lib/filters";
import { TSAClaim } from "@/lib/types";
import { getStateFullName, getAirportFullName } from "@/lib/lookups";
import {
  FileSpreadsheet,
  Columns,
  Plane,
  Compass,
  Calendar,
  Loader2,
  AlertCircle,
  Database,
  Table as TableIcon,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const [data, setData] = useState<LoadedDataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { filters } = useFilterContext();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const result = await loadTSADataset();
        setData(result);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load TSA dataset.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter records when filters change (limited to 20 records from full dataset)
  const displayedClaims: TSAClaim[] = React.useMemo(() => {
    if (!data) return [];
    return filterClaims(data.claims, filters).slice(0, 20);
  }, [data, filters]);

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Hero Section */}
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* 2. Research Paper Introduction */}
        <section className="bg-tsa-surface border border-tsa-border rounded-2xl p-6 shadow-card space-y-3">
          <div className="flex items-center gap-2 text-tsa-accent text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Research Abstract & Platform Overview</span>
          </div>

          <h2 className="text-xl font-bold text-tsa-text tracking-tight">
            Systematic Analysis of U.S. Aviation Security Property Claims
          </h2>

          <p className="text-sm text-tsa-muted leading-relaxed">
            This research platform analyzes historical Transportation Security Administration (TSA) lost-property and damage claims filed across commercial airports in the United States. By combining visual analytics, spatial statistics, and financial modeling, the platform enables analysts and airport operations managers to examine systemic loss hotspots, evaluate claim resolution rates, identify temporal trends, and optimize checkpoint security asset protection protocols.
          </p>
        </section>

        {/* 3. Global Filter Panel */}
        {data && <FilterPanel filterOptions={data.filterOptions} />}

        {/* 4. Dataset Overview Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-tsa-border/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-tsa-primary/20 border border-tsa-accent/30 text-tsa-accent">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-tsa-text tracking-tight">
                  Dataset Overview & Operational Telemetry
                </h2>
                <p className="text-xs text-tsa-muted">
                  Live summary metrics computed from the dataset metadata
                </p>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center p-12 bg-tsa-surface border border-tsa-border rounded-2xl space-y-3">
              <Loader2 className="w-8 h-8 text-tsa-accent animate-spin" />
              <p className="text-sm font-semibold text-tsa-text">Loading TSA Dataset...</p>
              <p className="text-xs text-tsa-muted">Parsing dataset structure and metadata telemetry</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-start gap-3 p-5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Failed to Load Dataset</h4>
                <p className="text-xs text-rose-300">{error}</p>
                <p className="text-xs text-tsa-muted">
                  Please verify that <code className="bg-tsa-bg px-1 py-0.5 rounded">data/cleaned_tsa_claims.csv</code> or public JSON files exist.
                </p>
              </div>
            </div>
          )}

          {/* KPI Metrics Grid */}
          {!loading && !error && data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <KPICard
                title="Total Records"
                value={data.overview.total_records.toLocaleString()}
                subtitle="Verified claim filings"
                icon={<FileSpreadsheet className="w-5 h-5" />}
                trend="218.4K"
                trendDirection="neutral"
              />
              <KPICard
                title="Total Columns"
                value={data.overview.total_columns}
                subtitle="Detected data attributes"
                icon={<Columns className="w-5 h-5" />}
                trend="Cleaned Schema"
                trendDirection="neutral"
              />
              <KPICard
                title="Airports Covered"
                value={data.overview.airports_covered}
                subtitle="Commercial airports"
                icon={<Plane className="w-5 h-5" />}
                trend="U.S. Network"
                trendDirection="neutral"
              />
              <KPICard
                title="States Covered"
                value={data.overview.states_covered}
                subtitle="States & territories"
                icon={<Compass className="w-5 h-5" />}
                trend="Nationwide"
                trendDirection="neutral"
              />
              <KPICard
                title="Available Years"
                value={data.overview.year_range}
                subtitle="Historical range"
                icon={<Calendar className="w-5 h-5" />}
                trend="15 Year Span"
                trendDirection="neutral"
              />
            </div>
          )}

          {/* Table Preview */}
          {!loading && !error && data && (
            <div className="bg-tsa-surface border border-tsa-border rounded-2xl p-5 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TableIcon className="w-4 h-4 text-tsa-accent" />
                  <h3 className="text-sm font-bold text-tsa-text">
                    Dataset Records Preview ({displayedClaims.length} records)
                  </h3>
                </div>
              </div>

              {displayedClaims.length > 0 ? (
                <div className="overflow-auto max-h-[500px] rounded-xl border border-tsa-border">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-tsa-bg border-b border-tsa-border uppercase text-[11px] text-tsa-muted font-semibold tracking-wider">
                      <tr>
                        {data.overview.columns.map((col) => (
                          <th key={col} className="px-3.5 py-3 whitespace-nowrap">
                            {col.replace(/_/g, " ")}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tsa-border/50 text-tsa-text">
                      {displayedClaims.map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-tsa-primary/5 transition-colors"
                        >
                          {data.overview.columns.map((col) => {
                            const val = row[col];
                            let formatted =
                              val === null || val === undefined || val === ""
                                ? "Unknown"
                                : String(val);

                            if (col === "Close_Amount" && typeof val === "number") {
                              formatted = `$${val.toFixed(2)}`;
                            } else if (col === "Incident_Date") {
                              if (formatted !== "Unknown") {
                                formatted = formatted.split(" ")[0].split("T")[0];
                              }
                            } else if (col === "State") {
                              formatted = getStateFullName(formatted);
                            } else if (col === "Airport_Code") {
                              formatted = getAirportFullName(formatted);
                            } else if (col === "Airport_Name" && (formatted === "Unknown" || !formatted)) {
                              if (row.Airport_Code && row.Airport_Code !== "Unknown") {
                                formatted = getAirportFullName(String(row.Airport_Code));
                              }
                            }

                            return (
                              <td
                                key={col}
                                className="px-3.5 py-2.5 max-w-xs truncate"
                                title={formatted}
                              >
                                {formatted}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-tsa-muted space-y-1">
                  <p className="font-semibold text-tsa-text">No records match the current filter selection.</p>
                  <p>Try resetting or broadening your filter criteria.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 5. Research Insights Section */}
        {!loading && !error && data && (
          <ResearchInsightsSection insights={data.insights} />
        )}
      </div>
    </div>
  );
}
