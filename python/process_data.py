import os
import pandas as pd
import numpy as np

DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "cleaned_tsa_claims.csv")

def load_and_clean_data(file_path=DATA_PATH):
    """
    Loads and cleans the TSA claims dataset dynamically.
    Auto-detects columns, converts dates, handles missing values,
    and extracts Year/Month features.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found at {file_path}")

    # Load CSV with low_memory=False for safety
    df = pd.read_csv(file_path, low_memory=False)
    
    # Trim whitespace from string columns
    str_cols = df.select_dtypes(include=['object']).columns
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip()

    # Fill NaN / empty / 'nan' strings with 'Unknown'
    df = df.replace({'nan': 'Unknown', '': 'Unknown', np.nan: 'Unknown'})

    # Auto-detect date column
    date_cols = [c for c in df.columns if 'date' in c.lower()]
    primary_date_col = date_cols[0] if date_cols else None

    if primary_date_col:
        df['Parsed_Date'] = pd.to_datetime(df[primary_date_col], errors='coerce')

    # Ensure Close_Amount is numeric float
    if 'Close_Amount' in df.columns:
        df['Close_Amount'] = pd.to_numeric(df['Close_Amount'], errors='coerce').fillna(0.0)

    # Ensure Year column is clean string/int
    if 'Year' in df.columns:
        df['Year_Clean'] = df['Year'].astype(str).str.replace('.0', '', regex=False)
        df['Year_Clean'] = df['Year_Clean'].apply(lambda y: y if y.isdigit() and len(y) == 4 else 'Unknown')
    elif primary_date_col and 'Parsed_Date' in df:
        df['Year_Clean'] = df['Parsed_Date'].dt.year.fillna('Unknown').astype(str)
    else:
        df['Year_Clean'] = 'Unknown'

    # Ensure Month column is clean string
    if 'Month' in df.columns:
        df['Month_Clean'] = df['Month'].astype(str)
    elif primary_date_col and 'Parsed_Date' in df:
        df['Month_Clean'] = df['Parsed_Date'].dt.strftime('%B').fillna('Unknown')
    else:
        df['Month_Clean'] = 'Unknown'

    return df

if __name__ == "__main__":
    print("Testing process_data.py...")
    cleaned_df = load_and_clean_data()
    print(f"Dataset loaded successfully: {len(cleaned_df):,} rows, {len(cleaned_df.columns)} columns.")
    print("Sample columns:", list(cleaned_df.columns[:10]))
