#!/usr/bin/env python3
"""
List final URLs and key details for Responsive Search Ads in a campaign.

Usage:
  python3 scripts/ads/list_ad_urls.py --customer-id 5072649468 --campaign-id 22917408924 --config google-ads.yaml
"""

from __future__ import annotations

import argparse
from typing import Optional

from google.ads.googleads.client import GoogleAdsClient


def list_ad_urls(client: GoogleAdsClient, customer_id: str, campaign_id: Optional[str] = None) -> None:
    where = "WHERE ad_group_ad.ad.type = RESPONSIVE_SEARCH_AD AND ad_group_ad.status != REMOVED"
    if campaign_id:
        where += f" AND campaign.id = {campaign_id}"

    query = f"""
      SELECT
        campaign.id,
        campaign.name,
        ad_group.id,
        ad_group.name,
        ad_group_ad.status,
        ad_group_ad.ad.id,
        ad_group_ad.ad.final_urls,
        ad_group_ad.ad.responsive_search_ad.path1,
        ad_group_ad.ad.responsive_search_ad.path2
      FROM ad_group_ad
      {where}
      ORDER BY campaign.name, ad_group.name
    """

    svc = client.get_service("GoogleAdsService")
    rows = svc.search(customer_id=customer_id, query=query)

    print("\nAds and Final URLs:\n")
    for row in rows:
        urls = list(row.ad_group_ad.ad.final_urls) if row.ad_group_ad.ad.final_urls else []
        path1 = row.ad_group_ad.ad.responsive_search_ad.path1 or ""
        path2 = row.ad_group_ad.ad.responsive_search_ad.path2 or ""
        print(
            f"- {row.campaign.name} › {row.ad_group.name} | Ad {row.ad_group_ad.ad.id} | {row.ad_group_ad.status.name}\n"
            f"  Final URLs: {', '.join(urls) if urls else '(none)'}\n"
            f"  Display path: /{path1}/{path2}\n"
        )


def main() -> int:
    p = argparse.ArgumentParser(description="List RSA final URLs for a campaign")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--campaign-id", required=False)
    p.add_argument("--config", default="google-ads.yaml")
    args = p.parse_args()

    client = GoogleAdsClient.load_from_storage(path=args.config)
    list_ad_urls(client, args.customer_id, args.campaign_id)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())



