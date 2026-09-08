"use client";

import { ResearchInsight } from "@/lib/types";
import { AlertTriangle, Info, TrendingUp, ShieldAlert, Sparkles } from "lucide-react";

interface InsightCardProps {
  insight: ResearchInsight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const getSeverityStyle = (severity: ResearchInsight["severity"]) => {
    switch (severity) {
      case "high":
        return {
          badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
        };
      case "warning":
        return {
          badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
        };
      case "medium":
        return {
          badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
          icon: <TrendingUp className="w-4 h-4 text-cyan-400" />,
        };
      case "info":
      default:
        return {
          badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          icon: <Info className="w-4 h-4 text-blue-400" />,
        };
    }
  };

  const style = getSeverityStyle(insight.severity);

  return (
    <div className="bg-tsa-surface border border-tsa-border hover:border-tsa-accent/40 rounded-2xl p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-tsa-muted flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-tsa-accent" />
            {insight.category}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.badge} flex items-center gap-1`}>
            {style.icon}
            {insight.severity.toUpperCase()}
          </span>
        </div>

        <h4 className="text-sm font-bold text-tsa-text leading-snug mb-2">
          {insight.title}
        </h4>

        <p className="text-xs text-tsa-muted leading-relaxed font-normal">
          {insight.summary}
        </p>
      </div>

      <div className="pt-3 border-t border-tsa-border/40 flex items-center justify-between text-xs">
        <span className="text-[11px] text-tsa-muted font-medium">Analytical Finding</span>
        <span className="font-bold text-tsa-accent bg-tsa-primary/20 px-2.5 py-1 rounded-md border border-tsa-accent/20">
          {insight.metric}
        </span>
      </div>
    </div>
  );
}
