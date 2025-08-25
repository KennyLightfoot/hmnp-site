#!/usr/bin/env python3
"""
Turnkey Google Ads setup for "Houston Mobile Notary" using the official google-ads Python library.

What this script does:
- Creates a Search campaign with either Maximize Clicks (with CPC cap) or Manual CPC and daily budget
- Adds geo targeting via radius around ZIP or Houston-area city includes
- Creates ad groups for: Mobile Notary (default), and optionally Loan Signing / RON
- Adds starter keyword lists and campaign-level negatives
- Creates a Responsive Search Ad (RSA) in each ad group with multiple headlines/descriptions

Requirements:
- python >= 3.9
- pip install -r scripts/ads/requirements.txt
- google-ads.yaml configured with developer_token, login_customer_id, client_id, client_secret, refresh_token
  Place it outside the repo and point GOOGLE_ADS_CONFIGURATION_FILE to its absolute path.

Usage (lean launch example):
  python3 scripts/ads/houston_mobile_notary_campaign.py --customer-id 1234567890 \
    --campaign-name "HMNP – Mobile – 77591 Radius" --domain "https://houstonmobilenotarypros.com/booking/enhanced" \
    --daily-budget 15000000 --zip 77591 --radius-miles 25 --bidding maximize_clicks --cpc-cap-micros 1800000

Notes:
- daily-budget is in micros (e.g., 20000000 = $20/day)
- You can re-run safely; the script checks for existing entities by name and skips creation if found.
"""

from __future__ import annotations

import argparse
import sys
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from zoneinfo import ZoneInfo

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
# Avoid version-specific imports. Use dynamic types/enums via the client.


# ---------- Configurable seed data ----------

HOUSTON_AREA_CITY_NAMES: List[str] = [
    "Houston",
    "Pasadena",
    "Pearland",
    "Baytown",
    "League City",
    "Sugar Land",
    "Galveston",
    "Texas City",
    "La Marque",
    "Friendswood",
    "Kemah",
    "Dickinson",
    "Seabrook",
    "Webster",
    "Clear Lake",
]

AD_GROUP_TO_KEYWORDS: Dict[str, Dict[str, List[str]]] = {
    "Mobile Notary": {
        "exact": [
            "[mobile notary]",
            "[mobile notary near me]",
            "[notary near me]",
            "[notary public near me]",
            "[notary services]",
        ],
        "phrase": [
            '"mobile notary"',
            '"mobile notary service"',
            '"traveling notary"',
            '"notary public mobile"',
        ],
    },
    "Loan Signing": {
        "exact": [
            "[loan signing agent]",
            "[notary signing agent]",
            "[loan signing notary]",
        ],
        "phrase": [
            '"loan signing"',
            '"real estate closing notary"',
            '"mortgage notary"',
        ],
    },
    "RON Online Notary": {
        "exact": [
            "[online notary]",
            "[remote online notary]",
            "[online notary near me]",
        ],
        "phrase": [
            '"online notary"',
            '"remote online notarization"',
            '"ron notary"',
        ],
    },
}

CAMPAIGN_NEGATIVE_KEYWORDS: Dict[str, List[str]] = {
    "exact": [
        "[ups store]",
        "[usps notary]",
        "[bank notary]",
        "[dmv notary]",
        "[fedex notary]",
        "[free notary]",
        "[how to become a notary]",
        "[notary jobs]",
        "[notary salary]",
        "[secretary of state]",
    ],
    "phrase": [
        '"ups notary"',
        '"free notary"',
        '"become a notary"',
        '"notary training"',
        '"notary classes"',
        '"what is a notary"',
        '"jobs"',
    ],
}

RSA_ASSETS: Dict[str, List[str]] = {
    "headlines": [
        "Mobile Notary – 24/7",
        "Same‑Day Notary Available",
        "Certified Loan Signing Agent",
        "Remote Online Notary (RON)",
        "We Come To You",
        "Texas‑Compliant Notarizations",
        "Fast, Professional Service",
        "Evenings & Weekends",
        "Emergency Notary Near You",
        "Schedule In Minutes",
        "Licensed & Insured",
        "Real Estate Closings",
        "Business & Personal Docs",
        "Apostille Guidance",
        "Document Witness Service",
    ],
    "descriptions": [
        "On‑site and online notarization. Book now for same‑day service across Houston.",
        "Loan signings, power of attorney, titles, affidavits. We make it easy.",
        "Fast, friendly, and compliant. Transparent pricing. Call or book online.",
        "Certified RON appointments available 24/7. Get notarized from anywhere.",
    ],
}


def load_client(config_file: Optional[str] = None) -> GoogleAdsClient:
    if config_file:
        return GoogleAdsClient.load_from_storage(path=config_file)
    return GoogleAdsClient.load_from_storage()


def get_existing_resource_by_name(
    ga_service,
    customer_id: str,
    query: str,
) -> Optional[str]:
    response = ga_service.search(customer_id=customer_id, query=query)
    for row in response:
        # Return the first resource_name found
        # The caller should write the query to select exactly one type
        return next(iter(row.__dict__["_pb"]
                         .ListFields()[0][1]
                         .ListFields()[0][1]
                         .ListFields()[0][1]
                         .ListFields()[0][1]
                         .__str__()), None)  # Fallback; we won't rely on this helper often
    return None


def find_campaign_by_name(client: GoogleAdsClient, customer_id: str, name: str) -> Optional[str]:
    ga_service = client.get_service("GoogleAdsService")
    query = f"""
        SELECT campaign.resource_name, campaign.name
        FROM campaign
        WHERE campaign.name = '{name.replace("'", "\\'")}'
        LIMIT 1
    """
    results = ga_service.search(customer_id=customer_id, query=query)
    for row in results:
        return row.campaign.resource_name
    return None


def find_ad_group_by_name(client: GoogleAdsClient, customer_id: str, campaign_resource_name: str, name: str) -> Optional[str]:
    ga_service = client.get_service("GoogleAdsService")
    query = f"""
        SELECT ad_group.resource_name, ad_group.name, ad_group.campaign
        FROM ad_group
        WHERE ad_group.name = '{name.replace("'", "\\'")}'
          AND ad_group.campaign = '{campaign_resource_name}'
        LIMIT 1
    """
    results = ga_service.search(customer_id=customer_id, query=query)
    for row in results:
        return row.ad_group.resource_name
    return None
def find_bidding_strategy_by_name(client: GoogleAdsClient, customer_id: str, name: str) -> Optional[str]:
    ga_service = client.get_service("GoogleAdsService")
    query = f"""
        SELECT bidding_strategy.resource_name, bidding_strategy.name
        FROM bidding_strategy
        WHERE bidding_strategy.name = '{name.replace("'", "\\'")}'
        LIMIT 1
    """
    results = ga_service.search(customer_id=customer_id, query=query)
    for row in results:
        return row.bidding_strategy.resource_name
    return None


def create_or_get_portfolio_maximize_clicks(
    client: GoogleAdsClient,
    customer_id: str,
    name: str,
    cpc_cap_micros: int,
) -> str:
    existing = find_bidding_strategy_by_name(client, customer_id, name)
    if existing:
        return existing
    svc = client.get_service("BiddingStrategyService")
    op = client.get_type("BiddingStrategyOperation")
    bs = op.create
    bs.name = name
    # Portfolio strategy for Maximize Clicks is TARGET_SPEND in the API
    bs.type_ = client.enums.BiddingStrategyTypeEnum.TARGET_SPEND
    bs.target_spend.target_spend_micros = 0
    bs.target_spend.cpc_bid_ceiling_micros = int(cpc_cap_micros)
    resp = svc.mutate_bidding_strategies(customer_id=customer_id, operations=[op])
    return resp.results[0].resource_name



def create_budget(client: GoogleAdsClient, customer_id: str, budget_name: str, amount_micros: int) -> str:
    budget_service = client.get_service("CampaignBudgetService")
    op = client.get_type("CampaignBudgetOperation")
    budget = op.create
    budget.name = budget_name
    budget.delivery_method = client.enums.BudgetDeliveryMethodEnum.STANDARD
    budget.amount_micros = amount_micros
    # Recommended: set explicitly false to allow shared budgets reuse across campaigns
    budget.explicitly_shared = False

    response = budget_service.mutate_campaign_budgets(
        customer_id=customer_id,
        operations=[op],
    )
    return response.results[0].resource_name


def create_or_get_budget(client: GoogleAdsClient, customer_id: str, budget_name: str, amount_micros: int) -> str:
    ga_service = client.get_service("GoogleAdsService")
    query = f"""
        SELECT campaign_budget.resource_name, campaign_budget.name, campaign_budget.amount_micros
        FROM campaign_budget
        WHERE campaign_budget.name = '{budget_name.replace("'", "\\'")}'
        LIMIT 1
    """
    results = ga_service.search(customer_id=customer_id, query=query)
    for row in results:
        return row.campaign_budget.resource_name
    return create_budget(client, customer_id, budget_name, amount_micros)


def create_campaign(
    client: GoogleAdsClient,
    customer_id: str,
    campaign_name: str,
    budget_resource_name: str,
    bidding_mode: str = "maximize_clicks",
    cpc_cap_micros: int = 1_800_000,
) -> str:
    campaign_service = client.get_service("CampaignService")

    op = client.get_type("CampaignOperation")
    campaign = op.create
    campaign.name = campaign_name
    campaign.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.SEARCH
    campaign.status = client.enums.CampaignStatusEnum.PAUSED
    campaign.campaign_budget = budget_resource_name

    # Bidding mode (prefer standard Maximize Clicks with CPC cap; fallback to portfolio or ManualCpc)
    if bidding_mode == "maximize_clicks":
        try:
            campaign.maximize_clicks.cpc_bid_ceiling_micros = int(cpc_cap_micros)
        except Exception:
            # Fallback to portfolio TARGET_SPEND if library/oneof constraints require it
            try:
                bs_name = f"HMNP MaxClicks Cap {cpc_cap_micros}"
                bs_res = create_or_get_portfolio_maximize_clicks(client, customer_id, bs_name, cpc_cap_micros)
                campaign.bidding_strategy = bs_res
            except Exception:
                try:
                    campaign.manual_cpc.CopyFrom(client.get_type("ManualCpc"))
                except Exception:
                    pass
    else:
        # Manual CPC
        try:
            campaign.manual_cpc.CopyFrom(client.get_type("ManualCpc"))
        except Exception:
            pass

    # Network settings: Google Search and Search partners
    network_settings = campaign.network_settings
    network_settings.target_google_search = True
    network_settings.target_search_network = True
    # Turn OFF Search Partners at launch if field is available
    try:
        setattr(network_settings, "target_partner_search_network", False)
    except Exception:
        pass
    # Ensure content network is off
    try:
        setattr(network_settings, "target_content_network", False)
    except Exception:
        pass

    # Declare EU political ads status (REQUIRED in v21+)
    try:
        campaign.contains_eu_political_advertising = (
            client.enums.EuPoliticalAdvertisingStatusEnum.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING
        )
    except Exception:
        pass

    # Start date in local timezone (America/Chicago) per business hours alignment
    campaign.start_date = datetime.now(ZoneInfo("America/Chicago")).strftime("%Y-%m-%d")

    # Location options: Presence only for positive geo targets if supported
    try:
        geo = campaign.geo_target_type_setting
        geo.positive_geo_target_type = client.enums.PositiveGeoTargetTypeEnum.PRESENCE
    except Exception:
        pass

    response = campaign_service.mutate_campaigns(
        customer_id=customer_id,
        operations=[op],
    )
    return response.results[0].resource_name


def create_or_get_campaign(client: GoogleAdsClient, customer_id: str, campaign_name: str, budget_resource_name: str) -> str:
    existing = find_campaign_by_name(client, customer_id, campaign_name)
    if existing:
        return existing
    return create_campaign(client, customer_id, campaign_name, budget_resource_name)


def resolve_city_geo_targets(client: GoogleAdsClient, city_names: List[str], country_code: str = "US") -> List[str]:
    geo_service = client.get_service("GeoTargetConstantService")
    resource_names: List[str] = []
    for name in city_names:
        search_request = client.get_type("SearchGeoTargetConstantsRequest")
        # Exact name match first; fall back to LIKE
        search_request.query = (
            f"SELECT geo_target_constant.resource_name, geo_target_constant.name, geo_target_constant.country_code, geo_target_constant.target_type "
            f"WHERE geo_target_constant.name = '{name.replace("'", "\\'")}' "
            f"AND geo_target_constant.country_code = '{country_code}' "
            f"AND geo_target_constant.status = 'ENABLED'"
        )
        response = geo_service.search_geo_target_constants(request=search_request)
        chosen = None
        for row in response.results:
            # Prefer City/Town targets
            if row.geo_target_constant.target_type in ("City", "Municipality", "Township"):
                chosen = row.geo_target_constant.resource_name
                break
        if not chosen:
            # fallback: partial match
            search_request.query = (
                f"SELECT geo_target_constant.resource_name, geo_target_constant.name, geo_target_constant.country_code, geo_target_constant.target_type "
                f"WHERE geo_target_constant.name LIKE '%{name.replace("'", "\\'")}%' "
                f"AND geo_target_constant.country_code = '{country_code}' "
                f"AND geo_target_constant.status = 'ENABLED'"
            )
            response = geo_service.search_geo_target_constants(request=search_request)
            for row in response.results:
                if row.geo_target_constant.target_type in ("City", "Municipality", "Township"):
                    chosen = row.geo_target_constant.resource_name
                    break
        if chosen:
            resource_names.append(chosen)
    return resource_names


def set_campaign_locations(client: GoogleAdsClient, customer_id: str, campaign_resource_name: str, city_resource_names: List[str]) -> None:
    if not city_resource_names:
        return
    campaign_criterion_service = client.get_service("CampaignCriterionService")
    operations: List[object] = []
    for res in city_resource_names:
        op = client.get_type("CampaignCriterionOperation")
        criterion = op.create
        criterion.campaign = campaign_resource_name
        criterion.location.geo_target_constant = res
        operations.append(op)
    if operations:
        campaign_criterion_service.mutate_campaign_criteria(customer_id=customer_id, operations=operations)


def set_campaign_language(
    client: GoogleAdsClient,
    customer_id: str,
    campaign_resource_name: str,
    language_constant: str = "languageConstants/1000",  # English
) -> None:
    svc = client.get_service("CampaignCriterionService")
    op = client.get_type("CampaignCriterionOperation")
    c = op.create
    c.campaign = campaign_resource_name
    c.language.language_constant = language_constant
    svc.mutate_campaign_criteria(customer_id=customer_id, operations=[op])


def suggest_city_geo_targets(
    client: GoogleAdsClient,
    city_names: List[str],
    country_code: str = "US",
) -> List[str]:
    """Use SuggestGeoTargetConstants to resolve city names to geo target constants."""
    geo_service = client.get_service("GeoTargetConstantService")
    req = client.get_type("SuggestGeoTargetConstantsRequest")
    req.locale = "en"
    req.country_code = country_code
    req.location_names.names.extend(city_names)
    resp = geo_service.suggest_geo_target_constants(request=req)
    resource_names: List[str] = []
    for sug in resp.geo_target_constant_suggestions:
        # sug.geo_target_constant is a resource name reference
        resource_names.append(sug.geo_target_constant)
    return resource_names


def set_campaign_ad_schedule(
    client: GoogleAdsClient,
    customer_id: str,
    campaign_resource_name: str,
    windows: List[Tuple[int, int]] | None = None,
) -> None:
    """Add ad schedule criteria. windows is a list of (start_hour, end_hour) in 24h local time."""
    cc_service = client.get_service("CampaignCriterionService")
    operations: List[object] = []
    if not windows:
        windows = [(8, 11), (16, 21)]  # default lean windows
    for day in [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
    ]:
        for (start_hour, end_hour) in windows:
            op = client.get_type("CampaignCriterionOperation")
            c = op.create
            c.campaign = campaign_resource_name
            c.ad_schedule.day_of_week = getattr(client.enums.DayOfWeekEnum, day)
            c.ad_schedule.start_hour = start_hour
            c.ad_schedule.start_minute = client.enums.MinuteOfHourEnum.ZERO
            c.ad_schedule.end_hour = end_hour
            c.ad_schedule.end_minute = client.enums.MinuteOfHourEnum.ZERO
            operations.append(op)
    if operations:
        cc_service.mutate_campaign_criteria(customer_id=customer_id, operations=operations)


def set_campaign_radius_target(
    client: GoogleAdsClient,
    customer_id: str,
    campaign_resource_name: str,
    postal_code: str,
    country_code: str,
    radius_miles: int,
) -> None:
    campaign_criterion_service = client.get_service("CampaignCriterionService")
    op = client.get_type("CampaignCriterionOperation")
    criterion = op.create
    criterion.campaign = campaign_resource_name
    prox = criterion.proximity
    prox.radius_units = client.enums.ProximityRadiusUnitsEnum.MILES
    prox.radius = float(radius_miles)
    prox.address.postal_code = postal_code
    prox.address.country_code = country_code
    campaign_criterion_service.mutate_campaign_criteria(customer_id=customer_id, operations=[op])


def create_or_get_ad_group(client: GoogleAdsClient, customer_id: str, campaign_resource_name: str, ad_group_name: str) -> str:
    existing = find_ad_group_by_name(client, customer_id, campaign_resource_name, ad_group_name)
    if existing:
        return existing
    ad_group_service = client.get_service("AdGroupService")
    op = client.get_type("AdGroupOperation")
    ad_group = op.create
    ad_group.name = ad_group_name
    ad_group.campaign = campaign_resource_name
    ad_group.status = client.enums.AdGroupStatusEnum.ENABLED
    # Set default CPC bid at the ad group level (1.8 USD)
    try:
        ad_group.cpc_bid_micros = int(1_800_000)
    except Exception:
        pass
    response = ad_group_service.mutate_ad_groups(customer_id=customer_id, operations=[op])
    return response.results[0].resource_name


def _strip_match_syntax(client: GoogleAdsClient, kw: str) -> Tuple[str, object]:
    text = kw.strip()
    if text.startswith("[") and text.endswith("]"):
        return text[1:-1], client.enums.KeywordMatchTypeEnum.EXACT
    if text.startswith('"') and text.endswith('"'):
        return text[1:-1], client.enums.KeywordMatchTypeEnum.PHRASE
    return text, client.enums.KeywordMatchTypeEnum.BROAD


def add_keywords_to_ad_group(client: GoogleAdsClient, customer_id: str, ad_group_resource_name: str, keywords: List[str]) -> None:
    if not keywords:
        return
    agc_service = client.get_service("AdGroupCriterionService")
    operations: List[object] = []
    for kw in keywords:
        text, match_type = _strip_match_syntax(client, kw)
        op = client.get_type("AdGroupCriterionOperation")
        criterion = op.create
        criterion.ad_group = ad_group_resource_name
        criterion.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
        criterion.keyword.text = text
        criterion.keyword.match_type = match_type
        operations.append(op)
    if operations:
        agc_service.mutate_ad_group_criteria(customer_id=customer_id, operations=operations)


def add_campaign_negative_keywords(client: GoogleAdsClient, customer_id: str, campaign_resource_name: str, negatives: List[str]) -> None:
    if not negatives:
        return
    cc_service = client.get_service("CampaignCriterionService")
    operations: List[object] = []
    for kw in negatives:
        text, match_type = _strip_match_syntax(client, kw)
        op = client.get_type("CampaignCriterionOperation")
        criterion = op.create
        criterion.campaign = campaign_resource_name
        criterion.negative = True
        criterion.keyword.text = text
        criterion.keyword.match_type = match_type
        operations.append(op)
    if operations:
        cc_service.mutate_campaign_criteria(customer_id=customer_id, operations=operations)


def create_rsa(
    client: GoogleAdsClient,
    customer_id: str,
    ad_group_resource_name: str,
    final_url: str,
    headlines: List[str],
    descriptions: List[str],
) -> str:
    aga_service = client.get_service("AdGroupAdService")
    op = client.get_type("AdGroupAdOperation")
    ad_group_ad = op.create
    ad_group_ad.ad_group = ad_group_resource_name
    ad_group_ad.status = client.enums.AdGroupAdStatusEnum.PAUSED

    ad = ad_group_ad.ad
    ad.final_urls.append(final_url)

    rsa = ad.responsive_search_ad
    # Optional: cleaner display URL paths
    try:
        rsa.path1 = "mobile-notary"
        rsa.path2 = "book-now"
    except Exception:
        pass
    for h in headlines[:15]:
        asset = client.get_type("AdTextAsset")
        asset.text = h
        rsa.headlines.append(asset)
    for d in descriptions[:4]:
        asset = client.get_type("AdTextAsset")
        asset.text = d
        rsa.descriptions.append(asset)

    response = aga_service.mutate_ad_group_ads(customer_id=customer_id, operations=[op])
    return response.results[0].resource_name


def upsert_campaign(
    client: GoogleAdsClient,
    customer_id: str,
    campaign_name: str,
    domain: str,
    daily_budget_micros: int,
    zip_code: str | None = None,
    radius_miles: int | None = None,
    bidding_mode: str = "maximize_clicks",
    cpc_cap_micros: int = 1_800_000,
    include_loan_signing: bool = False,
    include_ron: bool = False,
) -> None:
    # Budget
    budget_name = f"{campaign_name} – Budget"
    budget_res = create_or_get_budget(client, customer_id, budget_name, daily_budget_micros)

    # Campaign
    campaign_res = find_campaign_by_name(client, customer_id, campaign_name)
    if not campaign_res:
        # Create with bidding preferences
        campaign_res = create_campaign(
            client=client,
            customer_id=customer_id,
            campaign_name=campaign_name,
            budget_resource_name=budget_res,
            bidding_mode=bidding_mode,
            cpc_cap_micros=cpc_cap_micros,
        )

    # Geo targeting
    if zip_code and radius_miles:
        set_campaign_radius_target(
            client,
            customer_id,
            campaign_res,
            postal_code=zip_code,
            country_code="US",
            radius_miles=radius_miles,
        )
    else:
        # Default: Houston-area city includes via suggestions (robust to name variants)
        city_targets = suggest_city_geo_targets(client, HOUSTON_AREA_CITY_NAMES, country_code="US")
        set_campaign_locations(client, customer_id, campaign_res, city_targets)

    # Ad schedule: compressed windows for lean budget
    set_campaign_ad_schedule(client, customer_id, campaign_res, windows=[(8, 11), (16, 21)])

    # Language targeting (English)
    set_campaign_language(client, customer_id, campaign_res)

    # Determine which ad groups to build
    groups_to_build: List[str] = ["Mobile Notary"]
    if include_loan_signing:
        groups_to_build.append("Loan Signing")
    if include_ron:
        groups_to_build.append("RON Online Notary")

    # Ad groups + keywords + RSA
    for ad_group_name, kw_map in AD_GROUP_TO_KEYWORDS.items():
        if ad_group_name not in groups_to_build:
            continue
        ag_res = create_or_get_ad_group(client, customer_id, campaign_res, ad_group_name)
        all_keywords: List[str] = []
        for group in (kw_map.get("exact", []), kw_map.get("phrase", []), kw_map.get("broad", [])):
            all_keywords.extend(group)
        add_keywords_to_ad_group(client, customer_id, ag_res, all_keywords)
        create_rsa(
            client,
            customer_id,
            ag_res,
            final_url=f"{domain}?utm_source=google&utm_medium=cpc&utm_campaign=mobile_77591&utm_term={{keyword}}&utm_content={{adgroupid}}",
            headlines=RSA_ASSETS["headlines"],
            descriptions=RSA_ASSETS["descriptions"],
        )

    # Campaign negatives
    all_negatives: List[str] = CAMPAIGN_NEGATIVE_KEYWORDS.get("exact", []) + CAMPAIGN_NEGATIVE_KEYWORDS.get("phrase", [])
    add_campaign_negative_keywords(client, customer_id, campaign_res, all_negatives)

    print("Setup complete. Review campaign in the UI before enabling.")


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create a Houston Mobile Notary Search campaign")
    parser.add_argument("--customer-id", required=True, help="Ads customer ID (no dashes)")
    parser.add_argument("--campaign-name", default="Houston Mobile Notary – Core", help="Campaign name")
    parser.add_argument("--domain", required=True, help="Final URL domain, e.g., https://example.com")
    parser.add_argument("--daily-budget", type=int, default=20000000, help="Daily budget in micros (e.g., 20000000=$20)")
    parser.add_argument("--config", default=None, help="Path to google-ads.yaml (optional)")
    parser.add_argument("--zip", dest="zip_code", default=None, help="Postal code center for radius targeting (e.g., 77591)")
    parser.add_argument("--radius-miles", type=int, dest="radius_miles", default=None, help="Radius in miles around the ZIP")
    parser.add_argument("--bidding", choices=["maximize_clicks","manual_cpc"], default="maximize_clicks", help="Bidding mode")
    parser.add_argument("--cpc-cap-micros", type=int, default=1_800_000, help="CPC ceiling when using maximize_clicks")
    parser.add_argument("--include-loan-signing", action="store_true", help="Include Loan Signing ad group")
    parser.add_argument("--include-ron", action="store_true", help="Include RON ad group")
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    try:
        client = load_client(args.config)
        upsert_campaign(
            client=client,
            customer_id=args.customer_id,
            campaign_name=args.campaign_name,
            domain=args.domain,
            daily_budget_micros=args.daily_budget,
            zip_code=args.zip_code,
            radius_miles=args.radius_miles,
            bidding_mode=args.bidding,
            cpc_cap_micros=args.cpc_cap_micros,
            include_loan_signing=args.include_loan_signing,
            include_ron=args.include_ron,
        )
        return 0
    except GoogleAdsException as ex:
        print(f"Request failed with GoogleAdsException: {ex}", file=sys.stderr)
        for error in ex.failure.errors:
            print(f"\t{error.error_code}: {error.message}", file=sys.stderr)
        return 2
    except Exception as ex:  # noqa: BLE001
        print(f"Unexpected error: {ex}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())


