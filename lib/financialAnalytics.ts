import {
  AnalyticalRecord,
  FinancialKpiData,
  FinancialChartSeries,
  ResearchInsight,
} from "./types";

/**
 * Computes complete financial telemetry, 6 Plotly financial chart series, and AI findings from filtered records.
 */
export function computeFinancialAnalytics(filteredRecords: AnalyticalRecord[]) {
  const totalClaims = filteredRecords.length;

  let totalSettlement = 0;
  let maxAmount = 0;
  let maxAirport = "N/A";
  let maxYear = "N/A";

  const nonZeroSettlements: number[] = [];

  filteredRecords.forEach((r) => {
    const amt = typeof r.Close_Amount === "number" ? r.Close_Amount : parseFloat(r.Close_Amount || "0");
    if (!isNaN(amt) && amt > 0) {
      totalSettlement += amt;
      nonZeroSettlements.push(amt);

      if (amt > maxAmount) {
        maxAmount = amt;
        maxAirport = String(r.Airport_Code || "Unknown").trim();
        maxYear = String(r.Year || "").replace(".0", "").trim();
      }
    }
  });

  const settledCount = nonZeroSettlements.length;
  const avgSettlement = settledCount > 0 ? totalSettlement / settledCount : (totalClaims > 0 ? totalSettlement / totalClaims : 0);

  // Compute Median & Quartiles
  const sortedSettlements = [...nonZeroSettlements].sort((a, b) => a - b);
  let medianSettlement = 0;
  let q1 = 0;
  let q3 = 0;

  if (sortedSettlements.length > 0) {
    const mid = Math.floor(sortedSettlements.length / 2);
    medianSettlement =
      sortedSettlements.length % 2 !== 0
        ? sortedSettlements[mid]
        : (sortedSettlements[mid - 1] + sortedSettlements[mid]) / 2;

    const q1Mid = Math.floor(mid / 2);
    q1 = sortedSettlements[q1Mid] || 0;

    const q3Mid = Math.floor(mid + (sortedSettlements.length - mid) / 2);
    q3 = sortedSettlements[q3Mid] || medianSettlement;
  }

  const kpis: FinancialKpiData = {
    totalSettlement,
    avgSettlement,
    maxPayout: {
      amount: maxAmount,
      airport: maxAirport,
      year: maxYear,
    },
    medianSettlement,
  };

  // 1. Yearly Settlement Trend
  const yearlySum: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    const y = String(r.Year || "").replace(".0", "").trim();
    if (y && /^\d{4}$/.test(y)) {
      const amt = typeof r.Close_Amount === "number" ? r.Close_Amount : parseFloat(r.Close_Amount || "0");
      if (!isNaN(amt) && amt > 0) {
        yearlySum[y] = (yearlySum[y] || 0) + amt;
      }
    }
  });

  const sortedYears = Object.keys(yearlySum).sort((a, b) => parseInt(a) - parseInt(b));
  let peakYear = "N/A";
  let peakAmount = 0;

  sortedYears.forEach((y) => {
    if (yearlySum[y] > peakAmount) {
      peakAmount = yearlySum[y];
      peakYear = y;
    }
  });

  const yearlySettlement = {
    x: sortedYears,
    y: sortedYears.map((y) => yearlySum[y]),
    peakYear,
    peakAmount,
  };

  // 2. Top 10 Airports by Total Settlement Amount
  const airportSettlements: Record<string, { total: number; claims: number }> = {};
  filteredRecords.forEach((r) => {
    const code = String(r.Airport_Code || "").trim();
    if (code && code !== "Unknown") {
      if (!airportSettlements[code]) {
        airportSettlements[code] = { total: 0, claims: 0 };
      }
      airportSettlements[code].claims += 1;
      const amt = typeof r.Close_Amount === "number" ? r.Close_Amount : parseFloat(r.Close_Amount || "0");
      if (!isNaN(amt) && amt > 0) {
        airportSettlements[code].total += amt;
      }
    }
  });

  const sortedAirportSettlements = Object.entries(airportSettlements)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);

  const topAirportsReversed = [...sortedAirportSettlements].reverse();

  const topAirportsSettlement = {
    y: topAirportsReversed.map(([code]) => code),
    x: topAirportsReversed.map(([, data]) => data.total),
    claims: topAirportsReversed.map(([, data]) => data.claims),
  };

  // 3. Average Settlement by Claim Type
  const claimTypeStats: Record<string, { sum: number; count: number }> = {};
  filteredRecords.forEach((r) => {
    const type = String(r.Claim_Type || "Other").trim();
    if (type && type !== "Unknown") {
      if (!claimTypeStats[type]) claimTypeStats[type] = { sum: 0, count: 0 };
      claimTypeStats[type].count += 1;
      const amt = typeof r.Close_Amount === "number" ? r.Close_Amount : parseFloat(r.Close_Amount || "0");
      if (!isNaN(amt) && amt > 0) {
        claimTypeStats[type].sum += amt;
      }
    }
  });

  const sortedClaimTypeStats = Object.entries(claimTypeStats)
    .map(([type, d]) => ({
      type,
      avg: d.count > 0 ? d.sum / d.count : 0,
    }))
    .sort((a, b) => b.avg - a.avg);

  const avgSettlementByClaimType = {
    x: sortedClaimTypeStats.map((d) => d.type),
    y: sortedClaimTypeStats.map((d) => parseFloat(d.avg.toFixed(2))),
  };

  // 4. Settlement Distribution Histogram & Boxplot
  const settlementHistogram = {
    x: nonZeroSettlements.length > 0 ? nonZeroSettlements : [0],
  };

  const boxplotData = {
    y: nonZeroSettlements.length > 0 ? nonZeroSettlements : [0],
    median: medianSettlement,
    q1,
    q3,
  };

  // 6. Category vs Settlement Bubble Chart
  const categoryStats: Record<string, { claims: number; total: number }> = {};
  filteredRecords.forEach((r) => {
    const cat = String(r.Item_Category || "Other").trim();
    if (cat && cat !== "Unknown") {
      if (!categoryStats[cat]) categoryStats[cat] = { claims: 0, total: 0 };
      categoryStats[cat].claims += 1;
      const amt = typeof r.Close_Amount === "number" ? r.Close_Amount : parseFloat(r.Close_Amount || "0");
      if (!isNaN(amt) && amt > 0) {
        categoryStats[cat].total += amt;
      }
    }
  });

  const categoryBubbleData = Object.entries(categoryStats)
    .map(([category, d]) => ({
      category,
      claims: d.claims,
      avgSettlement: d.claims > 0 ? parseFloat((d.total / d.claims).toFixed(2)) : 0,
      totalSettlement: d.total,
    }))
    .sort((a, b) => b.totalSettlement - a.totalSettlement)
    .slice(0, 20);

  const chartSeries: FinancialChartSeries = {
    yearlySettlement,
    topAirportsSettlement,
    avgSettlementByClaimType,
    settlementHistogram,
    boxplotData,
    categoryBubbleData,
  };

  // Financial Intelligence Findings
  const insights: ResearchInsight[] = [];

  if (totalClaims > 0) {
    if (totalSettlement > 0) {
      insights.push({
        id: "INS-FIN-01",
        category: "Aggregate Financial Disbursal",
        title: "Cumulative Payout Expenditure",
        summary: `Historical TSA claims generated $${totalSettlement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in total settlement payouts across the active filter selection.`,
        severity: "high",
        metric: `$${(totalSettlement / 1e6).toFixed(2)}M Disbursed`,
      });
    }

    if (maxAmount > 0) {
      insights.push({
        id: "INS-FIN-02",
        category: "Extreme Financial Outlier",
        title: `Single Highest Payout Recorded at ${maxAirport}`,
        summary: `The single largest recorded settlement payout reached $${maxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} at airport ${maxAirport} (${maxYear}).`,
        severity: "warning",
        metric: `$${maxAmount.toLocaleString()}`,
      });
    }

    if (sortedClaimTypeStats.length > 0) {
      const topType = sortedClaimTypeStats[0];
      insights.push({
        id: "INS-FIN-03",
        category: "Highest Impact Claim Class",
        title: `Costliest Claim Class: ${topType.type}`,
        summary: `'${topType.type}' represents the highest average claim resolution payout at $${topType.avg.toFixed(2)} per case.`,
        severity: "medium",
        metric: `$${topType.avg.toFixed(2)} Avg`,
      });
    }

    insights.push({
      id: "INS-FIN-04",
      category: "Statistical Distribution Metric",
      title: "Median vs Average Payout Divergence",
      summary: `The median claim settlement ($${medianSettlement.toFixed(2)}) is lower than the mean ($${avgSettlement.toFixed(2)}), reflecting a right-skewed distribution driven by high-value outliers.`,
      severity: "info",
      metric: `Median: $${medianSettlement.toFixed(2)}`,
    });
  }

  return {
    kpis,
    chartSeries,
    insights,
  };
}
