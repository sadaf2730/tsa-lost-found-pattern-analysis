import { AnalyticalRecord, FilterState, ExecutiveKpiData, ChartDataSeries, ResearchInsight } from "./types";

let cachedAnalyticsDataset: AnalyticalRecord[] | null = null;

const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Utility helper to aggregate category distributions into Top N + "Other" slice
 * to prevent chart crowding and label overlap.
 */
export function formatTopNDonutData(
  labels: string[],
  values: number[],
  topN: number = 5
): { labels: string[]; values: number[] } {
  if (!labels || labels.length === 0) return { labels: [], values: [] };

  const pairs = labels.map((label, idx) => ({ label, value: values[idx] || 0 }));
  pairs.sort((a, b) => b.value - a.value);

  if (pairs.length <= topN) {
    return {
      labels: pairs.map((p) => p.label),
      values: pairs.map((p) => p.value),
    };
  }

  const topPairs = pairs.slice(0, topN);
  const otherPairs = pairs.slice(topN);
  const otherSum = otherPairs.reduce((acc, p) => acc + p.value, 0);

  const finalLabels = topPairs.map((p) => p.label);
  const finalValues = topPairs.map((p) => p.value);

  if (otherSum > 0) {
    finalLabels.push("Other");
    finalValues.push(otherSum);
  }

  return { labels: finalLabels, values: finalValues };
}

/**
 * Loads the lightweight row-level analytical dataset from public JSON.
 * Caches in memory for instant multi-dimensional client filtering.
 */
export async function loadAnalyticsDataset(): Promise<AnalyticalRecord[]> {
  if (cachedAnalyticsDataset) {
    return cachedAnalyticsDataset;
  }

  const res = await fetch("/data/analytics_dataset.json");
  if (!res.ok) {
    throw new Error(`Failed to load analytical dataset: ${res.statusText}`);
  }

  const records: AnalyticalRecord[] = await res.json();
  cachedAnalyticsDataset = records;
  return records;
}

/**
 * Filters analytical dataset records dynamically according to active FilterState criteria.
 */
export function filterAnalyticalRecords(
  records: AnalyticalRecord[],
  filters: FilterState
): AnalyticalRecord[] {
  return records.filter((r) => {
    if (filters.year !== "All" && String(r.Year || "").replace(".0", "") !== filters.year) {
      return false;
    }
    if (filters.state !== "All" && String(r.State || "").trim() !== filters.state) {
      return false;
    }
    if (filters.airport !== "All" && String(r.Airport_Code || "").trim() !== filters.airport) {
      return false;
    }
    if (filters.claimType !== "All" && String(r.Claim_Type || "").trim() !== filters.claimType) {
      return false;
    }
    if (filters.itemCategory !== "All" && String(r.Item_Category || "").trim() !== filters.itemCategory) {
      return false;
    }
    if (filters.month !== "All" && String(r.Month || "").trim() !== filters.month) {
      return false;
    }
    return true;
  });
}

/**
 * Re-computes KPIs, 4 Plotly Executive Chart data series, and dynamic insights from filtered records.
 */
export function computeExecutiveAnalytics(filteredRecords: AnalyticalRecord[]) {
  const totalClaims = filteredRecords.length;

  let totalSettlement = 0;
  const airportsSet = new Set<string>();

  filteredRecords.forEach((r) => {
    const amt = typeof r.Close_Amount === "number" ? r.Close_Amount : parseFloat(r.Close_Amount || "0");
    if (!isNaN(amt) && amt > 0) {
      totalSettlement += amt;
    }
    if (r.Airport_Code && r.Airport_Code !== "Unknown") {
      airportsSet.add(r.Airport_Code);
    }
  });

  const avgSettlement = totalClaims > 0 ? totalSettlement / totalClaims : 0;
  const airportsCovered = airportsSet.size;

  const kpis: ExecutiveKpiData = {
    totalClaims,
    totalSettlement,
    avgSettlement,
    airportsCovered,
  };

  // 1. Monthly Trend
  const monthlyCounts: Record<string, number> = {};
  MONTH_ORDER.forEach((m) => (monthlyCounts[m] = 0));

  filteredRecords.forEach((r) => {
    const m = String(r.Month || "").trim();
    if (monthlyCounts[m] !== undefined) {
      monthlyCounts[m] += 1;
    }
  });

  const monthlyTrend = {
    x: MONTH_ORDER.filter((m) => monthlyCounts[m] > 0 || totalClaims === 0),
    y: MONTH_ORDER.filter((m) => monthlyCounts[m] > 0 || totalClaims === 0).map((m) => monthlyCounts[m] || 0),
  };

  // 2. Top 10 Airports by Claim Volume
  const airportCounts: Record<string, { count: number; settlement: number; name: string }> = {};

  filteredRecords.forEach((r) => {
    const code = String(r.Airport_Code || "").trim();
    if (code && code !== "Unknown") {
      if (!airportCounts[code]) {
        airportCounts[code] = { count: 0, settlement: 0, name: String(r.Airport_Name || code) };
      }
      airportCounts[code].count += 1;
      const amt = typeof r.Close_Amount === "number" ? r.Close_Amount : parseFloat(r.Close_Amount || "0");
      if (!isNaN(amt) && amt > 0) {
        airportCounts[code].settlement += amt;
      }
    }
  });

  const sortedAirports = Object.entries(airportCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  const top10Reversed = [...sortedAirports].reverse();

  const topAirports = {
    y: top10Reversed.map(([code]) => code),
    x: top10Reversed.map(([, data]) => data.count),
    amounts: top10Reversed.map(([, data]) => data.settlement),
  };

  // 3. Claim Type Distribution (Top 5 + "Other")
  const rawTypeCounts: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    const type = String(r.Claim_Type || "Other").trim();
    if (type && type !== "Unknown") {
      rawTypeCounts[type] = (rawTypeCounts[type] || 0) + 1;
    }
  });

  const claimTypeDistribution = formatTopNDonutData(
    Object.keys(rawTypeCounts),
    Object.values(rawTypeCounts),
    5
  );

  // 4. Claim Disposition Analysis (for KPI/Insights reference)
  const dispositionCounts: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    let disp = String(r.Disposition || "Unknown").trim();
    if (!disp || disp === "Unknown") disp = "Pending / Unknown";
    dispositionCounts[disp] = (dispositionCounts[disp] || 0) + 1;
  });

  const sortedDispositions = Object.entries(dispositionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const dispositionAnalysis = {
    x: sortedDispositions.map(([disp]) => disp),
    y: sortedDispositions.map(([, count]) => count),
  };

  // 5. Year-over-Year Claim Trend
  const yearlyCounts: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    const y = String(r.Year || "").replace(".0", "").trim();
    if (y && /^\d{4}$/.test(y)) {
      yearlyCounts[y] = (yearlyCounts[y] || 0) + 1;
    }
  });

  const sortedYears = Object.keys(yearlyCounts).sort((a, b) => parseInt(a) - parseInt(b));
  const yearlyY = sortedYears.map((y) => yearlyCounts[y]);

  let peakYear = "N/A";
  let peakCount = 0;
  let troughYear = "N/A";
  let troughCount = Infinity;

  sortedYears.forEach((y) => {
    const c = yearlyCounts[y];
    if (c > peakCount) {
      peakCount = c;
      peakYear = y;
    }
    if (c < troughCount) {
      troughCount = c;
      troughYear = y;
    }
  });

  if (troughCount === Infinity) troughCount = 0;

  const yearlyTrend = {
    x: sortedYears,
    y: yearlyY,
    peakYear,
    peakCount,
    troughYear,
    troughCount,
  };

  const chartSeries: ChartDataSeries = {
    monthlyTrend,
    topAirports,
    claimTypeDistribution,
    dispositionAnalysis,
    yearlyTrend,
  };

  // Dynamic Insights Calculation
  const insights: ResearchInsight[] = [];

  if (totalClaims > 0) {
    if (peakYear !== "N/A") {
      insights.push({
        id: "INS-EXEC-01",
        category: "Temporal Hotspot",
        title: `Peak Claim Filings Recorded in ${peakYear}`,
        summary: `Analytical aggregation identifies ${peakYear} as the highest volume period with ${peakCount.toLocaleString()} verified claims within the filtered subset.`,
        severity: "high",
        metric: `${peakCount.toLocaleString()} Claims`,
      });
    }

    if (sortedAirports.length > 0) {
      const [topCode, topData] = sortedAirports[0];
      const pct = ((topData.count / totalClaims) * 100).toFixed(1);
      insights.push({
        id: "INS-EXEC-02",
        category: "Airport Hub Concentration",
        title: `Dominant Incident Hub: ${topCode}`,
        summary: `Airport ${topCode} (${topData.name}) accounts for ${topData.count.toLocaleString()} claims (${pct}% of current selection) totaling $${topData.settlement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in payouts.`,
        severity: "warning",
        metric: `${topData.count.toLocaleString()} Claims`,
      });
    }

    insights.push({
      id: "INS-EXEC-03",
      category: "Settlement Disbursal",
      title: "Cumulative Payout Telemetry",
      summary: `Filtered sample claims generated a total settlement expenditure of $${totalSettlement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}, with an average resolution payout of $${avgSettlement.toFixed(2)}.`,
      severity: "medium",
      metric: `$${(totalSettlement / 1e6).toFixed(2)}M Payouts`,
    });

    const sortedTypes = Object.entries(rawTypeCounts).sort((a, b) => b[1] - a[1]);
    if (sortedTypes.length > 0) {
      const [topType, count] = sortedTypes[0];
      const pct = ((count / totalClaims) * 100).toFixed(1);
      insights.push({
        id: "INS-EXEC-04",
        category: "Category Pattern",
        title: `Primary Claim Type: ${topType}`,
        summary: `'${topType}' represents ${count.toLocaleString()} claims (${pct}% of current active subset), making it the single largest filing class.`,
        severity: "info",
        metric: `${pct}% Share`,
      });
    }
  }

  return {
    kpis,
    chartSeries,
    insights,
  };
}
