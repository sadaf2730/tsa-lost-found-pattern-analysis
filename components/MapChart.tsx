"use client";

import React, { useMemo } from "react";
import PlotlyChart from "./PlotlyChart";
import { AirportRiskData } from "@/lib/types";
import { Compass, Info } from "lucide-react";
import { useTheme } from "next-themes";
import type { Data } from "plotly.js";

interface MapChartProps {
  airportData: AirportRiskData[];
  selectedState?: string;
  onAirportClick?: (code: string) => void;
}

// State bounding boxes for auto-zooming
const STATE_BOUNDS: Record<string, { lat: [number, number]; lon: [number, number] }> = {
  CA: { lat: [32.5, 42], lon: [-124.5, -114] },
  NY: { lat: [40.5, 45], lon: [-79.8, -71.8] },
  TX: { lat: [25.8, 36.5], lon: [-106.6, -93.5] },
  FL: { lat: [24.5, 31], lon: [-87.6, -80] },
  IL: { lat: [37, 42.5], lon: [-91.5, -87.5] },
  GA: { lat: [30.4, 35], lon: [-85.6, -80.8] },
  WA: { lat: [45.5, 49], lon: [-124.8, -116.9] },
  CO: { lat: [37, 41], lon: [-109, -102] },
  NV: { lat: [35, 42], lon: [-120, -114] },
  MA: { lat: [41.2, 42.9], lon: [-73.5, -69.9] },
};

export default function MapChart({
  airportData,
  selectedState = "All",
  onAirportClick,
}: MapChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Filter airports by state if a state is selected for zoom/highlighting
  const activeAirports = useMemo(() => {
    return selectedState !== "All"
      ? airportData.filter((a) => a.state === selectedState)
      : airportData;
  }, [airportData, selectedState]);

  const displayAirports = activeAirports.length > 0 ? activeAirports : airportData;

  // Compute state-level claim counts for the Choropleth State Density layer
  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    airportData.forEach((a) => {
      if (a.state && a.state !== "Unknown") {
        counts[a.state] = (counts[a.state] || 0) + a.claims;
      }
    });
    return counts;
  }, [airportData]);

  const stateCodes = Object.keys(stateCounts);
  const stateClaimValues = Object.values(stateCounts);

  // Sizing for airport bubble markers
  const maxClaims = Math.max(...displayAirports.map((a) => a.claims), 10);
  const lats = displayAirports.map((a) => a.lat);
  const lons = displayAirports.map((a) => a.lon);
  const sizes = displayAirports.map((a) => Math.max(6, Math.sqrt(a.claims / maxClaims) * 28));
  const colors = displayAirports.map((a) => a.riskScore);

  const hoverTexts = displayAirports.map(
    (a) =>
      `<b>${a.name} (${a.code})</b><br>` +
      `State: ${a.state}<br>` +
      `Claims: ${a.claims.toLocaleString()}<br>` +
      `Settlement: $${a.settlement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br>` +
      `Avg Settlement: $${a.avgSettlement.toFixed(2)}<br>` +
      `Denial Rate: ${a.denialRate.toFixed(1)}%<br>` +
      `<b>Operational Risk Score: ${a.riskScore}/100</b>`
  );

  const handlePlotClick = (e: { points: Array<{ pointIndex?: number; location?: string }> }) => {
    if (e.points && e.points.length > 0 && onAirportClick) {
      const idx = e.points[0].pointIndex;
      if (idx !== undefined && displayAirports[idx]) {
        onAirportClick(displayAirports[idx].code);
      }
    }
  };

  const bounds = selectedState !== "All" ? STATE_BOUNDS[selectedState] : null;

  const geoLayout = {
    scope: "usa" as const,
    projection: { type: "albers usa" as const },
    showland: true,
    landcolor: isDark ? "#0E1E2E" : "#F1F5F9",
    subunitcolor: isDark ? "#274060" : "#CBD5E1",
    countrycolor: isDark ? "#274060" : "#94A3B8",
    showlakes: true,
    lakecolor: isDark ? "#081A2B" : "#E2E8F0",
    bgcolor: "transparent",
    ...(bounds
      ? {
          lataxis: { range: bounds.lat },
          lonaxis: { range: bounds.lon },
        }
      : {}),
  };

  // Top airport insight string
  const topApt = [...displayAirports].sort((a, b) => b.claims - a.claims)[0];
  const miniInsightText = topApt
    ? `Hybrid Choropleth Map: State fill intensity shows volume concentration. ${topApt.name} (${topApt.code}) records highest local density with ${topApt.claims.toLocaleString()} claims and Risk Score of ${topApt.riskScore}/100.`
    : "No airport telemetry matching active filter criteria.";

  // Build Dual Traces: 1. State Choropleth Layer + 2. Airport Markers Layer
  const chartData: Data[] = [
    {
      type: "choropleth",
      locationmode: "USA-states",
      locations: stateCodes,
      z: stateClaimValues,
      colorscale: isDark
        ? [
            [0, "rgba(18, 38, 58, 0.4)"],
            [0.5, "rgba(30, 90, 168, 0.5)"],
            [1.0, "rgba(77, 163, 255, 0.7)"],
          ]
        : [
            [0, "rgba(241, 245, 249, 0.6)"],
            [0.5, "rgba(186, 230, 253, 0.7)"],
            [1.0, "rgba(14, 165, 233, 0.8)"],
          ],
      showscale: false,
      hoverinfo: "location+z",
      hovertemplate: "State: %{location}<br>State Claims: %{z:,}<extra></extra>",
    },
    {
      type: "scattergeo",
      mode: "markers",
      lat: lats,
      lon: lons,
      text: hoverTexts,
      hoverinfo: "text",
      marker: {
        size: sizes,
        color: colors,
        colorscale: [
          [0, "#1E5AA8"],
          [0.3, "#00C49F"],
          [0.6, "#FFBB28"],
          [1.0, "#FF4D4D"],
        ],
        cmin: 0,
        cmax: 100,
        colorbar: {
          title: { text: "Risk Score", font: { size: 11, color: isDark ? "#F8FAFC" : "#1F2937" } },
          thickness: 12,
          len: 0.7,
          x: 1.02,
          tickfont: { color: isDark ? "#94A3B8" : "#6B7280", size: 10 },
        },
        opacity: 0.9,
        line: { color: isDark ? "#FFFFFF" : "#0A2540", width: 0.6 },
      },
    },
  ];

  return (
    <div className="bg-tsa-surface border border-tsa-border rounded-2xl p-5 shadow-card space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-tsa-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-tsa-primary/20 border border-tsa-accent/30 text-tsa-accent">
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-tsa-text tracking-tight">
            Hybrid U.S. Geographic Map (Choropleth + Airport Markers)
          </h3>
        </div>
      </div>

      {/* Map Container */}
      <div className="w-full h-[420px] rounded-xl bg-tsa-bg/40 border border-tsa-border/70 overflow-hidden relative">
        <PlotlyChart
          onPlotClick={handlePlotClick}
          data={chartData}
          layout={{
            geo: geoLayout,
            margin: { t: 10, r: 50, l: 10, b: 10 },
          }}
        />
      </div>

      {/* Legends & Mini Insight */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-tsa-bg border border-tsa-border/70 text-xs">
        <div className="flex items-center gap-1.5 text-tsa-text font-medium max-w-2xl">
          <Info className="w-4 h-4 text-tsa-accent shrink-0" />
          <span>{miniInsightText}</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-tsa-muted font-medium self-end sm:self-auto shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tsa-primary inline-block" />
            <span>Low Volume</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block" />
            <span>High Risk (0-100)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
