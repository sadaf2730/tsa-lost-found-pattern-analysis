"use client";

export function KPISkeleton() {
  return (
    <div className="bg-tsa-surface border border-tsa-border rounded-2xl p-5 shadow-card space-y-3 animate-pulse">
      <div className="h-3 bg-tsa-bg rounded w-1/2" />
      <div className="h-8 bg-tsa-bg rounded w-3/4" />
      <div className="h-3 bg-tsa-bg rounded w-1/3" />
    </div>
  );
}

export function ChartSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <div className="bg-tsa-surface border border-tsa-border rounded-2xl p-5 shadow-card space-y-4 animate-pulse">
      <div className="flex items-center justify-between border-b border-tsa-border/50 pb-3">
        <div className="space-y-1.5 w-1/2">
          <div className="h-4 bg-tsa-bg rounded w-2/3" />
          <div className="h-3 bg-tsa-bg rounded w-1/2" />
        </div>
        <div className="h-5 bg-tsa-bg rounded w-20" />
      </div>
      <div className={`w-full ${height} rounded-xl bg-tsa-bg/60 border border-dashed border-tsa-border/50 flex items-center justify-center`} />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="bg-tsa-surface border border-tsa-border rounded-2xl p-5 shadow-card space-y-4 animate-pulse">
      <div className="h-4 bg-tsa-bg rounded w-1/4" />
      <div className="space-y-2">
        <div className="h-8 bg-tsa-bg rounded w-full" />
        <div className="h-6 bg-tsa-bg/60 rounded w-full" />
        <div className="h-6 bg-tsa-bg/60 rounded w-full" />
        <div className="h-6 bg-tsa-bg/60 rounded w-full" />
        <div className="h-6 bg-tsa-bg/60 rounded w-full" />
      </div>
    </div>
  );
}
