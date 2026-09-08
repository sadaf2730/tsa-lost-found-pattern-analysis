import { FilterState, TSAClaim } from "./types";

export const INITIAL_FILTER_STATE: FilterState = {
  year: "All",
  state: "All",
  airport: "All",
  claimType: "All",
  itemCategory: "All",
  month: "All",
};

export function getActiveFilterCount(filters: FilterState): number {
  return Object.values(filters).filter((val) => val !== "All" && val !== "").length;
}

export function isFilterActive(filters: FilterState): boolean {
  return getActiveFilterCount(filters) > 0;
}

export function filterClaims(claims: TSAClaim[], filters: FilterState): TSAClaim[] {
  return claims.filter((claim) => {
    if (filters.year !== "All" && String(claim.Year || "").replace(".0", "") !== filters.year) {
      return false;
    }
    if (filters.state !== "All" && String(claim.State || "").trim() !== filters.state) {
      return false;
    }
    if (filters.airport !== "All" && String(claim.Airport_Code || "").trim() !== filters.airport) {
      return false;
    }
    if (filters.claimType !== "All" && String(claim.Claim_Type || "").trim() !== filters.claimType) {
      return false;
    }
    if (filters.itemCategory !== "All" && String(claim.Item_Category || "").trim() !== filters.itemCategory) {
      return false;
    }
    if (filters.month !== "All" && String(claim.Month || "").trim() !== filters.month) {
      return false;
    }
    return true;
  });
}
