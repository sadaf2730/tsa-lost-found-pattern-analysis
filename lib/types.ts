export interface TSAClaim {
  Claim_Number?: string;
  Date_Received?: string;
  Incident_Date?: string;
  Airport_Code?: string;
  Airport_Name?: string;
  Claim_Type?: string;
  Claim_Site?: string;
  Item_Category?: string;
  Close_Amount?: number | string;
  Disposition?: string;
  StateName?: string;
  State?: string;
  County?: string;
  City?: string;
  Month?: string;
  Year?: string | number;
  [key: string]: unknown;
}

export interface AnalyticalRecord {
  Year: string;
  Month: string;
  State: string;
  City?: string;
  Airport_Code: string;
  Airport_Name: string;
  Claim_Type: string;
  Claim_Site?: string;
  Item_Category: string;
  Close_Amount: number;
  Disposition: string;
}

export interface AirportCoord {
  lat: number;
  lon: number;
  name: string;
  state: string;
}

export type AirportCoordsMap = Record<string, AirportCoord>;

export interface FilterState {
  year: string;
  state: string;
  airport: string;
  claimType: string;
  itemCategory: string;
  month: string;
}

export interface FilterOptions {
  years: string[];
  states: string[];
  airports: string[];
  claim_types: string[];
  item_categories: string[];
  months: string[];
  state_airport_map: Record<string, string[]>;
}

export interface OverviewStats {
  total_records: number;
  total_columns: number;
  airports_covered: number;
  states_covered: number;
  year_range: string;
  columns: string[];
}

export interface ResearchInsight {
  id: string;
  category: string;
  title: string;
  summary: string;
  severity: "high" | "medium" | "info" | "warning";
  metric: string;
}

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
}

export interface ExecutiveKpiData {
  totalClaims: number;
  totalSettlement: number;
  avgSettlement: number;
  airportsCovered: number;
}

export interface ChartDataSeries {
  monthlyTrend: {
    x: string[];
    y: number[];
  };
  topAirports: {
    y: string[];
    x: number[];
    amounts: number[];
  };
  claimTypeDistribution: {
    labels: string[];
    values: number[];
  };
  dispositionAnalysis: {
    x: string[];
    y: number[];
  };
  yearlyTrend: {
    x: string[];
    y: number[];
    peakYear: string;
    peakCount: number;
    troughYear: string;
    troughCount: number;
  };
}

export interface OperationalKpiData {
  primarySite: string;
  primarySitePct: number;
  highestRiskCategory: string;
  peakMonth: string;
  denialRate: number;
}

export interface StateSnapshotData {
  state: string;
  totalClaims: number;
  totalSettlement: number;
  topAirport: string;
  topCategory: string;
  peakMonth: string;
}

export interface AirportRiskData {
  code: string;
  name: string;
  state: string;
  claims: number;
  settlement: number;
  avgSettlement: number;
  denialRate: number;
  riskScore: number;
  lat: number;
  lon: number;
}

export interface OperationalChartSeries {
  airportMap: AirportRiskData[];
  stateRankings: {
    y: string[];
    x: number[];
    amounts: number[];
  };
  cityRankings: {
    y: string[];
    x: number[];
  };
  claimSiteDistribution: {
    labels: string[];
    values: number[];
  };
  itemCategoryDistribution: {
    y: string[];
    x: number[];
    percentages: number[];
  };
  operationalHeatmap: {
    years: string[];
    months: string[];
    z: number[][];
  };
  geographicRiskMatrix: AirportRiskData[];
}

export interface FinancialKpiData {
  totalSettlement: number;
  avgSettlement: number;
  maxPayout: {
    amount: number;
    airport: string;
    year: string;
  };
  medianSettlement: number;
}

export interface FinancialChartSeries {
  yearlySettlement: {
    x: string[];
    y: number[];
    peakYear: string;
    peakAmount: number;
  };
  topAirportsSettlement: {
    y: string[];
    x: number[];
    claims: number[];
  };
  avgSettlementByClaimType: {
    x: string[];
    y: number[];
  };
  settlementHistogram: {
    x: number[];
  };
  boxplotData: {
    y: number[];
    median: number;
    q1: number;
    q3: number;
  };
  categoryBubbleData: Array<{
    category: string;
    claims: number;
    avgSettlement: number;
    totalSettlement: number;
  }>;
}
