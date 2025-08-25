#!/usr/bin/env python3
"""
Replace all SITELINK campaign assets with a provided set for a single campaign.

Usage:
  python scripts/ads/replace_sitelinks.py \
    --customer-id 5072649468 \
    --campaign-id 22917408924 \
    --base-url https://houstonmobilenotarypros.com \
    --config google-ads.yaml
"""

import argparse
from typing import List

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException


def run_query(client: GoogleAdsClient, customer_id: str, query: str):
    return client.get_service("GoogleAdsService").search(customer_id=customer_id, query=query)


def remove_existing_campaign_sitelinks(client: GoogleAdsClient, customer_id: str, campaign_id: str) -> None:
    q = f"""
      SELECT campaign.id, campaign_asset.resource_name, campaign_asset.field_type
      FROM campaign_asset
      WHERE campaign.id = {campaign_id} AND campaign_asset.field_type = SITELINK
    """
    cas = [row.campaign_asset.resource_name for row in run_query(client, customer_id, q)]
    if not cas:
        return
    svc = client.get_service("CampaignAssetService")
    ops = []
    for rn in cas:
        op = client.get_type("CampaignAssetOperation")
        op.remove = rn
        ops.append(op)
    svc.mutate_campaign_assets(customer_id=customer_id, operations=ops)


def add_sitelinks(client: GoogleAdsClient, customer_id: str, campaign_id: str, base_url: str) -> None:
    # Short texts that meet length limits
    items = [
        {"text": "Book Mobile Notary", "url": f"{base_url}/booking/enhanced"},
        {"text": "Start Online Notary", "url": f"{base_url}/ron/dashboard"},
        {"text": "Pricing & Fees", "url": f"{base_url}/pricing"},
        {"text": "Business Plans", "url": f"{base_url}/business"},
        {"text": "Service Area & Fees", "url": f"{base_url}/service-area"},
        {"text": "Contact / Help", "url": f"{base_url}/contact"},
    ]

    asset_svc = client.get_service("AssetService")
    ops = []
    for it in items:
        op = client.get_type("AssetOperation")
        asset = op.create
        asset.sitelink_asset.link_text = it["text"]
        asset.final_urls.append(it["url"])  # type: ignore[attr-defined]
        ops.append(op)
    resp = asset_svc.mutate_assets(customer_id=customer_id, operations=ops)
    asset_rns = [r.resource_name for r in resp.results]

    ca_svc = client.get_service("CampaignAssetService")
    ca_ops = []
    campaign_path = client.get_service("GoogleAdsService").campaign_path(customer_id, campaign_id)
    for rn in asset_rns:
        op = client.get_type("CampaignAssetOperation")
        ca = op.create
        ca.asset = rn
        ca.field_type = client.enums.AssetFieldTypeEnum.SITELINK
        ca.campaign = campaign_path
        ca_ops.append(op)
    ca_svc.mutate_campaign_assets(customer_id=customer_id, operations=ca_ops)


def main():
    p = argparse.ArgumentParser(description="Replace sitelinks for a campaign")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--campaign-id", required=True)
    p.add_argument("--base-url", required=True)
    p.add_argument("--config", default="google-ads.yaml")
    args = p.parse_args()

    client = GoogleAdsClient.load_from_storage(path=args.config)
    try:
        remove_existing_campaign_sitelinks(client, args.customer_id, args.campaign_id)
        add_sitelinks(client, args.customer_id, args.campaign_id, args.base_url)
        print("Sitelinks replaced for campaign", args.campaign_id)
    except GoogleAdsException as ex:
        print("GoogleAdsException:", ex)
        for e in ex.failure.errors:
            print(" -", e.error_code, e.message)
        raise


if __name__ == "__main__":
    main()


