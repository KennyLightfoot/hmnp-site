#!/usr/bin/env python3
"""
Export daily Google Ads KPIs (campaign-level) to CSV.

Usage:
  python3 scripts/ads/daily_export.py --customer-id 5072649468 --out-dir scripts/ads/exports --config google-ads.yaml

Generates: scripts/ads/exports/daily-YYYYMMDD.csv with columns:
  date,campaign_id,campaign_name,impressions,clicks,cost,cost_usd,conversions,conv_value
"""

from __future__ import annotations

import argparse
import csv
import os
from datetime import datetime, timedelta, timezone

from google.ads.googleads.client import GoogleAdsClient


def micros_to_usd(micros: int) -> float:
    return round(micros / 1_000_000, 2)


def export_daily(client: GoogleAdsClient, customer_id: str, out_dir: str) -> str:
    # Use previous day in account time zone; Google will handle account TZ.
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).date()
    day_str = yesterday.strftime("%Y-%m-%d")

    query = f"""
      SELECT
        segments.date,
        campaign.id,
        campaign.name,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      WHERE segments.date = '{day_str}'
      ORDER BY campaign.name
    """

    svc = client.get_service("GoogleAdsService")
    rows = svc.search(customer_id=customer_id, query=query)

    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"daily-{yesterday.strftime('%Y%m%d')}.csv")
    with open(out_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "date",
            "campaign_id",
            "campaign_name",
            "impressions",
            "clicks",
            "cost_micros",
            "cost_usd",
            "conversions",
            "conv_value",
        ])
        for row in rows:
            cost_usd = micros_to_usd(row.metrics.cost_micros or 0)
            writer.writerow([
                row.segments.date,
                row.campaign.id,
                row.campaign.name,
                row.metrics.impressions or 0,
                row.metrics.clicks or 0,
                row.metrics.cost_micros or 0,
                cost_usd,
                row.metrics.conversions or 0,
                row.metrics.conversions_value or 0,
            ])
    return out_path


def main() -> int:
    p = argparse.ArgumentParser(description="Export daily Ads KPIs to CSV")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--out-dir", default="scripts/ads/exports")
    p.add_argument("--config", default="google-ads.yaml")
    args = p.parse_args()

    client = GoogleAdsClient.load_from_storage(path=args.config)
    path = export_daily(client, args.customer_id, args.out_dir)
    print(f"Wrote {path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


