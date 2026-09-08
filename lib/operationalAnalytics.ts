import {
  AnalyticalRecord,
  AirportCoordsMap,
  FilterState,
  OperationalKpiData,
  StateSnapshotData,
  AirportRiskData,
  OperationalChartSeries,
  ResearchInsight,
} from "./types";
import { formatTopNDonutData } from "./executiveAnalytics";

let cachedAirportCoords: AirportCoordsMap | null = null;

const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Loads airport latitude and longitude coordinates lookup map.
 */
export async function loadAirportCoordinates(): Promise<AirportCoordsMap> {
  if (cachedAirportCoords) return cachedAirportCoords;
  const res = await fetch("/data/airport_coordinates.json");
  if (!res.ok) {
    throw new Error(`Failed to load airport coordinates: ${res.statusText}`);
  }
  const coords: AirportCoordsMap = await res.json();
  cachedAirportCoords = coords;
  return coords;
}

/**
 * Computes Dynamic 0-100 Operational Risk Score for an airport.
 * Formula: Weighted normalized sum of Claim Volume (40%), Avg Settlement (40%), and Denial Rate (20%).
 */
export function computeOperationalRiskScore(
  claims: number,
  avgSettlement: number,
  denialRate: number,
  maxClaims: number,
  maxAvgSettlement: number
): number {
  if (claims === 0) return 0;
  const normClaims = maxClaims > 0 ? claims / maxClaims : 0;
  const normAvgSettlement = maxAvgSettlement > 0 ? Math.min(1.0, avgSettlement / maxAvgSettlement) : 0;
  const normDenial = Math.min(1.0, Math.max(0, denialRate / 100));

  const score = (0.4 * normClaims + 0.4 * normAvgSettlement + 0.2 * normDenial) * 100;
  return parseFloat(score.toFixed(1));
}

/**
 * Computes dynamic State Snapshot telemetry for Enhancement 1.
 */
export function computeStateSnapshot(
  filteredRecords: AnalyticalRecord[],
  selectedState: string
): StateSnapshotData | null {
  if (!selectedState || selectedState === "All") return null;

  const stateRecords = filteredRecords.filter(
    (r) => String(r.State || "").trim() === selectedState
  );

  if (stateRecords.length === 0) return null;

  let totalSettlement = 0;
  const aptCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  const monthCounts: Record<string, number> = {};

  stateRecords.forEach((r) => {
    const amt = typeof r.Close_Amount === "number" ? r.Close_Amount : parseFloat(r.Close_Amount || "0");
    if (!isNaN(amt) && amt > 0) totalSettlement += amt;

    const apt = String(r.Airport_Code || "").trim();
    if (apt && apt !== "Unknown") aptCounts[apt] = (aptCounts[apt] || 0) + 1;

    const cat = String(r.Item_Category || "").trim();
    if (cat && cat !== "Unknown") catCounts[cat] = (catCounts[cat] || 0) + 1;

    const m = String(r.Month || "").trim();
    if (m && m !== "Unknown") monthCounts[m] = (monthCounts[m] || 0) + 1;
  });

  const topApt = Object.entries(aptCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
  const peakMonth = Object.entries(monthCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  return {
    state: selectedState,
    totalClaims: stateRecords.length,
    totalSettlement,
    topAirport: topApt,
    topCategory: topCat,
    peakMonth,
  };
}

/**
 * Computes complete Operational & Geographic Intelligence telemetry from filtered records.
 */
export function computeOperationalAnalytics(
  filteredRecords: AnalyticalRecord[],
  airportCoords: AirportCoordsMap,
  filters: FilterState
) {
  const totalClaims = filteredRecords.length;

  // 1. KPI Calculations
  const siteCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};
  const monthCounts: Record<string, number> = {};
  let deniedCount = 0;

  filteredRecords.forEach((r) => {
    const site = String(r.Claim_Site || "Checked Baggage").trim();
    if (site && site !== "Unknown") siteCounts[site] = (siteCounts[site] || 0) + 1;

    const cat = String(r.Item_Category || "Electronics").trim();
    if (cat && cat !== "Unknown") catCounts[cat] = (catCounts[cat] || 0) + 1;

    const m = String(r.Month || "").trim();
    if (m && m !== "Unknown") monthCounts[m] = (monthCounts[m] || 0) + 1;

    const disp = String(r.Disposition || "").toLowerCase();
    if (disp.includes("deny") || disp.includes("denied")) {
      deniedCount += 1;
    }
  });

  const sortedSites = Object.entries(siteCounts).sort((a, b) => b[1] - a[1]);
  const primarySite = sortedSites[0]?.[0] || "Checked Baggage";
  const primarySiteCount = sortedSites[0]?.[1] || 0;
  const primarySitePct = totalClaims > 0 ? parseFloat(((primarySiteCount / totalClaims) * 100).toFixed(1)) : 0;

  const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
  const highestRiskCategory = sortedCats[0]?.[0] || "Electronics";

  const sortedMonths = Object.entries(monthCounts).sort((a, b) => b[1] - a[1]);
  const peakMonth = sortedMonths[0]?.[0] || "August";

  const denialRate = totalClaims > 0 ? parseFloat(((deniedCount / totalClaims) * 100).toFixed(1)) : 0;

  const kpis: OperationalKpiData = {
    primarySite,
    primarySitePct,
    highestRiskCategory,
    peakMonth,
    denialRate,
  };

  // 2. Airport Aggregations & Operational Risk Scoring
  const airportMapDataRaw: Record<
    string,
    { claims: number; settlement: number; denied: number; name: string; state: string }
  > = {};

  filteredRecords.forEach((r) => {
    const code = String(r.Airport_Code || "").trim();
    if (code && code !== "Unknown") {
      if (!airportMapDataRaw[code]) {
        airportMapDataRaw[code] = {
          claims: 0,
          settlement: 0,
          denied: 0,
          name: String(r.Airport_Name || code),
          state: String(r.State || "US"),
        };
      }
      airportMapDataRaw[code].claims += 1;
      const amt = typeof r.Close_Amount === "number" ? r.Close_Amount : parseFloat(r.Close_Amount || "0");
      if (!isNaN(amt) && amt > 0) airportMapDataRaw[code].settlement += amt;

      const disp = String(r.Disposition || "").toLowerCase();
      if (disp.includes("deny") || disp.includes("denied")) {
        airportMapDataRaw[code].denied += 1;
      }
    }
  });

  // Calculate max metrics for 0-100 score normalization
  let maxClaims = 0;
  let maxAvgSettlement = 0;

  Object.values(airportMapDataRaw).forEach((apt) => {
    if (apt.claims > maxClaims) maxClaims = apt.claims;
    const avg = apt.claims > 0 ? apt.settlement / apt.claims : 0;
    if (avg > maxAvgSettlement) maxAvgSettlement = avg;
  });

  // Cap max Avg Settlement reference at $500 for robust scaling
  const maxAvgRef = Math.min(500, maxAvgSettlement > 0 ? maxAvgSettlement : 250);

  const airportRiskList: AirportRiskData[] = Object.entries(airportMapDataRaw).map(([code, apt]) => {
    const avgSettlement = apt.claims > 0 ? apt.settlement / apt.claims : 0;
    const aptDenialRate = apt.claims > 0 ? (apt.denied / apt.claims) * 100 : 0;
    const riskScore = computeOperationalRiskScore(
      apt.claims,
      avgSettlement,
      aptDenialRate,
      maxClaims,
      maxAvgRef
    );

    const coord = airportCoords[code] || { lat: 39.8283, lon: -98.5795, name: apt.name, state: apt.state };

    return {
      code,
      name: coord.name || apt.name,
      state: coord.state || apt.state,
      claims: apt.claims,
      settlement: apt.settlement,
      avgSettlement,
      denialRate: aptDenialRate,
      riskScore,
      lat: coord.lat,
      lon: coord.lon,
    };
  });

  // 3. State Rankings (Top 10)
  const stateCounts: Record<string, { count: number; settlement: number }> = {};
  filteredRecords.forEach((r) => {
    const st = String(r.State || "").trim();
    if (st && st !== "Unknown") {
      if (!stateCounts[st]) stateCounts[st] = { count: 0, settlement: 0 };
      stateCounts[st].count += 1;
      const amt = typeof r.Close_Amount === "number" ? r.Close_Amount : parseFloat(r.Close_Amount || "0");
      if (!isNaN(amt) && amt > 0) stateCounts[st].settlement += amt;
    }
  });

  const sortedStates = Object.entries(stateCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10);

  const topStatesReversed = [...sortedStates].reverse();

  const stateRankings = {
    y: topStatesReversed.map(([st]) => st),
    x: topStatesReversed.map(([, d]) => d.count),
    amounts: topStatesReversed.map(([, d]) => d.settlement),
  };

  // 4. City Rankings (Top 10)
  const cityCounts: Record<string, number> = {};
  filteredRecords.forEach((r) => {
    const city = String(r.City || "").trim();
    if (city && city !== "Unknown") {
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    }
  });

  const sortedCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topCitiesReversed = [...sortedCities].reverse();

  const cityRankings = {
    y: topCitiesReversed.map(([c]) => c),
    x: topCitiesReversed.map(([, cnt]) => cnt),
  };

  // 5. Claim Site Distribution (Top 3 + "Other")
  const rawSiteLabels = sortedSites.map(([site]) => site);
  const rawSiteValues = sortedSites.map(([, count]) => count);

  const claimSiteDistribution = formatTopNDonutData(rawSiteLabels, rawSiteValues, 3);

  // 6. Item Category Distribution (Top 10)
  const top10Cats = sortedCats.slice(0, 10);
  const top10CatsReversed = [...top10Cats].reverse();

  const itemCategoryDistribution = {
    y: top10CatsReversed.map(([cat]) => cat),
    x: top10CatsReversed.map(([, cnt]) => cnt),
    percentages: top10CatsReversed.map(([, cnt]) =>
      totalClaims > 0 ? parseFloat(((cnt / totalClaims) * 100).toFixed(1)) : 0
    ),
  };

  // 7. Monthly Operational Heatmap Matrix (Years x Months)
  const yearsSet = new Set<string>();
  filteredRecords.forEach((r) => {
    const y = String(r.Year || "").replace(".0", "").trim();
    if (y && /^\d{4}$/.test(y)) yearsSet.add(y);
  });

  const sortedYears = Array.from(yearsSet).sort((a, b) => parseInt(a) - parseInt(b));

  const heatmapMatrix: Record<string, Record<string, number>> = {};
  sortedYears.forEach((y) => {
    heatmapMatrix[y] = {};
    MONTH_ORDER.forEach((m) => (heatmapMatrix[y][m] = 0));
  });

  filteredRecords.forEach((r) => {
    const y = String(r.Year || "").replace(".0", "").trim();
    const m = String(r.Month || "").trim();
    if (heatmapMatrix[y] && heatmapMatrix[y][m] !== undefined) {
      heatmapMatrix[y][m] += 1;
    }
  });

  const zMatrix = sortedYears.map((y) => MONTH_ORDER.map((m) => heatmapMatrix[y][m]));

  const operationalHeatmap = {
    years: sortedYears,
    months: MONTH_ORDER,
    z: zMatrix,
  };

  // 8. Geographic Risk Matrix
  const geographicRiskMatrix = [...airportRiskList]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 50);

  const chartSeries: OperationalChartSeries = {
    airportMap: airportRiskList,
    stateRankings,
    cityRankings,
    claimSiteDistribution,
    itemCategoryDistribution,
    operationalHeatmap,
    geographicRiskMatrix,
  };

  // Dynamic Geographic Research Insights
  const insights: ResearchInsight[] = [];

  if (totalClaims > 0) {
    if (airportRiskList.length > 0) {
      const topRiskApt = [...airportRiskList].sort((a, b) => b.riskScore - a.riskScore)[0];
      insights.push({
        id: "INS-GEO-01",
        category: "Operational Risk Score Engine",
        title: `Highest Risk Operational Hub: ${topRiskApt.code}`,
        summary: `Airport ${topRiskApt.code} (${topRiskApt.name}) scored an Operational Risk Score of ${topRiskApt.riskScore}/100 based on ${topRiskApt.claims.toLocaleString()} claims, $${topRiskApt.avgSettlement.toFixed(2)} avg settlement, and ${topRiskApt.denialRate.toFixed(1)}% denial rate.`,
        severity: "high",
        metric: `Risk Score: ${topRiskApt.riskScore}/100`,
      });
    }

    if (sortedStates.length > 0) {
      const [topSt, data] = sortedStates[0];
      insights.push({
        id: "INS-GEO-02",
        category: "Geographic Density",
        title: `Primary Geographic Claim Concentration: ${topSt}`,
        summary: `State '${topSt}' recorded the highest incident volume with ${data.count.toLocaleString()} filings (${((data.count / totalClaims) * 100).toFixed(1)}% of selection) totaling $${data.settlement.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
        severity: "warning",
        metric: `${data.count.toLocaleString()} Claims`,
      });
    }

    insights.push({
      id: "INS-GEO-03",
      category: "Vulnerability Site Telemetry",
      title: `Dominant Claim Site: ${primarySite}`,
      summary: `'${primarySite}' accounts for ${primarySiteCount.toLocaleString()} incidents (${primarySitePct}% of all property loss filings), making checkpoint/baggage screening procedures critical.`,
      severity: "medium",
      metric: `${primarySitePct}% Share`,
    });

    insights.push({
      id: "INS-GEO-04",
      category: "Item Vulnerability Pattern",
      title: `Most Vulnerable Category: ${highestRiskCategory}`,
      summary: `'${highestRiskCategory}' remains the most frequently reported lost or damaged property item across all commercial airports in the filtered subset.`,
      severity: "info",
      metric: highestRiskCategory,
    });
  }

  const stateSnapshot = computeStateSnapshot(filteredRecords, filters.state);

  return {
    kpis,
    chartSeries,
    insights,
    stateSnapshot,
  };
}
