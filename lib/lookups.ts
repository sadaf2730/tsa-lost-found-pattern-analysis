import rawAirportCoords from "@/public/data/airport_coordinates.json";

/**
 * Complete US States and Territories Mapping
 */
export const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
  AS: "American Samoa",
  GU: "Guam",
  MP: "Northern Mariana Islands",
  CQ: "Northern Mariana Islands",
  PR: "Puerto Rico",
  VI: "U.S. Virgin Islands",
};

// Explicit canonical overrides for common hub airports
const CANONICAL_AIRPORT_OVERRIDES: Record<string, string> = {
  LAX: "Los Angeles International Airport",
  JFK: "John F. Kennedy International Airport",
  ORD: "Chicago O'Hare International Airport",
  ATL: "Hartsfield–Jackson Atlanta International Airport",
  SFO: "San Francisco International Airport",
  SEA: "Seattle-Tacoma International Airport",
  BOS: "Boston Logan International Airport",
  MIA: "Miami International Airport",
  DFW: "Dallas/Fort Worth International Airport",
  EWR: "Newark Liberty International Airport",
  DEN: "Denver International Airport",
  PHX: "Phoenix Sky Harbor International Airport",
  CLT: "Charlotte Douglas International Airport",
  LAS: "Harry Reid International Airport",
  MCO: "Orlando International Airport",
  MSP: "Minneapolis–Saint Paul International Airport",
  DTW: "Detroit Metropolitan Wayne County Airport",
  PHL: "Philadelphia International Airport",
  LGA: "LaGuardia Airport",
  BWI: "Baltimore/Washington International Thurgood Marshall Airport",
  SAN: "San Diego International Airport",
  TPA: "Tampa International Airport",
  PDX: "Portland International Airport",
  SLC: "Salt Lake City International Airport",
  IAD: "Washington Dulles International Airport",
  DCA: "Ronald Reagan Washington National Airport",
};

interface RawAirportData {
  [code: string]: {
    lat: number;
    lon: number;
    name: string;
    state: string;
  };
}

const airportCoords = rawAirportCoords as RawAirportData;

/**
 * Returns the full state name for a given 2-letter state/territory code.
 * Falls back to the original code if not found or already formatted.
 */
export function getStateFullName(code: string | undefined | null): string {
  if (!code || code === "All" || code === "Unknown") return code || "";
  const trimmed = code.trim();
  const upper = trimmed.toUpperCase();
  return STATE_NAMES[upper] || trimmed;
}

/**
 * Returns the full airport name for a given 3-letter IATA airport code.
 * Falls back to the original code if not found or unknown.
 */
export function getAirportFullName(code: string | undefined | null): string {
  if (!code || code === "All" || code === "Unknown" || code === "-") return code || "";
  const trimmed = code.trim();
  const upper = trimmed.toUpperCase();

  if (CANONICAL_AIRPORT_OVERRIDES[upper]) {
    return CANONICAL_AIRPORT_OVERRIDES[upper];
  }

  const record = airportCoords[upper];
  if (record && record.name) {
    let name = record.name.trim();
    if (name.endsWith("International")) {
      name += " Airport";
    }
    return name;
  }

  return trimmed;
}

/**
 * Formats any state abbreviations found in text to full state names.
 * E.g., "(FL)" -> "(Florida)", "State 'FL'" -> "State 'Florida'"
 */
export function formatStateReferences(text: string): string {
  if (!text) return text;
  return text.replace(/\b([A-Z]{2})\b/g, (match) => {
    return STATE_NAMES[match] || match;
  });
}
