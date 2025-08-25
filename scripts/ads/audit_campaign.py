#!/usr/bin/env python3
"""
Audit Google Ads account configuration: campaigns, budgets, bidding, geo, schedules,
ad groups, keywords/negatives, ads (RSA), and conversion action status.

Usage:
  python3 scripts/ads/audit_campaign.py --customer-id 5072649468 --config /abs/path/google-ads.yaml
"""

from __future__ import annotations

import argparse
from typing import Optional

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException


def run_query(client: GoogleAdsClient, customer_id: str, query: str):
    service = client.get_service("GoogleAdsService")
    return service.search(customer_id=customer_id, query=query)


def print_header(title: str) -> None:
    print("\n" + "=" * 80)
    print(title)
    print("=" * 80)


def audit_campaigns(client: GoogleAdsClient, customer_id: str) -> None:
    print_header("Campaigns Overview")
    query = (
        "SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type, "
        "campaign.bidding_strategy_type, campaign.campaign_budget, campaign.start_date, campaign.end_date "
        "FROM campaign ORDER BY campaign.name"
    )
    for row in run_query(client, customer_id, query):
        c = row.campaign
        print(f"- {c.name} (ID {c.id}) | Status={c.status.name} | Channel={c.advertising_channel_type.name} | Bidding={c.bidding_strategy_type.name}")
        print(f"  Budget resource: {c.campaign_budget} | Dates: {c.start_date} → {c.end_date or '-'}")


def audit_budgets(client: GoogleAdsClient, customer_id: str) -> None:
    print_header("Budgets")
    query = (
        "SELECT campaign_budget.resource_name, campaign_budget.name, campaign_budget.amount_micros, "
        "campaign_budget.delivery_method, campaign_budget.explicitly_shared "
        "FROM campaign_budget ORDER BY campaign_budget.name"
    )
    for row in run_query(client, customer_id, query):
        b = row.campaign_budget
        print(f"- {b.name} | amount_micros={b.amount_micros} | delivery={b.delivery_method.name} | shared={b.explicitly_shared}")


def audit_geo_and_schedule(client: GoogleAdsClient, customer_id: str) -> None:
    print_header("Geo & Ad Schedule (Campaign Criteria)")
    query = (
        "SELECT campaign.name, campaign.id, campaign_criterion.type, campaign_criterion.negative, "
        "campaign_criterion.location.geo_target_constant, campaign_criterion.proximity.address.postal_code, "
        "campaign_criterion.proximity.address.country_code, campaign_criterion.proximity.radius, campaign_criterion.proximity.radius_units, "
        "campaign_criterion.ad_schedule.day_of_week, campaign_criterion.ad_schedule.start_hour, campaign_criterion.ad_schedule.end_hour "
        "FROM campaign_criterion "
        "WHERE campaign_criterion.type IN (LOCATION, PROXIMITY, AD_SCHEDULE) "
        "ORDER BY campaign.name"
    )
    for row in run_query(client, customer_id, query):
        c = row.campaign
        cc = row.campaign_criterion
        if cc.type_.name == "LOCATION":
            print(f"- {c.name} | LOCATION include | geo_target={cc.location.geo_target_constant}")
        elif cc.type_.name == "PROXIMITY":
            prox = cc.proximity
            print(
                f"- {c.name} | PROXIMITY include | {prox.address.postal_code},{prox.address.country_code} radius={prox.radius} {prox.radius_units.name}"
            )
        elif cc.type_.name == "AD_SCHEDULE":
            sch = cc.ad_schedule
            print(f"- {c.name} | SCHEDULE {sch.day_of_week.name} {sch.start_hour}:00–{sch.end_hour}:00")


def audit_adgroups_keywords_ads(client: GoogleAdsClient, customer_id: str) -> None:
    print_header("Ad Groups")
    q_ag = (
        "SELECT campaign.name, ad_group.id, ad_group.name, ad_group.status "
        "FROM ad_group ORDER BY campaign.name, ad_group.name"
    )
    for row in run_query(client, customer_id, q_ag):
        print(f"- {row.campaign.name} › {row.ad_group.name} (ID {row.ad_group.id}) | {row.ad_group.status.name}")

    print_header("Keywords (non-negative)")
    q_kw = (
        "SELECT campaign.name, ad_group.name, ad_group_criterion.criterion_id, ad_group_criterion.status, "
        "ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type "
        "FROM ad_group_criterion "
        "WHERE ad_group_criterion.type = KEYWORD AND ad_group_criterion.negative = FALSE "
        "ORDER BY campaign.name, ad_group.name"
    )
    cnt = 0
    for row in run_query(client, customer_id, q_kw):
        cnt += 1
        print(f"- {row.campaign.name} › {row.ad_group.name} | [{row.ad_group_criterion.keyword.match_type.name}] {row.ad_group_criterion.keyword.text}")
    print(f"Total keywords: {cnt}")

    print_header("Campaign Negatives")
    q_neg = (
        "SELECT campaign.name, campaign_criterion.criterion_id, campaign_criterion.negative, "
        "campaign_criterion.keyword.text, campaign_criterion.keyword.match_type "
        "FROM campaign_criterion "
        "WHERE campaign_criterion.negative = TRUE "
        "ORDER BY campaign.name"
    )
    ncnt = 0
    for row in run_query(client, customer_id, q_neg):
        ncnt += 1
        print(f"- {row.campaign.name} | NEG [{row.campaign_criterion.keyword.match_type.name}] {row.campaign_criterion.keyword.text}")
    print(f"Total negatives: {ncnt}")

    print_header("Ads (RSA)")
    q_ads = (
        "SELECT campaign.name, ad_group.name, ad_group_ad.ad.type, ad_group_ad.status, ad_group_ad.ad.id "
        "FROM ad_group_ad ORDER BY campaign.name, ad_group.name"
    )
    acnt = 0
    for row in run_query(client, customer_id, q_ads):
        acnt += 1
        print(f"- {row.campaign.name} › {row.ad_group.name} | {row.ad_group_ad.ad.type.name} | {row.ad_group_ad.status.name}")
    print(f"Total ads: {acnt}")


def audit_conversions(client: GoogleAdsClient, customer_id: str) -> None:
    print_header("Conversion Actions")
    q = (
        "SELECT conversion_action.id, conversion_action.name, conversion_action.status, conversion_action.primary_for_goal, "
        "conversion_action.category, conversion_action.value_settings.default_value, conversion_action.type "
        "FROM conversion_action ORDER BY conversion_action.name"
    )
    for row in run_query(client, customer_id, q):
        ca = row.conversion_action
        print(
            f"- {ca.name} (ID {ca.id}) | {ca.status.name} | primary={ca.primary_for_goal} | cat={ca.category.name} | type={ca.type.name} | default_value={ca.value_settings.default_value}"
        )


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Audit Google Ads account setup")
    parser.add_argument("--customer-id", required=True)
    parser.add_argument("--config", default=None)
    args = parser.parse_args(argv)

    try:
        client = GoogleAdsClient.load_from_storage(path=args.config) if args.config else GoogleAdsClient.load_from_storage()
        audit_campaigns(client, args.customer_id)
        audit_budgets(client, args.customer_id)
        audit_geo_and_schedule(client, args.customer_id)
        audit_adgroups_keywords_ads(client, args.customer_id)
        audit_conversions(client, args.customer_id)
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


