#!/usr/bin/env python3
"""
List campaign assets (extensions) for a given campaign.

Usage:
  python scripts/ads/list_campaign_assets.py --customer-id 5072649468 --campaign-id 22917408924 --config google-ads.yaml
"""

import argparse
from typing import Optional

from google.ads.googleads.client import GoogleAdsClient


def run_query(client: GoogleAdsClient, customer_id: str, query: str):
    svc = client.get_service("GoogleAdsService")
    return svc.search(customer_id=customer_id, query=query)


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description="List campaign assets")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--campaign-id", required=True)
    p.add_argument("--config", default="google-ads.yaml")
    args = p.parse_args(argv)

    client = GoogleAdsClient.load_from_storage(path=args.config)

    query = f"""
      SELECT
        campaign.name,
        campaign.id,
        campaign_asset.field_type,
        campaign_asset.status,
        asset.id,
        asset.type,
        asset.sitelink_asset.link_text,
        asset.callout_asset.callout_text,
        asset.structured_snippet_asset.header,
        asset.structured_snippet_asset.values,
        asset.price_asset.type,
        asset.promotion_asset.promotion_target
      FROM campaign_asset
      WHERE campaign.id = {args.campaign_id}
      ORDER BY campaign_asset.field_type
    """

    rows = run_query(client, args.customer_id, query)
    print("Campaign assets for", args.campaign_id)
    for row in rows:
        ca = row.campaign_asset
        asset = row.asset
        details = []
        if asset.type_.name == "SITELINK":
            details.append(f"text='{asset.sitelink_asset.link_text}'")
        elif asset.type_.name == "CALLOUT":
            details.append(f"text='{asset.callout_asset.callout_text}'")
        elif asset.type_.name == "STRUCTURED_SNIPPET":
            header = row.asset.structured_snippet_asset.header
            details.append(f"header={header if isinstance(header, str) else header.name}")
        elif asset.type_.name == "PRICE":
            details.append(f"price_type={row.asset.price_asset.type_.name}")
        elif asset.type_.name == "PROMOTION":
            details.append(f"promo='{row.asset.promotion_asset.promotion_target}'")

        print(f"- {row.campaign.name} | {ca.field_type.name} | {ca.status.name} | asset_id={asset.id} | {asset.type_.name} " + ("| " + ", ".join(details) if details else ""))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())


