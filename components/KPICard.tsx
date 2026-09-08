"use client";

import { KPICardProps } from "@/lib/types";

export default function KPICard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = "neutral",
}: KPICardProps) {
  return (
    <div className="relative group bg-tsa-surface border border-tsa-border hover:border-tsa-accent/50 rounded-2xl p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
      {/* Top Accent Line on Hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-tsa-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-tsa-muted">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-tsa-primary/10 border border-tsa-accent/20 text-tsa-accent group-hover:scale-110 transition-transform duration-200">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-tsa-text">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
              trendDirection === "up"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : trendDirection === "down"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-tsa-bg text-tsa-muted border border-tsa-border"
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-tsa-muted mt-2 font-normal">{subtitle}</p>}
    </div>
  );
}
