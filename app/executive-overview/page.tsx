"use client";

import React, { useEffect, useState, useMemo } from "react";
import KPICard from "@/components/KPICard";
import ChartCard from "@/components/ChartCard";
import PlotlyChart from "@/components/PlotlyChart";
import FilterChips from "@/components/FilterChips";
import InsightCard from "@/components/InsightCard";
import ResearchMetricsCard from "@/components/ResearchMetricsCard";
import ExportDashboardButton from "@/components/ExportDashboardButton";
import Breadcrumbs from "@/components/Breadcrumbs";
import { KPISkeleton, ChartSkeleton } from "@/components/SkeletonLoader";
import { useFilterContext } from "@/context/FilterContext";
import { loadAnalyticsDataset, filterAnalyticalRecords, computeExecutiveAnalytics } from "@/lib/executiveAnalytics";
import { AnalyticalRecord } from "@/lib/types";
import {
  LayoutDashboard,
  FileSpreadsheet,
  DollarSign,
  Scale,
  Plane,
  Sparkles,
  MousePointerClick,
} from "lucide-react";

export default function ExecutiveOverviewPage() {
  const { filters, setFilter } = useFilterContext();
  const [allRecords, setAllRecords] = useState<AnalyticalRecord[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const data = await loadAnalyticsDataset();
        setAllRecords(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load analytical dataset.";
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
    return computeExecutiveAnalytics(filteredRecords);
  }, [filteredRecords]);

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

  const handleTopAirportsClick = (eventData: { points: Array<{ label?: string; y?: unknown }> }) => {
    if (eventData.points && eventData.points.length > 0) {
      const clickedAirport = String(eventData.points[0].y || eventData.points[0].label || "").trim();
      if (clickedAirport && clickedAirport !== "Unknown") {
        setFilter("airport", clickedAirport);
      }
    }
  };

  const handleClaimTypeClick = (eventData: { points: Array<{ label?: string; x?: unknown }> }) => {
    if (eventData.points && eventData.points.length > 0) {
      const clickedType = String(eventData.points[0].label || eventData.points[0].x || "").trim();
      if (clickedType && clickedType !== "Unknown" && clickedType !== "Other") {
        setFilter("claimType", clickedType);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs />

      {/* 2. Header Bar with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tsa-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-tsa-accent text-xs font-bold uppercase tracking-wider">
            <LayoutDashboard className="w-4 h-4" />
            <span>Enterprise Strategic Operations Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-tsa-text tracking-tight">
            Executive Overview Dashboard
          </h1>
          <p className="text-sm text-tsa-muted max-w-4xl leading-relaxed">
            High-level operational performance indicators, annual trend analysis, airport rankings, and national TSA Lost & Found insights.
          </p>
        </div>

        {allRecords && analytics && (
          <ExportDashboardButton
            records={filteredRecords}
            kpis={analytics.kpis}
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

          <div className="flex items-center gap-2 text-[11px] text-tsa-muted">
            <MousePointerClick className="w-3.5 h-3.5 text-tsa-accent" />
            <span>Click chart bars or donut slices to filter</span>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
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
          {/* 4. KPI Section: 4 Enterprise KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Claims"
              value={analytics.kpis.totalClaims.toLocaleString()}
              subtitle="Filtered claim count"
              icon={<FileSpreadsheet className="w-5 h-5 text-tsa-accent" />}
              trend="Filtered Result"
              trendDirection="neutral"
            />
            <KPICard
              title="Total Settlement Amount"
              value={`$${analytics.kpis.totalSettlement.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              subtitle="Aggregated payout sum"
              icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
              trend="Financial Loss"
              trendDirection="neutral"
            />
            <KPICard
              title="Average Settlement"
              value={`$${analytics.kpis.avgSettlement.toFixed(2)}`}
              subtitle="Per recorded filing"
              icon={<Scale className="w-5 h-5 text-amber-400" />}
              trend="Avg Settlement"
              trendDirection="neutral"
            />
            <KPICard
              title="Airports Covered"
              value={analytics.kpis.airportsCovered}
              subtitle="Distinct airports in subset"
              icon={<Plane className="w-5 h-5 text-blue-400" />}
              trend="Airports Network"
              trendDirection="neutral"
            />
          </div>

          {/* 5. Four Flagship Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flagship Chart 1: Monthly Claim Volume Trend */}
            <ChartCard
              title="Monthly Claim Volume Trend"
              subtitle="When do claims peak? Aggregated monthly travel loss distribution"
              badge="Interactive Line Plot"
              height="h-80"
            >
              <PlotlyChart
                data={[
                  {
                    x: analytics.chartSeries.monthlyTrend.x,
                    y: analytics.chartSeries.monthlyTrend.y,
                    type: "scatter",
                    mode: "lines+markers",
                    line: { color: "#4DA3FF", width: 3, shape: "spline" },
                    marker: { color: "#1E5AA8", size: 8 },
                    name: "Claims Count",
                    hovertemplate: "Month: %{x}<br>Claims: %{y:,}<extra></extra>",
                  },
                ]}
                layout={{
                  margin: { t: 20, r: 20, l: 50, b: 40 },
                  xaxis: { title: { text: "Calendar Month" } },
                  yaxis: { title: { text: "Claim Filings" } },
                }}
              />
            </ChartCard>

            {/* Flagship Chart 2: Top 10 Airports by Claim Volume */}
            <ChartCard
              title="Top 10 Airports by Claim Volume"
              subtitle="Which airports receive most claims? (Click bar to filter)"
              badge="Interactive Bar Plot"
              height="h-80"
            >
              <PlotlyChart
                onPlotClick={handleTopAirportsClick}
                data={[
                  {
                    type: "bar",
                    orientation: "h",
                    x: analytics.chartSeries.topAirports.x,
                    y: analytics.chartSeries.topAirports.y,
                    marker: {
                      color: "#1E5AA8",
                      line: { color: "#4DA3FF", width: 1.5 },
                    },
                    text: analytics.chartSeries.topAirports.x.map((c: number) => c.toLocaleString()),
                    textposition: "auto",
                    hovertemplate:
                      "Airport: %{y}<br>Claims: %{x:,}<br>Settlement: $%{customdata:,.2f}<extra></extra>",
                    customdata: analytics.chartSeries.topAirports.amounts,
                  },
                ]}
                layout={{
                  margin: { t: 20, r: 20, l: 60, b: 40 },
                  xaxis: { title: { text: "Number of Claims" } },
                  yaxis: { title: { text: "Airport Code" } },
                }}
              />
            </ChartCard>

            {/* Flagship Chart 3: Premium Executive Donut (Top 5 + "Other") */}
            <ChartCard
              title="Claim Type Distribution (Top 5 + Other)"
              subtitle="What types of claims dominate? (Click slice to filter)"
              badge="Executive Donut"
              height="h-80"
            >
              <PlotlyChart
                onPlotClick={handleClaimTypeClick}
                data={[
                  {
                    type: "pie",
                    labels: analytics.chartSeries.claimTypeDistribution.labels,
                    values: analytics.chartSeries.claimTypeDistribution.values,
                    hole: 0.6,
                    textinfo: "percent",
                    textposition: "inside",
                    marker: {
                      colors: ["#1E5AA8", "#4DA3FF", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"],
                    },
                    hovertemplate: "Type: %{label}<br>Claims: %{value:,}<br>Share: %{percent}<extra></extra>",
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

            {/* Flagship Chart 4: Year-over-Year Claim Trend */}
            <ChartCard
              title="Year-over-Year Claim Trend (2002 – 2017)"
              subtitle="How has claim volume changed over time? Peak historical trajectory"
              badge="Historical Trend"
              height="h-80"
            >
              <PlotlyChart
                data={[
                  {
                    x: analytics.chartSeries.yearlyTrend.x,
                    y: analytics.chartSeries.yearlyTrend.y,
                    type: "scatter",
                    mode: "lines+markers",
                    fill: "tozeroy",
                    fillcolor: "rgba(30, 90, 168, 0.2)",
                    line: { color: "#1E5AA8", width: 3 },
                    marker: { color: "#4DA3FF", size: 8 },
                    name: "Annual Filings",
                    hovertemplate: "Year: %{x}<br>Claims: %{y:,}<extra></extra>",
                  },
                ]}
                layout={{
                  margin: { t: 30, r: 30, l: 60, b: 50 },
                  xaxis: { title: { text: "Year" } },
                  yaxis: { title: { text: "Total Claims Filings" } },
                  annotations:
                    analytics.chartSeries.yearlyTrend.peakYear !== "N/A"
                      ? [
                          {
                            x: analytics.chartSeries.yearlyTrend.peakYear,
                            y: analytics.chartSeries.yearlyTrend.peakCount,
                            text: `Historical Peak: ${analytics.chartSeries.yearlyTrend.peakYear} (${analytics.chartSeries.yearlyTrend.peakCount.toLocaleString()})`,
                            showarrow: true,
                            arrowhead: 2,
                            ax: 0,
                            ay: -40,
                            font: { color: "#4DA3FF", size: 11 },
                            arrowcolor: "#4DA3FF",
                          },
                        ]
                      : [],
                }}
              />
            </ChartCard>
          </div>

          {/* 6. Dynamic Executive Insights Panel */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-tsa-border/60">
              <div className="p-2 rounded-lg bg-tsa-primary/20 border border-tsa-accent/30 text-tsa-accent">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-tsa-text tracking-tight">
                  Automated Executive Intelligence Panel
                </h2>
                <p className="text-xs text-tsa-muted">
                  Dynamically evaluated operational findings based on current selection
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </section>

          {/* 7. Research Metrics Telemetry Card */}
          <ResearchMetricsCard
            filteredCount={filteredRecords.length}
            airportsCount={analytics.kpis.airportsCovered}
            statesCount={new Set(filteredRecords.map((r) => r.State).filter((s) => s && s !== "Unknown")).size}
            yearRange={
              analytics.chartSeries.yearlyTrend.x.length > 0
                ? `${analytics.chartSeries.yearlyTrend.x[0]} – ${analytics.chartSeries.yearlyTrend.x[analytics.chartSeries.yearlyTrend.x.length - 1]}`
                : "2002 – 2017"
            }
          />
        </>
      )}
    </div>
  );
}
