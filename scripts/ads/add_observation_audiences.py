#!/usr/bin/env python3
"""
Attach observation audiences (In-Market categories: Real Estate, Financial Services, Moving)
to the enabled ad group in the active Search campaign, and ensure AUDIENCE targeting is set
to OBSERVATION at the ad group level.

Usage:
  python scripts/ads/add_observation_audiences.py --customer-id 5072649468 --campaign-name "HMNP – Mobile – 77591 Radius" --config google-ads.yaml
"""

from __future__ import annotations

import argparse
from typing import List, Optional

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException


DEFAULT_CAMPAIGN_NAME = "HMNP – Mobile – 77591 Radius"
AUDIENCE_KEYWORDS = ["Real Estate", "Financial", "Moving"]


def run_query(client: GoogleAdsClient, customer_id: str, query: str):
    return client.get_service("GoogleAdsService").search(customer_id=customer_id, query=query)


def find_campaign(client: GoogleAdsClient, customer_id: str, name_hint: str) -> Optional[str]:
    q = (
        "SELECT campaign.resource_name, campaign.name, campaign.status, campaign.advertising_channel_type "
        "FROM campaign"
    )
    for row in run_query(client, customer_id, q):
        if row.campaign.name == name_hint:
            return row.campaign.resource_name
        if row.campaign.status.name == "ENABLED" and row.campaign.advertising_channel_type.name == "SEARCH":
            # fallback to first enabled search
            return row.campaign.resource_name
    return None


def find_enabled_ad_group(client: GoogleAdsClient, customer_id: str, campaign_res: str) -> Optional[str]:
    q = f"""
      SELECT ad_group.resource_name, ad_group.status
      FROM ad_group
      WHERE ad_group.campaign = '{campaign_res}'
    """
    for row in run_query(client, customer_id, q):
        if row.ad_group.status.name in ("ENABLED", "PAUSED"):
            return row.ad_group.resource_name
    return None


def ensure_observation_setting(client: GoogleAdsClient, customer_id: str, ad_group_res: str) -> None:
    # Set ad_group.targeting_setting to OBSERVATION for AUDIENCE
    ag_svc = client.get_service("AdGroupService")
    op = client.get_type("AdGroupOperation")
    ag = op.update
    ag.resource_name = ad_group_res
    ts = ag.targeting_setting
    tsg = client.get_type("TargetingSettingDetail")
    tsg.criterion_type = client.enums.TargetingDimensionEnum.AUDIENCE
    tsg.targeting_setting_status = client.enums.TargetingSettingStatusEnum.OBSERVATION
    ts.details.append(tsg)
    from google.protobuf.field_mask_pb2 import FieldMask
    mask = FieldMask(paths=["targeting_setting"])
    op.update_mask.CopyFrom(mask)
    ag_svc.mutate_ad_groups(customer_id=customer_id, operations=[op])


def find_user_interests(client: GoogleAdsClient, customer_id: str, keywords: List[str]) -> List[str]:
    # Fetch in-market user interests loosely by name match
    q = (
        "SELECT user_interest.user_interest_id, user_interest.name, user_interest.user_interest_parent, user_interest.availability_status "
        "FROM user_interest"
    )
    rns: List[str] = []
    svc = client.get_service("GoogleAdsService")
    for row in svc.search(customer_id=customer_id, query=q):
        name = row.user_interest.name or ""
        if any(k.lower() in name.lower() for k in keywords):
            rns.append(svc.user_interest_path(customer_id, row.user_interest.user_interest_id))
    return rns[:10]


def attach_audiences_observation(client: GoogleAdsClient, customer_id: str, ad_group_res: str, user_interest_rns: List[str]) -> None:
    if not user_interest_rns:
        return
    agc_svc = client.get_service("AdGroupCriterionService")
    ops = []
    for ui in user_interest_rns:
        op = client.get_type("AdGroupCriterionOperation")
        agc = op.create
        agc.ad_group = ad_group_res
        agc.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
        agc.user_interest.user_interest = ui
        ops.append(op)
    agc_svc.mutate_ad_group_criteria(customer_id=customer_id, operations=ops)


def main():
    p = argparse.ArgumentParser(description="Add observation audiences to ad group")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--campaign-name", default=DEFAULT_CAMPAIGN_NAME)
    p.add_argument("--config", default="google-ads.yaml")
    args = p.parse_args()

    client = GoogleAdsClient.load_from_storage(path=args.config)

    try:
        campaign_res = find_campaign(client, args.customer_id, args.campaign_name)
        if not campaign_res:
            print("No campaign found.")
            return
        ad_group_res = find_enabled_ad_group(client, args.customer_id, campaign_res)
        if not ad_group_res:
            print("No ad group found.")
            return
        ensure_observation_setting(client, args.customer_id, ad_group_res)
        user_interests = find_user_interests(client, args.customer_id, AUDIENCE_KEYWORDS)
        attach_audiences_observation(client, args.customer_id, ad_group_res, user_interests)
        print("Observation audiences attached to ad group.")
    except GoogleAdsException as ex:
        print("GoogleAdsException:", ex)
        for e in ex.failure.errors:
            print(" -", e.error_code, e.message)


if __name__ == "__main__":
    main()


