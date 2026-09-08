import os
import json
from process_data import load_and_clean_data
from analytics import (
    generate_analytics_summary,
    extract_analytical_dataset,
    build_airport_coordinates_dict
)

PUBLIC_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "data")

def export_all():
    os.makedirs(PUBLIC_DATA_DIR, exist_ok=True)
    
    print("Step 1: Loading and cleaning CSV dataset...")
    df = load_and_clean_data()
    
    print("Step 2: Extracting analytical dataset records...")
    analytical_records = extract_analytical_dataset(df)

    print("Step 3: Building airport coordinates database...")
    airport_coords = build_airport_coordinates_dict(df)

    print("Step 4: Computing analytical summaries...")
    summary = generate_analytics_summary(df)

    # Export analytics_dataset.json
    analytics_dataset_path = os.path.join(PUBLIC_DATA_DIR, "analytics_dataset.json")
    with open(analytics_dataset_path, "w", encoding="utf-8") as f:
        json.dump(analytical_records, f, separators=(',', ':'))
    print(f"Exported: {analytics_dataset_path} ({len(analytical_records):,} records)")

    # Export airport_coordinates.json
    coords_path = os.path.join(PUBLIC_DATA_DIR, "airport_coordinates.json")
    with open(coords_path, "w", encoding="utf-8") as f:
        json.dump(airport_coords, f, indent=2)
    print(f"Exported: {coords_path} ({len(airport_coords)} airports)")

    # Export overview.json
    overview_path = os.path.join(PUBLIC_DATA_DIR, "overview.json")
    with open(overview_path, "w", encoding="utf-8") as f:
        json.dump(summary["overview"], f, indent=2)
    print(f"Exported: {overview_path}")

    # Export filter_options.json
    filter_path = os.path.join(PUBLIC_DATA_DIR, "filter_options.json")
    with open(filter_path, "w", encoding="utf-8") as f:
        json.dump(summary["filter_options"], f, indent=2)
    print(f"Exported: {filter_path}")

    # Export sample_claims.json
    sample_path = os.path.join(PUBLIC_DATA_DIR, "sample_claims.json")
    with open(sample_path, "w", encoding="utf-8") as f:
        json.dump(summary["sample_records"], f, indent=2)
    print(f"Exported: {sample_path}")

    # Export research_insights.json
    insights_path = os.path.join(PUBLIC_DATA_DIR, "research_insights.json")
    with open(insights_path, "w", encoding="utf-8") as f:
        json.dump(summary["research_insights"], f, indent=2)
    print(f"Exported: {insights_path}")

    print("Success! Python analytics layer export complete.")

if __name__ == "__main__":
    export_all()
