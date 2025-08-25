#!/usr/bin/env python3
"""
Add Google Ads extensions (sitelinks, callouts, structured snippet, price, promo)
for a specific campaign.

Usage example:
  python scripts/ads/add_extensions.py \
    --customer-id 5072649468 \
    --campaign-id 22917408924 \
    --base-url https://houstonmobilenotarypros.com \
    --config google-ads.yaml

This script uses dynamic types from GoogleAdsClient to be version-agnostic.
"""

import argparse
import sys
from datetime import date

from google.ads.googleads.client import GoogleAdsClient


def micros_from_dollars(amount: float) -> int:
    return int(round(amount * 1_000_000))


def add_sitelinks(client: GoogleAdsClient, customer_id: str, campaign_id: str, base_url: str):
    asset_service = client.get_service("AssetService")
    asset_operation = client.get_type("AssetOperation")

    sitelinks = [
        {"text": "Book Mobile Notary", "url": f"{base_url}/booking/enhanced"},
        {"text": "Start Online Notary", "url": f"{base_url}/ron/dashboard"},
        {"text": "Pricing & Fees", "url": f"{base_url}/pricing"},
        {"text": "Business Plans", "url": f"{base_url}/business"},
        {"text": "Service Area & Fees", "url": f"{base_url}/service-area"},
        {"text": "Contact / Help", "url": f"{base_url}/contact"},
    ]

    operations = []
    for sl in sitelinks:
        op = client.get_type("AssetOperation")
        asset = op.create
        sitelink_asset = asset.sitelink_asset
        sitelink_asset.link_text = sl["text"]
        asset.final_urls.append(sl["url"])  # type: ignore[attr-defined]
        operations.append(op)

    asset_response = asset_service.mutate_assets(customer_id=customer_id, operations=operations)
    created_assets = [result.resource_name for result in asset_response.results]

    # Associate with campaign
    campaign_asset_service = client.get_service("CampaignAssetService")
    campaign_asset_ops = []
    for asset_rn in created_assets:
        ca_op = client.get_type("CampaignAssetOperation")
        campaign_asset = ca_op.create
        campaign_asset.asset = asset_rn
        campaign_asset.field_type = client.enums.AssetFieldTypeEnum.SITELINK
        campaign_asset.campaign = client.get_service("GoogleAdsService").campaign_path(customer_id, campaign_id)
        campaign_asset_ops.append(ca_op)

    if campaign_asset_ops:
        campaign_asset_service.mutate_campaign_assets(
            customer_id=customer_id, operations=campaign_asset_ops
        )


def add_callouts(client: GoogleAdsClient, customer_id: str, campaign_id: str):
    callouts = [
        "24/7 RON Available",
        "Same-Day Mobile*",
        "Evenings & Weekends",
        "Upfront Pricing",
        "Tiered Travel Fees",
        "E&O Insured $100k",
        "Secure Stripe Pay",
        "SMS/Email Reminders",
        "Proof.com RON Ready",
        "Fast Online Booking",
    ]

    asset_service = client.get_service("AssetService")
    operations = []
    for text in callouts:
        op = client.get_type("AssetOperation")
        asset = op.create
        asset.callout_asset.callout_text = text
        operations.append(op)

    resp = asset_service.mutate_assets(customer_id=customer_id, operations=operations)
    asset_rns = [r.resource_name for r in resp.results]

    campaign_asset_service = client.get_service("CampaignAssetService")
    campaign_ops = []
    for rn in asset_rns:
        op = client.get_type("CampaignAssetOperation")
        ca = op.create
        ca.asset = rn
        ca.field_type = client.enums.AssetFieldTypeEnum.CALLOUT
        ca.campaign = client.get_service("GoogleAdsService").campaign_path(customer_id, campaign_id)
        campaign_ops.append(op)

    if campaign_ops:
        campaign_asset_service.mutate_campaign_assets(customer_id=customer_id, operations=campaign_ops)


def add_structured_snippet(client: GoogleAdsClient, customer_id: str, campaign_id: str):
    values = [
        "Standard Mobile Notary",
        "Extended Hours Mobile",
        "Loan Signing Specialist",
        "Remote Online Notarization (RON)",
        "Business Subscription — Essentials",
        "Business Subscription — Growth",
        "Same-Day Mobile Appointments",
        "Evening & Weekend Mobile",
    ]

    asset_service = client.get_service("AssetService")
    op = client.get_type("AssetOperation")
    asset = op.create
    ss = asset.structured_snippet_asset
    ss.header = client.enums.StructuredSnippetAssetHeaderEnum.SERVICES
    ss.values.extend(values)
    resp = asset_service.mutate_assets(customer_id=customer_id, operations=[op])
    asset_rn = resp.results[0].resource_name

    campaign_asset_service = client.get_service("CampaignAssetService")
    ca_op = client.get_type("CampaignAssetOperation")
    ca = ca_op.create
    ca.asset = asset_rn
    ca.field_type = client.enums.AssetFieldTypeEnum.STRUCTURED_SNIPPET
    ca.campaign = client.get_service("GoogleAdsService").campaign_path(customer_id, campaign_id)
    campaign_asset_service.mutate_campaign_assets(customer_id=customer_id, operations=[ca_op])


def add_price_extension(client: GoogleAdsClient, customer_id: str, campaign_id: str, base_url: str):
    asset_service = client.get_service("AssetService")
    money_type = client.get_type("Money")

    price_items = [
        {"label": "Standard Mobile Notary", "price": 75.0, "url": f"{base_url}/booking/enhanced"},
        {"label": "Extended Hours Mobile", "price": 125.0, "url": f"{base_url}/booking/enhanced"},
        {"label": "Loan Signing Specialist", "price": 175.0, "url": f"{base_url}/booking/enhanced"},
        {"label": "Remote Online Notarization", "price": 35.0, "url": f"{base_url}/ron/dashboard"},
        {"label": "Priority/Same-Day Add-On", "price": 25.0, "url": f"{base_url}/booking/enhanced"},
    ]

    op = client.get_type("AssetOperation")
    asset = op.create
    pa = asset.price_asset
    pa.type_ = client.enums.PriceExtensionTypeEnum.SERVICES
    pa.price_qualifier = client.enums.PriceExtensionPriceQualifierEnum.NONE
    pa.language_code = "en"

    for item in price_items:
        offering = client.get_type("PriceOffering")
        offering.header = item["label"]
        offering.final_urls.append(item["url"])  # type: ignore[attr-defined]
        offering.unit = client.enums.PriceExtensionPriceUnitEnum.NONE
        offering.price.amount_micros = micros_from_dollars(item["price"])  # type: ignore[attr-defined]
        offering.price.currency_code = "USD"  # type: ignore[attr-defined]
        pa.price_offerings.append(offering)

    resp = asset_service.mutate_assets(customer_id=customer_id, operations=[op])
    asset_rn = resp.results[0].resource_name

    campaign_asset_service = client.get_service("CampaignAssetService")
    ca_op = client.get_type("CampaignAssetOperation")
    ca = ca_op.create
    ca.asset = asset_rn
    ca.field_type = client.enums.AssetFieldTypeEnum.PRICE
    ca.campaign = client.get_service("GoogleAdsService").campaign_path(customer_id, campaign_id)
    campaign_asset_service.mutate_campaign_assets(customer_id=customer_id, operations=[ca_op])


def add_promo_extension(client: GoogleAdsClient, customer_id: str, campaign_id: str):
    # Promo: First-time Client — $15 Off, Aug 23, 2025 → Sep 30, 2025, code HMNP15
    asset_service = client.get_service("AssetService")
    op = client.get_type("AssetOperation")
    asset = op.create
    promo = asset.promotion_asset

    promo.promotion_target = "First-time Client"
    promo.money_amount_off.amount_micros = micros_from_dollars(15.0)
    promo.money_amount_off.currency_code = "USD"
    promo.promotion_code = "HMNP15"
    promo.start_date = "2025-08-23"
    promo.end_date = "2025-09-30"

    resp = asset_service.mutate_assets(customer_id=customer_id, operations=[op])
    asset_rn = resp.results[0].resource_name

    campaign_asset_service = client.get_service("CampaignAssetService")
    ca_op = client.get_type("CampaignAssetOperation")
    ca = ca_op.create
    ca.asset = asset_rn
    ca.field_type = client.enums.AssetFieldTypeEnum.PROMOTION
    ca.campaign = client.get_service("GoogleAdsService").campaign_path(customer_id, campaign_id)
    campaign_asset_service.mutate_campaign_assets(customer_id=customer_id, operations=[ca_op])


def main():
    parser = argparse.ArgumentParser(description="Add Google Ads extensions to a campaign")
    parser.add_argument("--customer-id", required=True, help="Customer ID without dashes")
    parser.add_argument("--campaign-id", required=True, help="Campaign ID")
    parser.add_argument("--base-url", required=True, help="Base site URL, e.g. https://example.com")
    parser.add_argument("--config", default="google-ads.yaml", help="Path to google-ads.yaml")

    args = parser.parse_args()

    client = GoogleAdsClient.load_from_storage(path=args.config)

    add_sitelinks(client, args.customer_id, args.campaign_id, args.base_url)
    add_callouts(client, args.customer_id, args.campaign_id)
    add_structured_snippet(client, args.customer_id, args.campaign_id)
    add_price_extension(client, args.customer_id, args.campaign_id, args.base_url)
    add_promo_extension(client, args.customer_id, args.campaign_id)

    print("Extensions added and associated with campaign", args.campaign_id)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Error adding extensions: {e}", file=sys.stderr)
        sys.exit(1)


