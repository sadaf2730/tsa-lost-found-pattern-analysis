"use client";

import React, { useEffect, useState, useMemo } from "react";
import KPICard from "@/components/KPICard";
import ChartCard from "@/components/ChartCard";
import PlotlyChart from "@/components/PlotlyChart";
import MapChart from "@/components/MapChart";
import StateSnapshotPanel from "@/components/StateSnapshotPanel";
import FilterChips from "@/components/FilterChips";
import InsightCard from "@/components/InsightCard";
import ResearchMetricsCard from "@/components/ResearchMetricsCard";
import ExportDashboardButton from "@/components/ExportDashboardButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { KPISkeleton, ChartSkeleton } from "@/components/SkeletonLoader";
import { useFilterContext } from "@/context/FilterContext";
import { loadAnalyticsDataset, filterAnalyticalRecords } from "@/lib/executiveAnalytics";
import { loadAirportCoordinates, computeOperationalAnalytics } from "@/lib/operationalAnalytics";
import { AnalyticalRecord, AirportCoordsMap } from "@/lib/types";
import {
  Compass,
  ShieldCheck,
  AlertCircle,
  Clock,
  Ban,
  BrainCircuit,
} from "lucide-react";

export default function OperationalInsightsPage() {
  const { filters, setFilter } = useFilterContext();
  const [allRecords, setAllRecords] = useState<AnalyticalRecord[] | null>(null);
  const [airportCoords, setAirportCoords] = useState<AirportCoordsMap | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const [recordsData, coordsData] = await Promise.all([
          loadAnalyticsDataset(),
          loadAirportCoordinates(),
        ]);
        setAllRecords(recordsData);
        setAirportCoords(coordsData);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load operational datasets.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredRecords = useMemo(() => {
    if (!allRecords) return [];
    return filterAnalyticalRecords(allRecords, filters);
  }, [allRecords, filters]);

  const analytics = useMemo(() => {
    if (!airportCoords) return null;
    return computeOperationalAnalytics(filteredRecords, airportCoords, filters);
  }, [filteredRecords, airportCoords, filters]);

  const activeFiltersSummaryString = useMemo(() => {
    const parts: string[] = [];
    if (filters.state !== "All") parts.push(`State: ${filters.state}`);
    if (filters.airport !== "All") parts.push(`Airport: ${filters.airport}`);
    if (filters.year !== "All") parts.push(`Year: ${filters.year}`);
    if (filters.claimType !== "All") parts.push(`Type: ${filters.claimType}`);
    if (filters.itemCategory !== "All") parts.push(`Category: ${filters.itemCategory}`);
    if (filters.month !== "All") parts.push(`Month: ${filters.month}`);
    return parts.length > 0 ? parts.join(" • ") : "All TSA Claims Dataset (Unfiltered)";
  }, [filters]);

  const handleStateClick = (eventData: { points: Array<{ label?: string; y?: unknown }> }) => {
    if (eventData.points && eventData.points.length > 0) {
      const clickedState = String(eventData.points[0].y || eventData.points[0].label || "").trim();
      if (clickedState && clickedState !== "Unknown") {
        setFilter("state", clickedState);
      }
    }
  };

  const handleAirportClick = (airportCode: string) => {
    if (airportCode && airportCode !== "Unknown") {
      setFilter("airport", airportCode);
    }
  };

  const handleClaimSiteClick = (eventData: { points: Array<{ label?: string; x?: unknown }> }) => {
    if (eventData.points && eventData.points.length > 0) {
      const clickedSite = String(eventData.points[0].label || eventData.points[0].x || "").trim();
      if (clickedSite && clickedSite !== "Unknown" && clickedSite !== "Other") {
        setFilter("claimType", clickedSite);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Breadcrumbs Navigation */}
      <Breadcrumbs />

      {/* 2. Header Bar with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tsa-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-tsa-accent text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Operational & Spatial Intelligence Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-tsa-text tracking-tight">
            Operational & Geographic Intelligence Dashboard
          </h1>
          <p className="text-sm text-tsa-muted max-w-4xl leading-relaxed">
            Analyze airport vulnerabilities, geographic claim concentrations, operational risk zones, and item-category patterns across the United States.
          </p>
        </div>

        {allRecords && analytics && (
          <ExportDashboardButton
            records={filteredRecords}
            kpis={{
              totalClaims: filteredRecords.length,
              totalSettlement: filteredRecords.reduce(
                (acc, r) => acc + (typeof r.Close_Amount === "number" ? r.Close_Amount : 0),
                0
              ),
              avgSettlement:
                filteredRecords.length > 0
                  ? filteredRecords.reduce(
                      (acc, r) => acc + (typeof r.Close_Amount === "number" ? r.Close_Amount : 0),
                      0
                    ) / filteredRecords.length
                  : 0,
              airportsCovered: analytics.chartSeries.airportMap.length,
            }}
            filters={filters}
            insights={analytics.insights}
          />
        )}
      </div>

      {/* 3. Active Filter Context Summary Banner */}
      <div className="bg-tsa-surface border border-tsa-border rounded-2xl p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-tsa-muted">
              Active Context Filter:
            </span>
            <span className="text-xs font-bold text-tsa-accent bg-tsa-primary/20 px-3 py-1 rounded-lg border border-tsa-accent/30">
              {activeFiltersSummaryString}
            </span>
          </div>
        </div>

        <FilterChips />
      </div>

      {/* Skeleton Loading State */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
          </div>
          <ChartSkeleton height="h-96" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl text-xs space-y-1">
          <p className="font-bold text-sm">Dataset Load Failure</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && allRecords && analytics && (
        <>
          {/* 4. Live Operational KPI Cards (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Primary Claim Site"
              value={analytics.kpis.primarySite}
              subtitle={`${analytics.kpis.primarySitePct}% of recorded filings`}
              icon={<ShieldCheck className="w-5 h-5 text-tsa-accent" />}
              trend={`${analytics.kpis.primarySitePct}% Share`}
              trendDirection="neutral"
            />
            <KPICard
              title="Highest Risk Category"
              value={analytics.kpis.highestRiskCategory}
              subtitle="Most frequent loss category"
              icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
              trend="Critical Risk"
              trendDirection="down"
            />
            <KPICard
              title="Peak Operational Month"
              value={analytics.kpis.peakMonth}
              subtitle="Highest volume travel month"
              icon={<Clock className="w-5 h-5 text-blue-400" />}
              trend="Seasonal Peak"
              trendDirection="neutral"
            />
            <KPICard
              title="Denial Rate"
              value={`${analytics.kpis.denialRate}%`}
              subtitle="Claims rejected upon review"
              icon={<Ban className="w-5 h-5 text-amber-400" />}
              trend="Rejection Rate"
              trendDirection="neutral"
            />
          </div>

          {/* 5. State Snapshot Panel (If state is active) */}
          {analytics.stateSnapshot && (
            <StateSnapshotPanel
              snapshot={analytics.stateSnapshot}
              onClearState={() => setFilter("state", "All")}
            />
          )}

          {/* 6. Flagship Visualization 1: Hybrid U.S. Geographic Map */}
          <MapChart
            airportData={analytics.chartSeries.airportMap}
            selectedState={filters.state}
            onAirportClick={handleAirportClick}
          />

          {/* 7. Grid of 3 Additional Flagship Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flagship Visualization 2: State Claim Density */}
            <ChartCard
              title="State Claim Density (Top 10 States)"
              badge="Geographic Ranking"
              height="h-80"
            >
              <PlotlyChart
                onPlotClick={handleStateClick}
                data={[
                  {
                    type: "bar",
                    orientation: "h",
                    x: analytics.chartSeries.stateRankings.x,
                    y: analytics.chartSeries.stateRankings.y,
                    marker: {
                      color: "#1E5AA8",
                      line: { color: "#4DA3FF", width: 1.5 },
                    },
                    text: analytics.chartSeries.stateRankings.x.map((c: number) => c.toLocaleString()),
                    textposition: "auto",
                    hovertemplate:
                      "State: %{y}<br>Claims: %{x:,}<br>Settlement: $%{customdata:,.2f}<extra></extra>",
                    customdata: analytics.chartSeries.stateRankings.amounts,
                  },
                ]}
                layout={{
                  margin: { t: 20, r: 20, l: 50, b: 40 },
                  xaxis: { title: { text: "Total Claims Filings" } },
                  yaxis: { title: { text: "State Code" } },
                }}
              />
            </ChartCard>

            {/* Flagship Visualization 3: Claim Site Distribution (Top 3 + Other Donut) */}
            <ChartCard
              title="Claim Site Distribution (Top 3 + Other)"
              badge="Executive Donut"
              height="h-80"
            >
              <PlotlyChart
                onPlotClick={handleClaimSiteClick}
                data={[
                  {
                    type: "pie",
                    labels: analytics.chartSeries.claimSiteDistribution.labels,
                    values: analytics.chartSeries.claimSiteDistribution.values,
                    hole: 0.6,
                    textinfo: "percent",
                    textposition: "inside",
                    marker: {
                      colors: ["#1E5AA8", "#4DA3FF", "#FFBB28", "#00C49F"],
                    },
                    hovertemplate: "Site: %{label}<br>Claims: %{value:,}<br>Share: %{percent}<extra></extra>",
                  },
                ]}
                layout={{
                  margin: { t: 20, r: 140, l: 20, b: 20 },
                  showlegend: true,
                  legend: {
                    orientation: "v",
                    x: 1.05,
                    y: 0.5,
                    xanchor: "left",
                    yanchor: "middle",
                  },
                }}
              />
            </ChartCard>
          </div>

          {/* Flagship Visualization 4: Monthly Operational Heatmap (Full Width) */}
          <ChartCard
            title="Monthly Operational Heatmap (Years x Months)"
            badge="Seasonal Heatmap"
            height="h-96"
          >
            <PlotlyChart
              data={[
                {
                  type: "heatmap",
                  x: analytics.chartSeries.operationalHeatmap.months,
                  y: analytics.chartSeries.operationalHeatmap.years,
                  z: analytics.chartSeries.operationalHeatmap.z,
                  colorscale: [
                    [0, "#081A2B"],
                    [0.2, "#12263A"],
                    [0.5, "#1E5AA8"],
                    [0.8, "#4DA3FF"],
                    [1.0, "#FF4D4D"],
                  ],
                  hovertemplate: "Year: %{y}<br>Month: %{x}<br>Claims: %{z:,}<extra></extra>",
                },
              ]}
              layout={{
                margin: { t: 20, r: 20, l: 60, b: 50 },
                xaxis: { title: { text: "Calendar Month" } },
                yaxis: { title: { text: "Historical Year" } },
              }}
            />
          </ChartCard>

          {/* 8. AI Dynamic Geographic Insights Panel */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-tsa-border/60">
              <div className="p-2 rounded-lg bg-tsa-primary/20 border border-tsa-accent/30 text-tsa-accent">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-tsa-text tracking-tight">
                Automated Geographic Intelligence Panel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </section>

          {/* 9. Academic Telemetry Card */}
          <ResearchMetricsCard
            filteredCount={filteredRecords.length}
            airportsCount={analytics.chartSeries.airportMap.length}
            statesCount={new Set(filteredRecords.map((r) => r.State).filter((s) => s && s !== "Unknown")).size}
            yearRange={
              analytics.chartSeries.operationalHeatmap.years.length > 0
                ? `${analytics.chartSeries.operationalHeatmap.years[0]} – ${analytics.chartSeries.operationalHeatmap.years[analytics.chartSeries.operationalHeatmap.years.length - 1]}`
                : "2002 – 2017"
            }
          />
        </>
      )}
    </div>
  );
}
