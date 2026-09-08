"use client";

import React, { useEffect, useState, useMemo } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import KPICard from "@/components/KPICard";
import ChartCard from "@/components/ChartCard";
import PlotlyChart from "@/components/PlotlyChart";
import FilterChips from "@/components/FilterChips";
import InsightCard from "@/components/InsightCard";
import ExportDashboardButton from "@/components/ExportDashboardButton";
import { KPISkeleton, ChartSkeleton } from "@/components/SkeletonLoader";
import { useFilterContext } from "@/context/FilterContext";
import { loadAnalyticsDataset, filterAnalyticalRecords } from "@/lib/executiveAnalytics";
import { computeFinancialAnalytics } from "@/lib/financialAnalytics";
import { AnalyticalRecord } from "@/lib/types";
import {
  DollarSign,
  Scale,
  Award,
  PieChart,
  BrainCircuit,
  MousePointerClick,
} from "lucide-react";

export default function FinancialAnalysisPage() {
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
        const msg = err instanceof Error ? err.message : "Failed to load financial analytical dataset.";
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
    return computeFinancialAnalytics(filteredRecords);
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

  const handleAirportClick = (eventData: { points: Array<{ label?: string; y?: unknown }> }) => {
    if (eventData.points && eventData.points.length > 0) {
      const clickedAirport = String(eventData.points[0].y || eventData.points[0].label || "").trim();
      if (clickedAirport && clickedAirport !== "Unknown") {
        setFilter("airport", clickedAirport);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Breadcrumb Navigation */}
      <Breadcrumbs />

      {/* 2. Header Bar with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tsa-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-tsa-accent text-xs font-bold uppercase tracking-wider">
            <DollarSign className="w-4 h-4" />
            <span>Financial Liability & Payout Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-tsa-text tracking-tight">
            Financial & Pattern Analysis Dashboard
          </h1>
          <p className="text-sm text-tsa-muted max-w-4xl leading-relaxed">
            Analyze settlement trends, payout behavior, airport financial impact, and claim-value patterns across historical TSA data.
          </p>
        </div>

        {allRecords && analytics && (
          <ExportDashboardButton
            records={filteredRecords}
            kpis={{
              totalClaims: filteredRecords.length,
              totalSettlement: analytics.kpis.totalSettlement,
              avgSettlement: analytics.kpis.avgSettlement,
              airportsCovered: analytics.chartSeries.topAirportsSettlement.y.length,
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

          <div className="flex items-center gap-2 text-[11px] text-tsa-muted">
            <MousePointerClick className="w-3.5 h-3.5 text-tsa-accent" />
            <span>Click airport bars to slice dashboard</span>
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
          {/* 4. KPI Section: 4 Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Settlement Amount"
              value={`$${analytics.kpis.totalSettlement.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              subtitle="Cumulative settlement expenditure"
              icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
              trend="Total Disbursal"
              trendDirection="neutral"
            />
            <KPICard
              title="Average Settlement"
              value={`$${analytics.kpis.avgSettlement.toFixed(2)}`}
              subtitle="Mean payout per settled case"
              icon={<Scale className="w-5 h-5 text-tsa-accent" />}
              trend="Mean Value"
              trendDirection="neutral"
            />
            <KPICard
              title="Highest Single Payout"
              value={`$${analytics.kpis.maxPayout.amount.toLocaleString()}`}
              subtitle={`${analytics.kpis.maxPayout.airport} (${analytics.kpis.maxPayout.year})`}
              icon={<Award className="w-5 h-5 text-amber-400" />}
              trend="Peak Outlier"
              trendDirection="up"
            />
            <KPICard
              title="Median Settlement"
              value={`$${analytics.kpis.medianSettlement.toFixed(2)}`}
              subtitle="50th percentile payout value"
              icon={<PieChart className="w-5 h-5 text-blue-400" />}
              trend="50th Percentile"
              trendDirection="neutral"
            />
          </div>

          {/* 5. Four Flagship Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Flagship Chart 1: Yearly Settlement Trend */}
            <ChartCard
              title="Yearly Settlement Trend ($)"
              subtitle="How have payouts changed over time? Peak historical expenditure"
              badge="Financial Trend"
              height="h-80"
            >
              <PlotlyChart
                data={[
                  {
                    x: analytics.chartSeries.yearlySettlement.x,
                    y: analytics.chartSeries.yearlySettlement.y,
                    type: "scatter",
                    mode: "lines+markers",
                    fill: "tozeroy",
                    fillcolor: "rgba(0, 196, 159, 0.15)",
                    line: { color: "#00C49F", width: 3 },
                    marker: { color: "#4DA3FF", size: 8 },
                    name: "Total Disbursed ($)",
                    hovertemplate: "Year: %{x}<br>Payout Total: $%{y:,.2f}<extra></extra>",
                  },
                ]}
                layout={{
                  margin: { t: 30, r: 30, l: 70, b: 50 },
                  xaxis: { title: { text: "Year" } },
                  yaxis: { title: { text: "Total Disbursed ($)" } },
                  annotations:
                    analytics.chartSeries.yearlySettlement.peakYear !== "N/A"
                      ? [
                          {
                            x: analytics.chartSeries.yearlySettlement.peakYear,
                            y: analytics.chartSeries.yearlySettlement.peakAmount,
                            text: `Peak Payout: $${(analytics.chartSeries.yearlySettlement.peakAmount / 1e6).toFixed(2)}M`,
                            showarrow: true,
                            arrowhead: 2,
                            ax: 0,
                            ay: -40,
                            font: { color: "#00C49F", size: 11 },
                            arrowcolor: "#00C49F",
                          },
                        ]
                      : [],
                }}
              />
            </ChartCard>

            {/* Flagship Chart 2: Top 10 Airports by Settlement */}
            <ChartCard
              title="Top 10 Airports by Total Settlement ($)"
              subtitle="Which airports create largest financial impact? (Click bar to filter)"
              badge="Airport Liability"
              height="h-80"
            >
              <PlotlyChart
                onPlotClick={handleAirportClick}
                data={[
                  {
                    type: "bar",
                    orientation: "h",
                    x: analytics.chartSeries.topAirportsSettlement.x,
                    y: analytics.chartSeries.topAirportsSettlement.y,
                    marker: {
                      color: "#1E5AA8",
                      line: { color: "#4DA3FF", width: 1.5 },
                    },
                    text: analytics.chartSeries.topAirportsSettlement.x.map(
                      (val: number) => `$${(val / 1e3).toFixed(0)}k`
                    ),
                    textposition: "auto",
                    hovertemplate:
                      "Airport: %{y}<br>Settlement Total: $%{x:,.2f}<br>Claims: %{customdata:,}<extra></extra>",
                    customdata: analytics.chartSeries.topAirportsSettlement.claims,
                  },
                ]}
                layout={{
                  margin: { t: 20, r: 20, l: 60, b: 40 },
                  xaxis: { title: { text: "Total Settlement ($)" } },
                  yaxis: { title: { text: "Airport Code" } },
                }}
              />
            </ChartCard>

            {/* Flagship Chart 3: Settlement Distribution Histogram */}
            <ChartCard
              title="Settlement Value Histogram & Frequency Density"
              subtitle="How are payouts distributed? Frequency density of settlement ranges"
              badge="Value Histogram"
              height="h-80"
            >
              <PlotlyChart
                data={[
                  {
                    type: "histogram",
                    x: analytics.chartSeries.settlementHistogram.x,
                    xbins: { size: 50 },
                    marker: {
                      color: "#1E5AA8",
                      line: { color: "#4DA3FF", width: 1 },
                    },
                    name: "Frequency",
                    hovertemplate: "Payout Range: %{x}<br>Count: %{y:,}<extra></extra>",
                  },
                ]}
                layout={{
                  margin: { t: 20, r: 20, l: 50, b: 50 },
                  xaxis: { title: { text: "Settlement Value ($)" } },
                  yaxis: { title: { text: "Frequency Density" } },
                }}
              />
            </ChartCard>

            {/* Flagship Chart 4: Claim Amount Box Plot */}
            <ChartCard
              title="Claim Amount Box Plot & Statistical Quartiles"
              subtitle="Are there extreme payout outliers? Median, Q1/Q3 quartiles & outliers"
              badge="Box Plot Analysis"
              height="h-80"
            >
              <PlotlyChart
                data={[
                  {
                    type: "box",
                    y: analytics.chartSeries.boxplotData.y,
                    name: "Settlements ($)",
                    marker: { color: "#FF4D4D", size: 5 },
                    boxpoints: "outliers",
                    jitter: 0.3,
                    pointpos: -1.8,
                    fillcolor: "rgba(30, 90, 168, 0.25)",
                    line: { color: "#1E5AA8", width: 3 },
                  },
                ]}
                layout={{
                  margin: { t: 20, r: 30, l: 60, b: 40 },
                  yaxis: { title: { text: "Settlement Amount ($)" } },
                }}
              />
            </ChartCard>
          </div>

          {/* 6. Dynamic Financial Intelligence Panel */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-tsa-border/60">
              <div className="p-2 rounded-lg bg-tsa-primary/20 border border-tsa-accent/30 text-tsa-accent">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-tsa-text tracking-tight">
                  Automated Financial Intelligence Panel
                </h2>
                <p className="text-xs text-tsa-muted">
                  Algorithmic financial liability insights evaluated from active telemetry
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {analytics.insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
