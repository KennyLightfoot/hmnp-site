#!/usr/bin/env python3
"""
Update Responsive Search Ads final URLs in a campaign.

Use case: Switch RSAs that point to homepage to point to /booking/enhanced.

Usage:
  python3 scripts/ads/update_ad_final_url.py --customer-id 5072649468 --campaign-id 22917408924 \
      --from-url https://houstonmobilenotarypros.com --to-url https://houstonmobilenotarypros.com/booking/enhanced \
      --config google-ads.yaml
"""

from __future__ import annotations

import argparse
from typing import List

from google.ads.googleads.client import GoogleAdsClient
from google.api_core import protobuf_helpers


def find_ads(client: GoogleAdsClient, customer_id: str, campaign_id: str, from_url: str) -> List[str]:
    """Return resource_names for RSAs in a campaign whose final_urls contain from_url."""
    ga_service = client.get_service("GoogleAdsService")
    query = f"""
      SELECT
        ad_group_ad.resource_name,
        ad_group_ad.ad.final_urls,
        ad_group_ad.ad.id,
        ad_group_ad.status,
        campaign.id,
        campaign.name,
        ad_group.name
      FROM ad_group_ad
      WHERE campaign.id = {campaign_id}
        AND ad_group_ad.ad.type = RESPONSIVE_SEARCH_AD
        AND ad_group_ad.status != REMOVED
    """
    to_update: List[str] = []
    rows = ga_service.search(customer_id=customer_id, query=query)
    for row in rows:
        urls = list(row.ad_group_ad.ad.final_urls) if row.ad_group_ad.ad.final_urls else []
        if any(u.rstrip("/") == from_url.rstrip("/") for u in urls):
            to_update.append(row.ad_group_ad.resource_name)
            print(f"Will update Ad {row.ad_group_ad.ad.id} in {row.campaign.name} › {row.ad_group.name}: {urls}")
    return to_update


def update_final_urls(client: GoogleAdsClient, customer_id: str, resource_names: List[str], to_url: str) -> None:
    ad_group_ad_service = client.get_service("AdGroupAdService")
    ad_group_ad_operation = client.get_type("AdGroupAdOperation")
    operations = []

    for rn in resource_names:
        op = client.get_type("AdGroupAdOperation")
        ad_group_ad = op.update
        ad_group_ad.resource_name = rn
        # Set new final URL
        ad = ad_group_ad.ad
        ad.final_urls.append(to_url)
        # Clear previous URLs by replacing the list
        # proto-plus lists require this approach
        ad.final_urls[:] = [to_url]
        client.copy_from(op.update_mask, protobuf_helpers.field_mask(None, ad_group_ad._pb))
        operations.append(op)

    if not operations:
        print("No matching ads to update.")
        return

    response = ad_group_ad_service.mutate_ad_group_ads(customer_id=customer_id, operations=operations)
    for result in response.results:
        print(f"Updated: {result.resource_name}")


def main() -> int:
    p = argparse.ArgumentParser(description="Update RSA final URLs in a campaign")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--campaign-id", required=True)
    p.add_argument("--from-url", required=True)
    p.add_argument("--to-url", required=True)
    p.add_argument("--config", default="google-ads.yaml")
    args = p.parse_args()

    client = GoogleAdsClient.load_from_storage(path=args.config)
    rns = find_ads(client, args.customer_id, args.campaign_id, args.from_url)
    update_final_urls(client, args.customer_id, rns, args.to_url)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())



