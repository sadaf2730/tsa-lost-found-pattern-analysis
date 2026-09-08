"use client";

import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText, ChevronDown, Check } from "lucide-react";
import { exportFilteredCSV, exportExecutiveReport } from "@/lib/exportUtils";
import { AnalyticalRecord, ExecutiveKpiData, FilterState, ResearchInsight } from "@/lib/types";

interface ExportDashboardButtonProps {
  records: AnalyticalRecord[];
  kpis: ExecutiveKpiData;
  filters: FilterState;
  insights: ResearchInsight[];
}

export default function ExportDashboardButton({
  records,
  kpis,
  filters,
  insights,
}: ExportDashboardButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportedType, setExportedType] = useState<string | null>(null);

  const handleExportCSV = () => {
    exportFilteredCSV(records, `tsa_filtered_claims_${new Date().toISOString().slice(0, 10)}.csv`);
    setExportedType("CSV");
    setIsOpen(false);
    setTimeout(() => setExportedType(null), 3000);
  };

  const handleExportReport = () => {
    exportExecutiveReport(
      kpis,
      filters,
      insights,
      `tsa_executive_report_${new Date().toISOString().slice(0, 10)}.txt`
    );
    setExportedType("Report");
    setIsOpen(false);
    setTimeout(() => setExportedType(null), 3000);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="px-4 py-2 rounded-xl bg-tsa-primary hover:bg-tsa-accent text-white font-semibold text-xs flex items-center gap-2 shadow-md hover:shadow-glow transition-all duration-200"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Export Current Dashboard</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-tsa-surface border border-tsa-border shadow-lg z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95">
          <button
            onClick={handleExportCSV}
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-tsa-text hover:bg-tsa-bg rounded-lg transition-colors text-left"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="font-bold">Export Filtered Data (CSV)</p>
              <p className="text-[10px] text-tsa-muted">Download {records.length.toLocaleString()} rows</p>
            </div>
          </button>

          <button
            onClick={handleExportReport}
            type="button"
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-tsa-text hover:bg-tsa-bg rounded-lg transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-tsa-accent" />
            <div>
              <p className="font-bold">Export Summary Report (TXT)</p>
              <p className="text-[10px] text-tsa-muted">Metrics & findings summary</p>
            </div>
          </button>
        </div>
      )}

      {exportedType && (
        <div className="absolute top-full right-0 mt-1 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
          <Check className="w-3 h-3" />
          <span>Exported {exportedType}!</span>
        </div>
      )}
    </div>
  );
}
