import React, { useMemo } from "react";
import InsightCard from "./InsightCard";
import { ResearchInsight } from "@/lib/types";
import { formatStateReferences } from "@/lib/lookups";
import { BrainCircuit } from "lucide-react";

interface ResearchInsightsSectionProps {
  insights: ResearchInsight[];
}

export default function ResearchInsightsSection({ insights }: ResearchInsightsSectionProps) {
  const formattedInsights = useMemo(() => {
    return insights.map((insight) => ({
      ...insight,
      title: formatStateReferences(insight.title),
      summary: formatStateReferences(insight.summary),
    }));
  }, [insights]);

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-tsa-border/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-tsa-primary/20 border border-tsa-accent/30 text-tsa-accent">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-tsa-text tracking-tight">
            Automated Research Insights
          </h2>
        </div>
      </div>

      {/* Grid of Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {formattedInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </section>
  );
}
