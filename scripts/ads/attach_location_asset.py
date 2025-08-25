#!/usr/bin/env python3
"""
Attach Location assets (from linked Google Business Profile) at the account level,
and associate them to the active Search campaign.

Usage:
  python3 scripts/ads/attach_location_asset.py --customer-id 5072649468 --config /abs/path/google-ads.yaml
"""

from __future__ import annotations

import argparse
from typing import Optional

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException


ACTIVE_CAMPAIGN_NAME_HINT = "HMNP – Mobile – 77591 Radius"


def run_query(client: GoogleAdsClient, customer_id: str, query: str):
    svc = client.get_service("GoogleAdsService")
    return svc.search(customer_id=customer_id, query=query)


def find_active_campaign(client: GoogleAdsClient, customer_id: str) -> Optional[str]:
    q = (
        "SELECT campaign.resource_name, campaign.name, campaign.status, campaign.advertising_channel_type "
        "FROM campaign ORDER BY campaign.status DESC"
    )
    candidate = None
    for row in run_query(client, customer_id, q):
        if row.campaign.name == ACTIVE_CAMPAIGN_NAME_HINT:
            return row.campaign.resource_name
        if row.campaign.status.name == "ENABLED" and row.campaign.advertising_channel_type.name == "SEARCH" and not candidate:
            candidate = row.campaign.resource_name
    return candidate


def find_location_asset_set(client: GoogleAdsClient, customer_id: str) -> Optional[str]:
    # Prefer existing LOCATION AssetSet (typically created when GBP is linked)
    q = (
        "SELECT asset_set.resource_name, asset_set.id, asset_set.name, asset_set.type "
        "FROM asset_set"
    )
    for row in run_query(client, customer_id, q):
        try:
            if row.asset_set.type_.name == "LOCATION":
                return row.asset_set.resource_name
        except Exception:
            continue
    return None


def associate_campaign_location_asset_set(client: GoogleAdsClient, customer_id: str, campaign_res: str, asset_set_res: str) -> None:
    # Associate the LOCATION AssetSet to the campaign
    svc = client.get_service("CampaignAssetSetService")
    op = client.get_type("CampaignAssetSetOperation")
    cas = op.create
    cas.campaign = campaign_res
    cas.asset_set = asset_set_res
    svc.mutate_campaign_asset_sets(customer_id=customer_id, operations=[op])


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Attach Location assets from linked GBP")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--config", default=None)
    args = p.parse_args(argv)

    try:
        client = GoogleAdsClient.load_from_storage(path=args.config) if args.config else GoogleAdsClient.load_from_storage()
        campaign_res = find_active_campaign(client, args.customer_id)
        if not campaign_res:
            print("No active Search campaign found.")
            return 0
        asset_set_res = find_location_asset_set(client, args.customer_id)
        if not asset_set_res:
            print("No LOCATION AssetSet found. Ensure GBP is linked in Linked accounts and try again.")
            return 1
        associate_campaign_location_asset_set(client, args.customer_id, campaign_res, asset_set_res)
        print("Location asset set associated to the active campaign.")
        return 0
    except GoogleAdsException as ex:
        print(f"GoogleAdsException: {ex}")
        for e in ex.failure.errors:
            print(f"  - {e.error_code}: {e.message}")
        return 2
    except Exception as ex:  # noqa: BLE001
        print(f"Error: {ex}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())


