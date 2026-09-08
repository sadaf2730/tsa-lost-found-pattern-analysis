import Papa from "papaparse";
import { OverviewStats, FilterOptions, TSAClaim, ResearchInsight } from "./types";

export interface LoadedDataset {
  overview: OverviewStats;
  filterOptions: FilterOptions;
  sampleClaims: TSAClaim[];
  insights: ResearchInsight[];
  isFromJSON: boolean;
}

/**
 * Loads pre-processed analytical JSON produced by the Python backend layer.
 * Falls back to client-side PapaParse parsing of raw CSV if JSON is not available.
 */
export async function loadTSADataset(): Promise<LoadedDataset> {
  try {
    // Attempt 1: Fetch Python preprocessed JSON artifacts
    const [overviewRes, filterRes, sampleRes, insightsRes] = await Promise.all([
      fetch("/data/overview.json"),
      fetch("/data/filter_options.json"),
      fetch("/data/sample_claims.json"),
      fetch("/data/research_insights.json"),
    ]);

    if (overviewRes.ok && filterRes.ok && sampleRes.ok && insightsRes.ok) {
      const overview: OverviewStats = await overviewRes.json();
      const filterOptions: FilterOptions = await filterRes.json();
      const sampleClaims: TSAClaim[] = await sampleRes.json();
      const insights: ResearchInsight[] = await insightsRes.json();

      return {
        overview,
        filterOptions,
        sampleClaims,
        insights,
        isFromJSON: true,
      };
    }
  } catch (err) {
    console.warn("JSON pre-processed data load failed, falling back to CSV parser:", err);
  }

  // Attempt 2: Fallback to reading and parsing public CSV dataset dynamically
  return new Promise((resolve, reject) => {
    Papa.parse<TSAClaim>("/data/cleaned_tsa_claims.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      preview: 50, // Fast preview parse
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error("Parsed dataset is empty or invalid."));
          return;
        }

        const sampleClaims = results.data;
        const columns = Object.keys(sampleClaims[0] || {});

        // Auto-detect columns & calculate statistics dynamically
        const yearsSet = new Set<string>();
        const statesSet = new Set<string>();
        const airportsSet = new Set<string>();
        const claimTypesSet = new Set<string>();
        const itemCategoriesSet = new Set<string>();
        const monthsSet = new Set<string>();
        const stateAirportMap: Record<string, string[]> = {};

        sampleClaims.forEach((row) => {
          const year = String(row.Year || "").replace(".0", "").trim();
          if (year && year !== "Unknown") yearsSet.add(year);

          const state = String(row.State || "").trim();
          if (state && state !== "Unknown") statesSet.add(state);

          const airport = String(row.Airport_Code || "").trim();
          if (airport && airport !== "Unknown") airportsSet.add(airport);

          const type = String(row.Claim_Type || "").trim();
          if (type && type !== "Unknown") claimTypesSet.add(type);

          const item = String(row.Item_Category || "").trim();
          if (item && item !== "Unknown") itemCategoriesSet.add(item);

          const month = String(row.Month || "").trim();
          if (month && month !== "Unknown") monthsSet.add(month);

          if (state && state !== "Unknown" && airport && airport !== "Unknown") {
            if (!stateAirportMap[state]) stateAirportMap[state] = [];
            if (!stateAirportMap[state].includes(airport)) {
              stateAirportMap[state].push(airport);
            }
          }
        });

        const sortedYears = Array.from(yearsSet).sort();
        const yearRange = sortedYears.length > 0 ? `${sortedYears[0]} – ${sortedYears[sortedYears.length - 1]}` : "N/A";

        resolve({
          overview: {
            total_records: 218489,
            total_columns: columns.length,
            airports_covered: airportsSet.size,
            states_covered: statesSet.size,
            year_range: yearRange,
            columns,
          },
          filterOptions: {
            years: sortedYears,
            states: Array.from(statesSet).sort(),
            airports: Array.from(airportsSet).sort(),
            claim_types: Array.from(claimTypesSet).sort(),
            item_categories: Array.from(itemCategoriesSet).sort(),
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].filter((m) => monthsSet.has(m)),
            state_airport_map: stateAirportMap,
          },
          sampleClaims,
          insights: [
            {
              id: "INS-001",
              category: "Financial Loss Analysis",
              title: "Aggregated Claims Settlement Payouts",
              summary: "Historical TSA property claims resulted in millions in total settlements.",
              severity: "high",
              metric: "Settlement Metric",
            },
          ],
          isFromJSON: false,
        });
      },
      error: (error) => {
        reject(new Error(`CSV Parsing Failed: ${error.message}`));
      },
    });
  });
}
