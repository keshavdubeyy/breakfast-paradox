"""
Clean the April mess breakfast data (april-data.xlsx) and get it ready for analysis.

Source columns:
  meal_date   - the date the breakfast slot was registered/allotted for
  meal_mess   - which mess counter (kadamba-veg / kadamba-nonveg)
  availed_at  - timestamp the student actually swiped in for the meal;
                blank means the meal was registered but never availed

Rows with a missing availed_at are kept as-is (a blank availed_at is a real,
meaningful outcome — "registered but skipped" — not bad data), and rows are
never deduplicated: there is no per-student identifier in this export, so two
identical rows are two different students, not one repeated record.

Usage:
    python scripts/clean_april_data.py [INPUT_XLSX] [OUTPUT_DIR]

Defaults to ./april-data.xlsx -> ./data/
"""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd

KNOWN_MESSES = {"kadamba-veg", "kadamba-nonveg"}


def load(input_path: Path) -> pd.DataFrame:
    df = pd.read_excel(input_path, sheet_name=0)
    expected_cols = {"meal_date", "meal_mess", "availed_at"}
    missing = expected_cols - set(df.columns)
    if missing:
        raise ValueError(f"Missing expected column(s): {sorted(missing)}")
    return df


def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # meal_date: normalize to a plain date (source has no time component)
    df["meal_date"] = pd.to_datetime(df["meal_date"], errors="raise").dt.normalize()

    # meal_mess: trim/lowercase for consistency, then validate against known values
    df["meal_mess"] = df["meal_mess"].astype(str).str.strip().str.lower()
    unknown = sorted(set(df["meal_mess"]) - KNOWN_MESSES)
    if unknown:
        raise ValueError(f"Unrecognized meal_mess value(s): {unknown}")

    # availed_at: parse to tz-aware timestamps; invalid non-blank strings become NaT
    # but get flagged rather than silently dropped
    raw_availed = df["availed_at"]
    parsed_availed = pd.to_datetime(raw_availed, errors="coerce", utc=False)
    bad_availed = raw_availed.notna() & parsed_availed.isna()
    if bad_availed.any():
        raise ValueError(
            f"{bad_availed.sum()} availed_at value(s) could not be parsed as timestamps: "
            f"{raw_availed[bad_availed].unique().tolist()}"
        )
    df["availed_at"] = parsed_availed

    # Sanity check: when availed, it should be on the same calendar day as meal_date
    avail_local_date = df["availed_at"].dt.tz_localize(None).dt.normalize()
    mismatched = df["availed_at"].notna() & (avail_local_date != df["meal_date"])
    if mismatched.any():
        raise ValueError(
            f"{mismatched.sum()} row(s) have availed_at on a different calendar day "
            "than meal_date — investigate before analysis."
        )

    # Derived fields useful for analysis — none of this drops or alters source rows
    df["availed"] = df["availed_at"].notna()
    df["day_of_week"] = df["meal_date"].dt.day_name()
    df["is_weekend"] = df["meal_date"].dt.dayofweek >= 5
    df["availed_time_ist"] = df["availed_at"].dt.tz_convert("Asia/Kolkata").dt.time
    df["availed_hour_ist"] = df["availed_at"].dt.tz_convert("Asia/Kolkata").dt.hour

    df = df.sort_values(
        ["meal_date", "meal_mess", "availed_at"], na_position="last", kind="stable"
    ).reset_index(drop=True)

    return df


def summarize(df: pd.DataFrame) -> None:
    total = len(df)
    availed = int(df["availed"].sum())
    print(f"Rows:              {total}")
    print(f"Date range:        {df['meal_date'].min().date()} to {df['meal_date'].max().date()}")
    print(f"Distinct dates:    {df['meal_date'].dt.date.nunique()}")
    print(f"Availed:           {availed} ({availed / total:.1%})")
    print(f"Not availed:       {total - availed} ({1 - availed / total:.1%})")
    print("\nBy mess:")
    print(df.groupby("meal_mess")["availed"].agg(registered="size", availed="sum"))
    print("\nBy day of week (availed rate):")
    print(
        df.groupby("day_of_week")["availed"]
        .mean()
        .reindex(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"])
    )


def main() -> None:
    args = sys.argv[1:]
    input_path = Path(args[0]) if len(args) > 0 else Path("april-data.xlsx")
    output_dir = Path(args[1]) if len(args) > 1 else Path("data")
    output_dir.mkdir(parents=True, exist_ok=True)

    df = load(input_path)
    clean_df = clean(df)

    csv_path = output_dir / "april-data-clean.csv"
    parquet_path = output_dir / "april-data-clean.parquet"
    clean_df.to_csv(csv_path, index=False)
    clean_df.to_parquet(parquet_path, index=False)

    print(f"Cleaned {len(df)} rows -> {csv_path} and {parquet_path}\n")
    summarize(clean_df)


if __name__ == "__main__":
    main()
