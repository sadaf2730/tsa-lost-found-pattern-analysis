import pandas as pd
import numpy as np
from process_data import load_and_clean_data

MONTH_ORDER = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

# Comprehensive U.S. Airport Geolocation Database (Lat, Lon, Name, State)
# Covers major and regional commercial hubs across all U.S. states and territories
US_AIRPORT_COORDINATES = {
    "ATL": {"lat": 33.6407, "lon": -84.4277, "name": "Hartsfield-Jackson Atlanta International", "state": "GA"},
    "LAX": {"lat": 33.9416, "lon": -118.4085, "name": "Los Angeles International", "state": "CA"},
    "ORD": {"lat": 41.9742, "lon": -87.9073, "name": "Chicago O'Hare International", "state": "IL"},
    "DFW": {"lat": 32.8998, "lon": -97.0403, "name": "Dallas/Fort Worth International", "state": "TX"},
    "DEN": {"lat": 39.8561, "lon": -104.6737, "name": "Denver International", "state": "CO"},
    "JFK": {"lat": 40.6413, "lon": -73.7781, "name": "John F. Kennedy International", "state": "NY"},
    "SFO": {"lat": 37.6213, "lon": -122.3790, "name": "San Francisco International", "state": "CA"},
    "SEA": {"lat": 47.4502, "lon": -122.3088, "name": "Seattle-Tacoma International", "state": "WA"},
    "LAS": {"lat": 36.0840, "lon": -115.1537, "name": "Harry Reid International", "state": "NV"},
    "MCO": {"lat": 28.4312, "lon": -81.3081, "name": "Orlando International", "state": "FL"},
    "EWR": {"lat": 40.6895, "lon": -74.1745, "name": "Newark Liberty International", "state": "NJ"},
    "CLT": {"lat": 35.2140, "lon": -80.9431, "name": "Charlotte Douglas International", "state": "NC"},
    "PHX": {"lat": 33.4352, "lon": -112.0101, "name": "Phoenix Sky Harbor International", "state": "AZ"},
    "IAH": {"lat": 29.9902, "lon": -95.3368, "name": "George Bush Intercontinental", "state": "TX"},
    "MIA": {"lat": 25.7959, "lon": -80.2870, "name": "Miami International", "state": "FL"},
    "BOS": {"lat": 42.3656, "lon": -71.0096, "name": "Boston Logan International", "state": "MA"},
    "MSP": {"lat": 44.8848, "lon": -93.2223, "name": "Minneapolis-Saint Paul International", "state": "MN"},
    "FLL": {"lat": 26.0742, "lon": -80.1506, "name": "Fort Lauderdale-Hollywood International", "state": "FL"},
    "DTW": {"lat": 42.2162, "lon": -83.3554, "name": "Detroit Metropolitan Wayne County", "state": "MI"},
    "PHL": {"lat": 39.8744, "lon": -75.2424, "name": "Philadelphia International", "state": "PA"},
    "LGA": {"lat": 40.7769, "lon": -73.8740, "name": "LaGuardia Airport", "state": "NY"},
    "BWI": {"lat": 39.1774, "lon": -76.6684, "name": "Baltimore/Washington International", "state": "MD"},
    "SLC": {"lat": 40.7899, "lon": -111.9791, "name": "Salt Lake City International", "state": "UT"},
    "SAN": {"lat": 32.7338, "lon": -117.1933, "name": "San Diego International", "state": "CA"},
    "IAD": {"lat": 38.9531, "lon": -77.4565, "name": "Washington Dulles International", "state": "VA"},
    "DCA": {"lat": 38.8512, "lon": -77.0402, "name": "Ronald Reagan Washington National", "state": "VA"},
    "MDW": {"lat": 41.7868, "lon": -87.7522, "name": "Chicago Midway International", "state": "IL"},
    "TPA": {"lat": 27.9775, "lon": -82.5332, "name": "Tampa International", "state": "FL"},
    "PDX": {"lat": 45.5898, "lon": -122.5951, "name": "Portland International", "state": "OR"},
    "HNL": {"lat": 21.3187, "lon": -157.9225, "name": "Daniel K. Inouye International", "state": "HI"},
    "STL": {"lat": 38.7499, "lon": -90.3601, "name": "St. Louis Lambert International", "state": "MO"},
    "BNA": {"lat": 36.1263, "lon": -86.6774, "name": "Nashville International", "state": "TN"},
    "AUS": {"lat": 30.1975, "lon": -97.6664, "name": "Austin-Bergstrom International", "state": "TX"},
    "SMF": {"lat": 38.6954, "lon": -121.5908, "name": "Sacramento International", "state": "CA"},
    "SJC": {"lat": 37.3639, "lon": -121.9289, "name": "Norman Y. Mineta San Jose International", "state": "CA"},
    "SNA": {"lat": 33.6757, "lon": -117.8674, "name": "John Wayne Airport", "state": "CA"},
    "OAK": {"lat": 37.7213, "lon": -122.2207, "name": "Oakland International", "state": "CA"},
    "RSW": {"lat": 26.5362, "lon": -81.7552, "name": "Southwest Florida International", "state": "FL"},
    "IND": {"lat": 39.7173, "lon": -86.2944, "name": "Indianapolis International", "state": "IN"},
    "PIT": {"lat": 40.4915, "lon": -80.2329, "name": "Pittsburgh International", "state": "PA"},
    "CVG": {"lat": 39.0461, "lon": -84.6621, "name": "Cincinnati/Northern Kentucky International", "state": "KY"},
    "CLE": {"lat": 41.4107, "lon": -81.8494, "name": "Cleveland-Hopkins International", "state": "OH"},
    "CMH": {"lat": 39.9980, "lon": -82.8919, "name": "John Glenn Columbus International", "state": "OH"},
    "SAT": {"lat": 29.5337, "lon": -98.4698, "name": "San Antonio International", "state": "TX"},
    "PBI": {"lat": 26.6832, "lon": -80.0956, "name": "Palm Beach International", "state": "FL"},
    "BDL": {"lat": 41.9389, "lon": -72.6859, "name": "Bradley International", "state": "CT"},
    "MKE": {"lat": 42.9472, "lon": -87.8966, "name": "Milwaukee Mitchell International", "state": "WI"},
    "ANC": {"lat": 61.1744, "lon": -149.9963, "name": "Ted Stevens Anchorage International", "state": "AK"},
    "SJU": {"lat": 18.4394, "lon": -66.0018, "name": "Luis Muñoz Marín International", "state": "PR"},
    "ABQ": {"lat": 35.0402, "lon": -106.6092, "name": "Albuquerque International Sunport", "state": "NM"},
    "MSY": {"lat": 29.9934, "lon": -90.2580, "name": "Louis Armstrong New Orleans International", "state": "LA"},
    "RDU": {"lat": 35.8776, "lon": -78.7875, "name": "Raleigh-Durham International", "state": "NC"},
    "MEM": {"lat": 35.0424, "lon": -89.9767, "name": "Memphis International", "state": "TN"},
    "BUF": {"lat": 42.9405, "lon": -78.7322, "name": "Buffalo Niagara International", "state": "NY"},
    "ROC": {"lat": 43.1189, "lon": -77.6724, "name": "Greater Rochester International", "state": "NY"},
    "SYR": {"lat": 43.1112, "lon": -76.1063, "name": "Syracuse Hancock International", "state": "NY"},
    "ALB": {"lat": 42.7483, "lon": -73.8017, "name": "Albany International", "state": "NY"},
    "PVD": {"lat": 41.7240, "lon": -71.4282, "name": "Rhode Island T. F. Green International", "state": "RI"},
    "PWM": {"lat": 43.6462, "lon": -70.3088, "name": "Portland International Jetport", "state": "ME"},
    "MHT": {"lat": 42.9326, "lon": -71.4357, "name": "Manchester-Boston Regional", "state": "NH"},
    "BUR": {"lat": 34.2007, "lon": -118.3590, "name": "Hollywood Burbank Airport", "state": "CA"},
    "LGB": {"lat": 33.8177, "lon": -118.1516, "name": "Long Beach Airport", "state": "CA"},
    "ONT": {"lat": 34.0560, "lon": -117.6012, "name": "Ontario International", "state": "CA"},
    "PSP": {"lat": 33.8297, "lon": -116.5067, "name": "Palm Springs International", "state": "CA"},
    "SBA": {"lat": 34.4262, "lon": -119.8404, "name": "Santa Barbara Municipal", "state": "CA"},
    "FAT": {"lat": 36.7762, "lon": -119.7181, "name": "Fresno Yosemite International", "state": "CA"},
    "BOI": {"lat": 43.5644, "lon": -116.2228, "name": "Boise Airport", "state": "ID"},
    "GEG": {"lat": 47.6199, "lon": -117.5338, "name": "Spokane International", "state": "WA"},
    "RNO": {"lat": 39.4991, "lon": -119.7681, "name": "Reno/Tahoe International", "state": "NV"},
    "COS": {"lat": 38.8058, "lon": -104.7008, "name": "Colorado Springs Airport", "state": "CO"},
    "OKC": {"lat": 35.3931, "lon": -97.6007, "name": "Will Rogers World Airport", "state": "OK"},
    "TUL": {"lat": 36.1984, "lon": -95.8881, "name": "Tulsa International", "state": "OK"},
    "LIT": {"lat": 34.7294, "lon": -92.2243, "name": "Bill and Hillary Clinton National", "state": "AR"},
    "OMA": {"lat": 41.3025, "lon": -95.8942, "name": "Eppley Airfield", "state": "NE"},
    "DSM": {"lat": 41.5340, "lon": -93.6631, "name": "Des Moines International", "state": "IA"},
    "ICT": {"lat": 37.6499, "lon": -97.4331, "name": "Wichita Dwight D. Eisenhower National", "state": "KS"},
    "MCI": {"lat": 39.2976, "lon": -94.7139, "name": "Kansas City International", "state": "MO"},
    "SAV": {"lat": 32.1276, "lon": -81.2021, "name": "Savannah/Hilton Head International", "state": "GA"},
    "CHS": {"lat": 32.8986, "lon": -80.0405, "name": "Charleston International", "state": "SC"},
    "MYR": {"lat": 33.6797, "lon": -78.9283, "name": "Myrtle Beach International", "state": "SC"},
    "JAX": {"lat": 30.4941, "lon": -81.6879, "name": "Jacksonville International", "state": "FL"},
    "SRQ": {"lat": 27.3954, "lon": -82.5544, "name": "Sarasota-Bradenton International", "state": "FL"},
    "PNS": {"lat": 30.4734, "lon": -87.1866, "name": "Pensacola International", "state": "FL"},
    "VPS": {"lat": 30.4832, "lon": -86.5254, "name": "Destin-Fort Walton Beach Airport", "state": "FL"},
    "ECP": {"lat": 30.3582, "lon": -85.7956, "name": "Northwest Florida Beaches International", "state": "FL"},
    "TLH": {"lat": 30.3965, "lon": -84.3503, "name": "Tallahassee International", "state": "FL"},
    "MOB": {"lat": 30.6914, "lon": -88.2428, "name": "Mobile Regional", "state": "AL"},
    "BHM": {"lat": 33.5629, "lon": -86.7535, "name": "Birmingham-Shuttlesworth International", "state": "AL"},
    "HSV": {"lat": 34.6404, "lon": -86.7731, "name": "Huntsville International", "state": "AL"},
    "TYS": {"lat": 35.8125, "lon": -83.9929, "name": "McGhee Tyson Airport", "state": "TN"},
    "CHA": {"lat": 35.0353, "lon": -85.2038, "name": "Chattanooga Metropolitan", "state": "TN"},
    "LEX": {"lat": 38.0364, "lon": -84.6059, "name": "Blue Grass Airport", "state": "KY"},
    "SDF": {"lat": 38.1744, "lon": -85.7360, "name": "Louisville Muhammad Ali International", "state": "KY"},
    "EVV": {"lat": 38.0370, "lon": -87.5306, "name": "Evansville Regional", "state": "IN"},
    "FWA": {"lat": 40.9785, "lon": -85.1951, "name": "Fort Wayne International", "state": "IN"},
    "GRR": {"lat": 42.8808, "lon": -85.5228, "name": "Gerald R. Ford International", "state": "MI"},
    "AZO": {"lat": 42.2349, "lon": -85.5521, "name": "Kalamazoo/Battle Creek International", "state": "MI"},
    "LAN": {"lat": 42.7787, "lon": -84.5874, "name": "Capital Region International", "state": "MI"},
    "MBS": {"lat": 43.5329, "lon": -84.0796, "name": "MBS International", "state": "MI"},
    "MQT": {"lat": 46.3536, "lon": -87.3964, "name": "Sawyer International", "state": "MI"},
    "MSN": {"lat": 43.1399, "lon": -89.3375, "name": "Dane County Regional", "state": "WI"},
    "GRB": {"lat": 44.4851, "lon": -88.1296, "name": "Green Bay Austin Straubel International", "state": "WI"},
    "ATW": {"lat": 44.2574, "lon": -88.5191, "name": "Appleton International", "state": "WI"},
    "CWA": {"lat": 44.7776, "lon": -89.6668, "name": "Central Wisconsin Airport", "state": "WI"},
    "DLH": {"lat": 46.8421, "lon": -92.1936, "name": "Duluth International", "state": "MN"},
    "RST": {"lat": 43.9083, "lon": -92.4975, "name": "Rochester International", "state": "MN"},
    "FAR": {"lat": 46.9207, "lon": -96.8158, "name": "Hector International", "state": "ND"},
    "BIS": {"lat": 46.7727, "lon": -100.7460, "name": "Bismarck Municipal", "state": "ND"},
    "FSD": {"lat": 43.5820, "lon": -96.7419, "name": "Sioux Falls Regional", "state": "SD"},
    "RAP": {"lat": 44.0453, "lon": -103.0574, "name": "Rapid City Regional", "state": "SD"},
    "BIL": {"lat": 45.8077, "lon": -108.5429, "name": "Billings Logan International", "state": "MT"},
    "BZN": {"lat": 45.7775, "lon": -111.1530, "name": "Bozeman Yellowstone International", "state": "MT"},
    "MSO": {"lat": 46.9163, "lon": -114.0906, "name": "Missoula Montana Airport", "state": "MT"},
    "FCA": {"lat": 48.3114, "lon": -114.2560, "name": "Glacier Park International", "state": "MT"},
    "HLN": {"lat": 46.6068, "lon": -111.9827, "name": "Helena Regional", "state": "MT"},
    "GTF": {"lat": 47.4820, "lon": -111.3707, "name": "Great Falls International", "state": "MT"},
    "CPR": {"lat": 42.9080, "lon": -106.4644, "name": "Casper/Natrona County International", "state": "WY"},
    "JAC": {"lat": 43.6073, "lon": -110.7377, "name": "Jackson Hole Airport", "state": "WY"},
    "CYS": {"lat": 41.1557, "lon": -104.8118, "name": "Cheyenne Regional", "state": "WY"},
    "OGG": {"lat": 20.8986, "lon": -156.4305, "name": "Kahului Airport", "state": "HI"},
    "KOA": {"lat": 19.7388, "lon": -156.0456, "name": "Ellison Onizuka Kona International", "state": "HI"},
    "LIH": {"lat": 21.9760, "lon": -159.3390, "name": "Lihue Airport", "state": "HI"},
    "ITO": {"lat": 19.7203, "lon": -155.0485, "name": "Hilo International", "state": "HI"},
    "FAI": {"lat": 64.8151, "lon": -147.8560, "name": "Fairbanks International", "state": "AK"},
    "JNU": {"lat": 58.3549, "lon": -134.5763, "name": "Juneau International", "state": "AK"},
    "KTN": {"lat": 55.3556, "lon": -131.7137, "name": "Ketchikan International", "state": "AK"},
    "STT": {"lat": 18.3373, "lon": -64.9734, "name": "Cyril E. King Airport", "state": "VI"},
    "STX": {"lat": 17.7019, "lon": -64.7986, "name": "Henry E. Rohlsen Airport", "state": "VI"},
    "PSE": {"lat": 18.0083, "lon": -66.5630, "name": "Mercedita International", "state": "PR"},
    "BQN": {"lat": 18.4949, "lon": -67.1294, "name": "Rafael Hernández International", "state": "PR"},
}

# State Centroids Fallback dictionary for any regional code not explicitly listed above
STATE_CENTROIDS = {
    "AL": {"lat": 32.806671, "lon": -86.791130}, "AK": {"lat": 61.370716, "lon": -152.404419},
    "AZ": {"lat": 33.729759, "lon": -111.431221}, "AR": {"lat": 34.969704, "lon": -92.373123},
    "CA": {"lat": 36.116203, "lon": -119.681564}, "CO": {"lat": 39.059811, "lon": -105.311104},
    "CT": {"lat": 41.597782, "lon": -72.755371}, "DE": {"lat": 39.318523, "lon": -75.507141},
    "FL": {"lat": 27.766279, "lon": -81.686783}, "GA": {"lat": 33.040619, "lon": -83.643074},
    "HI": {"lat": 21.094318, "lon": -157.498337}, "ID": {"lat": 44.240459, "lon": -114.478828},
    "IL": {"lat": 40.349457, "lon": -88.986137}, "IN": {"lat": 39.849426, "lon": -86.258278},
    "IA": {"lat": 42.011539, "lon": -93.210526}, "KS": {"lat": 38.526600, "lon": -96.726486},
    "KY": {"lat": 37.668140, "lon": -84.670067}, "LA": {"lat": 31.169546, "lon": -91.867805},
    "ME": {"lat": 44.693947, "lon": -69.381927}, "MD": {"lat": 39.063946, "lon": -76.802101},
    "MA": {"lat": 42.230171, "lon": -71.530106}, "MI": {"lat": 43.326618, "lon": -84.536095},
    "MN": {"lat": 45.694454, "lon": -93.900192}, "MS": {"lat": 32.741646, "lon": -89.678696},
    "MO": {"lat": 38.456085, "lon": -92.288368}, "MT": {"lat": 46.921925, "lon": -110.454353},
    "NE": {"lat": 41.125370, "lon": -98.268082}, "NV": {"lat": 38.313515, "lon": -117.055374},
    "NH": {"lat": 43.452492, "lon": -71.563896}, "NJ": {"lat": 40.298904, "lon": -74.521011},
    "NM": {"lat": 34.840515, "lon": -106.248482}, "NY": {"lat": 42.165726, "lon": -74.948051},
    "NC": {"lat": 35.630066, "lon": -79.806419}, "ND": {"lat": 47.528912, "lon": -99.784012},
    "OH": {"lat": 40.388783, "lon": -82.764915}, "OK": {"lat": 35.565342, "lon": -96.928917},
    "OR": {"lat": 44.572021, "lon": -122.070938}, "PA": {"lat": 40.590752, "lon": -77.209755},
    "RI": {"lat": 41.680893, "lon": -71.511780}, "SC": {"lat": 33.856892, "lon": -80.945007},
    "SD": {"lat": 44.299782, "lon": -99.438828}, "TN": {"lat": 35.747845, "lon": -86.692345},
    "TX": {"lat": 31.054487, "lon": -97.563461}, "UT": {"lat": 40.150032, "lon": -111.862434},
    "VT": {"lat": 44.045876, "lon": -72.710686}, "VA": {"lat": 37.769337, "lon": -78.169968},
    "WA": {"lat": 47.400902, "lon": -121.490494}, "WV": {"lat": 38.491226, "lon": -80.954453},
    "WI": {"lat": 44.268543, "lon": -89.616508}, "WY": {"lat": 42.755966, "lon": -107.302490},
    "PR": {"lat": 18.220833, "lon": -66.590149}, "VI": {"lat": 18.3358, "lon": -64.8963}
}

def extract_analytical_dataset(df: pd.DataFrame):
    """
    Extracts a lightweight row-level analytical dataset containing 11 core attributes:
    Year, Month, State, City, Airport_Code, Airport_Name, Claim_Type, Claim_Site, Item_Category, Close_Amount, Disposition
    """
    cols_map = {
        'Year_Clean': 'Year',
        'Month_Clean': 'Month',
        'State': 'State',
        'City': 'City',
        'Airport_Code': 'Airport_Code',
        'Airport_Name': 'Airport_Name',
        'Claim_Type': 'Claim_Type',
        'Claim_Site': 'Claim_Site',
        'Item_Category': 'Item_Category',
        'Close_Amount': 'Close_Amount',
        'Disposition': 'Disposition'
    }

    available_cols = [c for c in cols_map.keys() if c in df.columns]
    analytical_df = df[available_cols].copy()

    rename_dict = {c: cols_map[c] for c in available_cols}
    analytical_df.rename(columns=rename_dict, inplace=True)

    if 'Close_Amount' in analytical_df:
        analytical_df['Close_Amount'] = pd.to_numeric(analytical_df['Close_Amount'], errors='coerce').fillna(0.0)

    records = analytical_df.to_dict(orient='records')
    return records

def build_airport_coordinates_dict(df: pd.DataFrame):
    """
    Builds a complete lookup mapping for all airport codes present in the dataset,
    combining known lat/lon data with fallback state centroid coordinates.
    """
    result = {}

    if 'Airport_Code' not in df or 'State' not in df:
        return US_AIRPORT_COORDINATES

    airport_grouped = df.groupby(['Airport_Code', 'State', 'Airport_Name']).size().reset_index(name='count')

    for _, row in airport_grouped.iterrows():
        code = str(row['Airport_Code']).strip()
        state = str(row['State']).strip()
        name = str(row['Airport_Name']).strip()

        if not code or code == 'Unknown':
            continue

        if code in US_AIRPORT_COORDINATES:
            coord = US_AIRPORT_COORDINATES[code].copy()
            if name and name != 'Unknown':
                coord['name'] = name
            result[code] = coord
        elif state in STATE_CENTROIDS:
            # Deterministic micro jitter around state centroid so multiple airports in same state don't overlap exactly
            centroid = STATE_CENTROIDS[state]
            jitter_seed = sum(ord(c) for c in code)
            lat_jitter = ((jitter_seed % 17) - 8) * 0.08
            lon_jitter = (((jitter_seed * 3) % 19) - 9) * 0.08

            result[code] = {
                "lat": round(centroid['lat'] + lat_jitter, 4),
                "lon": round(centroid['lon'] + lon_jitter, 4),
                "name": name if name and name != 'Unknown' else f"Airport {code}",
                "state": state
            }

    return result

def generate_analytics_summary(df: pd.DataFrame):
    """
    Computes overview statistics, filter dropdown options, dynamic state-airport mappings,
    sample records, and research insights from the TSA claims dataframe.
    """
    raw_columns = list(df.columns)
    display_columns = [c for c in raw_columns if c not in ['Parsed_Date', 'Year_Clean', 'Month_Clean']]

    total_records = len(df)
    total_columns = len(display_columns)

    airport_col = 'Airport_Code' if 'Airport_Code' in df else ('Airport_Name' if 'Airport_Name' in df else None)
    unique_airports = df[df[airport_col] != 'Unknown'][airport_col].nunique() if airport_col else 0

    state_col = 'State' if 'State' in df else ('StateName' if 'StateName' in df else None)
    unique_states = df[df[state_col] != 'Unknown'][state_col].nunique() if state_col else 0

    years_series = df['Year_Clean'][df['Year_Clean'] != 'Unknown']
    if not years_series.empty:
        valid_years = sorted([int(y) for y in years_series.unique() if y.isdigit()])
        year_range = f"{valid_years[0]} – {valid_years[-1]}" if valid_years else "N/A"
        years_list = [str(y) for y in valid_years]
    else:
        year_range = "N/A"
        years_list = []

    states_list = sorted([str(s) for s in df['State'].unique() if s and s != 'Unknown']) if 'State' in df else []
    
    if 'Airport_Code' in df and 'Airport_Name' in df:
        airport_pairs = df[['Airport_Code', 'Airport_Name']].drop_duplicates()
        airport_pairs = airport_pairs[airport_pairs['Airport_Code'] != 'Unknown']
        airports_list = sorted(list(airport_pairs['Airport_Code'].unique()))
    elif airport_col:
        airports_list = sorted([str(a) for a in df[airport_col].unique() if a and a != 'Unknown'])
    else:
        airports_list = []

    claim_types = sorted([str(c) for c in df['Claim_Type'].unique() if c and c != 'Unknown']) if 'Claim_Type' in df else []
    item_cats = sorted([str(i) for i in df['Item_Category'].unique() if i and i != 'Unknown']) if 'Item_Category' in df else []

    available_months = set(df['Month_Clean'].unique())
    months_list = [m for m in MONTH_ORDER if m in available_months]

    state_airport_map = {}
    if 'State' in df and airport_col:
        grouped = df.groupby('State')[airport_col].unique()
        for st, apts in grouped.items():
            if st and st != 'Unknown':
                valid_apts = sorted([str(a) for a in apts if a and a != 'Unknown'])
                if valid_apts:
                    state_airport_map[str(st)] = valid_apts

    sample_df = df[display_columns].head(20).copy()
    sample_records = sample_df.to_dict(orient='records')

    # Executive Analytical Findings Generation
    insights = []

    if 'Close_Amount' in df:
        total_close = float(df['Close_Amount'].sum())
        avg_close = float(df['Close_Amount'].mean())
        insights.append({
            "id": "INS-001",
            "category": "Financial Loss Analysis",
            "title": "Aggregated Claims Financial Disbursal",
            "summary": f"Historical TSA claim settlements totaled ${total_close:,.2f} across all recorded cases, with an average claim resolution payout of ${avg_close:,.2f}.",
            "severity": "high",
            "metric": f"${total_close/1e6:.2f}M Settlement Total"
        })

    if 'Item_Category' in df:
        top_cat_series = df[df['Item_Category'] != 'Unknown']['Item_Category'].value_counts()
        if not top_cat_series.empty:
            top_cat_name = top_cat_series.index[0]
            top_cat_count = int(top_cat_series.iloc[0])
            pct = (top_cat_count / total_records) * 100
            insights.append({
                "id": "INS-002",
                "category": "Property Loss Patterns",
                "title": f"Primary Loss Category: {top_cat_name}",
                "summary": f"'{top_cat_name}' represents the single largest loss category accounting for {top_cat_count:,} recorded incidents ({pct:.1f}% of total claims).",
                "severity": "medium",
                "metric": f"{top_cat_count:,} Incidents"
            })

    if 'State' in df:
        top_state_series = df[df['State'] != 'Unknown']['State'].value_counts()
        if not top_state_series.empty:
            top_state_code = top_state_series.index[0]
            top_state_count = int(top_state_series.iloc[0])
            insights.append({
                "id": "INS-003",
                "category": "Geographical Concentration",
                "title": f"High Volume Region Identified ({top_state_code})",
                "summary": f"State '{top_state_code}' recorded the highest density of property loss and damage claims with {top_state_count:,} total filings.",
                "severity": "info",
                "metric": f"{top_state_count:,} Filings"
            })

    if 'Disposition' in df:
        deny_count = int(len(df[df['Disposition'].str.contains('Deny|Denied', case=False, na=False)]))
        deny_pct = (deny_count / total_records) * 100
        insights.append({
            "id": "INS-004",
            "category": "Operational Efficiency",
            "title": "Claim Disposition & Denial Rate",
            "summary": f"Approximately {deny_pct:.1f}% of all filed claims ({deny_count:,} cases) resulted in formal denial by claims adjusters.",
            "severity": "warning",
            "metric": f"{deny_pct:.1f}% Denial Rate"
        })

    return {
        "overview": {
            "total_records": total_records,
            "total_columns": total_columns,
            "airports_covered": unique_airports,
            "states_covered": unique_states,
            "year_range": year_range,
            "columns": display_columns
        },
        "filter_options": {
            "years": years_list,
            "states": states_list,
            "airports": airports_list,
            "claim_types": claim_types,
            "item_categories": item_cats,
            "months": months_list,
            "state_airport_map": state_airport_map
        },
        "sample_records": sample_records,
        "research_insights": insights
    }

if __name__ == "__main__":
    df = load_and_clean_data()
    dataset_records = extract_analytical_dataset(df)
    airport_coords = build_airport_coordinates_dict(df)
    summary = generate_analytics_summary(df)
    print(f"Analytical dataset extracted: {len(dataset_records):,} records with City & Claim_Site.")
    print(f"Airport coordinates mapped: {len(airport_coords)} airports.")
