"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { Loader2 } from "lucide-react";
import type { Data, Layout, Config } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center p-8 text-tsa-muted">
      <Loader2 className="w-6 h-6 animate-spin text-tsa-accent" />
    </div>
  ),
});

export interface PlotlyClickPoint {
  label?: string;
  x?: unknown;
  y?: unknown;
  pointIndex?: number;
  customdata?: unknown;
  text?: string;
}

interface PlotlyChartProps {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  onPlotClick?: (eventData: { points: Array<PlotlyClickPoint> }) => void;
  style?: React.CSSProperties;
}

export default function PlotlyChart({
  data,
  layout = {},
  config = {},
  onPlotClick,
  style = { width: "100%", height: "100%" },
}: PlotlyChartProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 text-tsa-muted">
        <Loader2 className="w-6 h-6 animate-spin text-tsa-accent" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const themeLayout: Partial<Layout> = {
    autosize: true,
    margin: { t: 30, r: 25, l: 60, b: 50 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: {
      family: "var(--font-inter), system-ui, sans-serif",
      color: isDark ? "#F8FAFC" : "#1F2937",
      size: 11,
    },
    xaxis: {
      gridcolor: isDark ? "#274060" : "#E2E8F0",
      zerolinecolor: isDark ? "#274060" : "#E2E8F0",
      tickfont: { color: isDark ? "#94A3B8" : "#6B7280" },
      ...layout.xaxis,
    },
    yaxis: {
      gridcolor: isDark ? "#274060" : "#E2E8F0",
      zerolinecolor: isDark ? "#274060" : "#E2E8F0",
      tickfont: { color: isDark ? "#94A3B8" : "#6B7280" },
      ...layout.yaxis,
    },
    hoverlabel: {
      bgcolor: isDark ? "#12263A" : "#FFFFFF",
      font: { color: isDark ? "#F8FAFC" : "#1F2937", family: "var(--font-inter)" },
      bordercolor: isDark ? "#274060" : "#D1D5DB",
    },
    legend: {
      font: { color: isDark ? "#F8FAFC" : "#1F2937" },
      orientation: "h",
      y: -0.2,
      ...layout.legend,
    },
    ...layout,
  };

  const defaultConfig: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ["lasso2d", "select2d"],
    toImageButtonOptions: {
      format: "png",
      filename: "tsa_analytics_chart",
      height: 600,
      width: 900,
      scale: 2,
    },
    ...config,
  };

  return (
    <Plot
      data={data}
      layout={themeLayout}
      config={defaultConfig}
      onClick={onPlotClick ? (e) => onPlotClick(e as { points: Array<PlotlyClickPoint> }) : undefined}
      style={style}
      useResizeHandler
      className="w-full h-full"
    />
  );
}
