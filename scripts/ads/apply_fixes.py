#!/usr/bin/env python3
"""
Apply targeted fixes to the active campaign:
- Remove LOCATION includes and keep PROXIMITY radius
- Ensure budget = $25/day (25,000,000 micros)
- Add a second RSA to the enabled ad group (if fewer than 2 RSAs enabled)
- Mark GA4 custom "Book appointment ..." as Secondary (exclude from Conversions)

Usage:
  python3 scripts/ads/apply_fixes.py --customer-id 5072649468 --config /abs/path/google-ads.yaml
"""

from __future__ import annotations

import argparse
from typing import Optional, List

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from google.protobuf.field_mask_pb2 import FieldMask


ACTIVE_CAMPAIGN_NAME_HINT = "HMNP – Mobile – 77591 Radius"
BUDGET_MICROS_TARGET = 25_000_000


def run_query(client: GoogleAdsClient, customer_id: str, query: str):
    svc = client.get_service("GoogleAdsService")
    return svc.search(customer_id=customer_id, query=query)


def find_active_campaign(client: GoogleAdsClient, customer_id: str) -> Optional[str]:
    # Prefer exact name match, else first ENABLED Search campaign
    q = (
        "SELECT campaign.resource_name, campaign.name, campaign.status, campaign.advertising_channel_type, campaign.campaign_budget "
        "FROM campaign ORDER BY campaign.status DESC"
    )
    candidate = None
    for row in run_query(client, customer_id, q):
        if row.campaign.name == ACTIVE_CAMPAIGN_NAME_HINT:
            return row.campaign.resource_name
        if row.campaign.status.name == "ENABLED" and row.campaign.advertising_channel_type.name == "SEARCH" and not candidate:
            candidate = row.campaign.resource_name
    return candidate


def remove_location_includes_keep_radius(client: GoogleAdsClient, customer_id: str, campaign_res: str) -> None:
    q = (
        "SELECT campaign_criterion.resource_name, campaign_criterion.type, campaign_criterion.location.geo_target_constant, "
        "campaign_criterion.proximity.address.postal_code FROM campaign_criterion "
        f"WHERE campaign_criterion.campaign = '{campaign_res}'"
    )
    to_remove: List[str] = []
    for row in run_query(client, customer_id, q):
        cc = row.campaign_criterion
        t = cc.type_.name
        if t == "LOCATION":
            to_remove.append(cc.resource_name)
    if not to_remove:
        return
    ops = []
    for rn in to_remove:
        op = client.get_type("CampaignCriterionOperation")
        op.remove = rn
        ops.append(op)
    svc = client.get_service("CampaignCriterionService")
    svc.mutate_campaign_criteria(customer_id=customer_id, operations=ops)


def ensure_budget_amount(client: GoogleAdsClient, customer_id: str, campaign_res: str, micros: int) -> None:
    # Fetch campaign to get budget
    q = (
        "SELECT campaign.campaign_budget FROM campaign WHERE campaign.resource_name = '"
        + campaign_res + "' LIMIT 1"
    )
    budget_res = None
    for row in run_query(client, customer_id, q):
        budget_res = row.campaign.campaign_budget
    if not budget_res:
        return
    budget_svc = client.get_service("CampaignBudgetService")
    op = client.get_type("CampaignBudgetOperation")
    budget = op.update
    budget.resource_name = budget_res
    budget.amount_micros = micros
    mask = FieldMask()
    mask.paths.append("amount_micros")
    op.update_mask.CopyFrom(mask)
    budget_svc.mutate_campaign_budgets(customer_id=customer_id, operations=[op])


def add_second_rsa_if_needed(client: GoogleAdsClient, customer_id: str, campaign_res: str, final_url: str) -> None:
    # Find an enabled ad group in this campaign
    q_ag = (
        "SELECT ad_group.resource_name, ad_group.name, ad_group.status FROM ad_group "
        f"WHERE ad_group.campaign = '{campaign_res}' ORDER BY ad_group.name"
    )
    ag_res = None
    for row in run_query(client, customer_id, q_ag):
        if row.ad_group.status.name in ("ENABLED", "PAUSED") and not ag_res:
            ag_res = row.ad_group.resource_name
    if not ag_res:
        return
    # Count enabled RSAs
    q_ads = (
        "SELECT ad_group_ad.resource_name, ad_group_ad.status, ad_group_ad.ad.type FROM ad_group_ad "
        f"WHERE ad_group_ad.ad_group = '{ag_res}'"
    )
    enabled_rsas = 0
    for row in run_query(client, customer_id, q_ads):
        if row.ad_group_ad.ad.type.name == "RESPONSIVE_SEARCH_AD" and row.ad_group_ad.status.name == "ENABLED":
            enabled_rsas += 1
    if enabled_rsas >= 2:
        return
    # Create another RSA
    aga_svc = client.get_service("AdGroupAdService")
    op = client.get_type("AdGroupAdOperation")
    aga = op.create
    aga.ad_group = ag_res
    aga.status = client.enums.AdGroupAdStatusEnum.ENABLED
    ad = aga.ad
    ad.final_urls.append(final_url)
    headlines = [
        "24/7 Mobile Notary",
        "Same‑Day Appointments",
        "Certified RON Available",
        "We Come To You",
        "Fast, Professional Service",
        "Licensed & Insured",
        "Loan Signings & Closings",
        "Emergency Notary Near You",
        "Transparent Pricing",
        "Book In Minutes",
    ]
    descriptions = [
        "Houston‑area mobile notary. Book same‑day. Reliable and compliant.",
        "Loan signings, POA, affidavits. On‑site or online. Get a quote now.",
    ]
    for h in headlines[:10]:
        a = client.get_type("AdTextAsset")
        a.text = h
        ad.responsive_search_ad.headlines.append(a)
    for d in descriptions[:2]:
        a = client.get_type("AdTextAsset")
        a.text = d
        ad.responsive_search_ad.descriptions.append(a)
    aga_svc.mutate_ad_group_ads(customer_id=customer_id, operations=[op])


def demote_ga4_custom_book_appointment(client: GoogleAdsClient, customer_id: str) -> None:
    q = (
        "SELECT conversion_action.resource_name, conversion_action.name, conversion_action.include_in_conversions_metric, conversion_action.primary_for_goal "
        "FROM conversion_action ORDER BY conversion_action.name"
    )
    ops = []
    ca_svc = client.get_service("ConversionActionService")
    for row in run_query(client, customer_id, q):
        name = row.conversion_action.name
        rn = row.conversion_action.resource_name
        if name.startswith("Book appointment (Google Analytics event"):
            op = client.get_type("ConversionActionOperation")
            upd = op.update
            upd.resource_name = rn
            upd.primary_for_goal = False
            mask = FieldMask()
            mask.paths.extend(["primary_for_goal"])
            op.update_mask.CopyFrom(mask)
            ops.append(op)
        elif name == "Book appointment (Web)":
            # Ensure primary
            if not row.conversion_action.primary_for_goal:
                op = client.get_type("ConversionActionOperation")
                upd = op.update
                upd.resource_name = rn
                upd.primary_for_goal = True
                mask = FieldMask()
                mask.paths.extend(["primary_for_goal"])
                op.update_mask.CopyFrom(mask)
                ops.append(op)
    if ops:
        ca_svc.mutate_conversion_actions(customer_id=customer_id, operations=ops)


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Apply campaign fixes")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--config", default=None)
    p.add_argument("--final-url", default="https://houstonmobilenotarypros.com")
    args = p.parse_args(argv)

    try:
        client = GoogleAdsClient.load_from_storage(path=args.config) if args.config else GoogleAdsClient.load_from_storage()
        campaign_res = find_active_campaign(client, args.customer_id)
        if not campaign_res:
            print("No active Search campaign found.")
            return 0
        remove_location_includes_keep_radius(client, args.customer_id, campaign_res)
        ensure_budget_amount(client, args.customer_id, campaign_res, BUDGET_MICROS_TARGET)
        add_second_rsa_if_needed(client, args.customer_id, campaign_res, args.final_url)
        demote_ga4_custom_book_appointment(client, args.customer_id)
        print("Fixes applied.")
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


