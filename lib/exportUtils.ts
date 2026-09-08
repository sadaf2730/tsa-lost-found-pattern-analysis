import { AnalyticalRecord, ExecutiveKpiData, FinancialKpiData, FilterState, ResearchInsight } from "./types";

/**
 * Converts filtered analytical records to CSV string and triggers browser download.
 */
export function exportFilteredCSV(records: AnalyticalRecord[], filename = "tsa_claims_filtered.csv") {
  if (!records || records.length === 0) {
    alert("No records to export.");
    return;
  }

  const headers = Object.keys(records[0]) as (keyof AnalyticalRecord)[];
  const csvRows = [headers.join(",")];

  records.forEach((r) => {
    const values = headers.map((header) => {
      const val = r[header];
      const escaped = String(val === null || val === undefined ? "" : val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports executive dashboard summary metrics and research findings as a text report file.
 */
export function exportExecutiveReport(
  kpis: ExecutiveKpiData,
  filters: FilterState,
  insights: ResearchInsight[],
  filename = "tsa_executive_summary_report.txt"
) {
  const timestamp = new Date().toISOString();
  
  const reportLines = [
    "============================================================",
    "TSA LOST & FOUND PATTERN ANALYSIS — EXECUTIVE SUMMARY REPORT",
    "============================================================",
    `Generated At: ${timestamp}`,
    "",
    "1. ACTIVE FILTER CONTEXT",
    "------------------------",
    `Year           : ${filters.year}`,
    `State          : ${filters.state}`,
    `Airport        : ${filters.airport}`,
    `Claim Type     : ${filters.claimType}`,
    `Item Category  : ${filters.itemCategory}`,
    `Month          : ${filters.month}`,
    "",
    "2. EXECUTIVE KEY PERFORMANCE INDICATORS",
    "---------------------------------------",
    `Total Claims Filings      : ${kpis.totalClaims.toLocaleString()}`,
    `Total Settlement Amount   : $${kpis.totalSettlement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Average Settlement Value  : $${kpis.avgSettlement.toFixed(2)}`,
    `Covered U.S. Airports    : ${kpis.airportsCovered.toLocaleString()}`,
    "",
    "3. DYNAMIC AUTOMATED RESEARCH FINDINGS",
    "---------------------------------------",
  ];

  insights.forEach((ins, idx) => {
    reportLines.push(`[Finding #${idx + 1}] - ${ins.title} (${ins.category})`);
    reportLines.push(`Severity : ${ins.severity.toUpperCase()}`);
    reportLines.push(`Metric   : ${ins.metric}`);
    reportLines.push(`Summary  : ${ins.summary}`);
    reportLines.push("");
  });

  reportLines.push("============================================================");
  reportLines.push("Transportation Security Administration Open Dataset Research");
  reportLines.push("============================================================");

  const reportString = reportLines.join("\n");
  const blob = new Blob([reportString], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports financial dashboard summary metrics and research findings as a text report file.
 */
export function exportFinancialReport(
  kpis: FinancialKpiData,
  filters: FilterState,
  insights: ResearchInsight[],
  filename = "tsa_financial_summary_report.txt"
) {
  const timestamp = new Date().toISOString();

  const reportLines = [
    "============================================================",
    "TSA LOST & FOUND PATTERN ANALYSIS — FINANCIAL SUMMARY REPORT",
    "============================================================",
    `Generated At: ${timestamp}`,
    "",
    "1. ACTIVE FILTER CONTEXT",
    "------------------------",
    `Year           : ${filters.year}`,
    `State          : ${filters.state}`,
    `Airport        : ${filters.airport}`,
    `Claim Type     : ${filters.claimType}`,
    `Item Category  : ${filters.itemCategory}`,
    `Month          : ${filters.month}`,
    "",
    "2. FINANCIAL KEY PERFORMANCE INDICATORS",
    "---------------------------------------",
    `Total Settlement Amount   : $${kpis.totalSettlement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    `Average Settlement Value  : $${kpis.avgSettlement.toFixed(2)}`,
    `Median Settlement Value   : $${kpis.medianSettlement.toFixed(2)}`,
    `Highest Single Payout     : $${kpis.maxPayout.amount.toLocaleString()} (Airport: ${kpis.maxPayout.airport}, Year: ${kpis.maxPayout.year})`,
    "",
    "3. FINANCIAL RESEARCH FINDINGS",
    "------------------------------",
  ];

  insights.forEach((ins, idx) => {
    reportLines.push(`[Finding #${idx + 1}] - ${ins.title} (${ins.category})`);
    reportLines.push(`Severity : ${ins.severity.toUpperCase()}`);
    reportLines.push(`Metric   : ${ins.metric}`);
    reportLines.push(`Summary  : ${ins.summary}`);
    reportLines.push("");
  });

  reportLines.push("============================================================");

  const reportString = reportLines.join("\n");
  const blob = new Blob([reportString], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
