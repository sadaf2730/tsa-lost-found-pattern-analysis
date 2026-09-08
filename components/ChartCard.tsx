"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
  height?: string;
}

export default function ChartCard({
  title,
  subtitle,
  badge = "Plotly Ready",
  children,
  height = "h-80",
}: ChartCardProps) {
  return (
    <div className="bg-tsa-surface border border-tsa-border rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex items-center justify-between border-b border-tsa-border/50 pb-3">
        <div>
          <h3 className="text-sm font-bold text-tsa-text tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-tsa-muted mt-0.5">{subtitle}</p>}
        </div>
        {badge && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-tsa-primary/20 text-tsa-accent border border-tsa-accent/30">
            {badge}
          </span>
        )}
      </div>

      <div className={`w-full ${height} flex items-center justify-center rounded-xl bg-tsa-bg/60 border border-dashed border-tsa-border p-4 relative`}>
        {children ? (
          children
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-6 text-tsa-muted space-y-2">
            <BarChart3 className="w-8 h-8 text-tsa-accent/50 animate-pulse" />
            <p className="text-xs font-semibold text-tsa-text">Interactive Visualization Container</p>
            <p className="text-[11px] max-w-sm">
              Plotly.js chart engine integrated and ready for Phase 2 dynamic rendering.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
