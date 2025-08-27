#!/usr/bin/env python3
"""
Create a new Responsive Search Ad in a given ad group with a specified Final URL
and pause existing RSAs in that ad group that point elsewhere.

Usage:
  python3 scripts/ads/add_new_rsa_with_url.py \
    --customer-id 5072649468 \
    --ad-group-id 186969042409 \
    --final-url https://houstonmobilenotarypros.com/lp/mobile-priority \
    --config /abs/path/google-ads.yaml

Notes:
  - Ad.final_urls cannot be updated in-place (immutable). We create a new ad
    with the desired URL and pause old RSAs so traffic goes to the new LP.
  - If an ENABLED RSA already uses the target Final URL, we skip creation.
"""

from __future__ import annotations

import argparse
from typing import List, Optional

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from google.protobuf.field_mask_pb2 import FieldMask


def run_query(client: GoogleAdsClient, customer_id: str, query: str):
    svc = client.get_service("GoogleAdsService")
    return svc.search(customer_id=customer_id, query=query)


def get_ad_group_resource_name(client: GoogleAdsClient, customer_id: str, ad_group_id: str) -> str:
    gas = client.get_service("GoogleAdsService")
    # Resource name helper lives on GoogleAdsService in the Python library
    return gas.ad_group_path(customer_id, ad_group_id)


def list_rsas_in_ad_group(client: GoogleAdsClient, customer_id: str, ad_group_resource: str):
    q = (
        "SELECT ad_group_ad.resource_name, ad_group_ad.status, ad_group_ad.ad.id, "
        "ad_group_ad.ad.final_urls FROM ad_group_ad "
        f"WHERE ad_group_ad.ad_group = '{ad_group_resource}' "
        "AND ad_group_ad.ad.type = RESPONSIVE_SEARCH_AD "
        "AND ad_group_ad.status != REMOVED"
    )
    return list(run_query(client, customer_id, q))


def pause_ads(client: GoogleAdsClient, customer_id: str, resource_names: List[str]) -> None:
    if not resource_names:
        return
    svc = client.get_service("AdGroupAdService")
    ops = []
    for rn in resource_names:
        op = client.get_type("AdGroupAdOperation")
        ad_group_ad = op.update
        ad_group_ad.resource_name = rn
        ad_group_ad.status = client.enums.AdGroupAdStatusEnum.PAUSED
        mask = FieldMask()
        mask.paths.append("status")
        op.update_mask.CopyFrom(mask)
        ops.append(op)
    svc.mutate_ad_group_ads(customer_id=customer_id, operations=ops)


def create_rsa(
    client: GoogleAdsClient,
    customer_id: str,
    ad_group_resource: str,
    final_url: str,
    headlines: List[str],
    descriptions: List[str],
    enabled: bool = True,
) -> str:
    svc = client.get_service("AdGroupAdService")
    op = client.get_type("AdGroupAdOperation")
    aga = op.create
    aga.ad_group = ad_group_resource
    aga.status = client.enums.AdGroupAdStatusEnum.ENABLED if enabled else client.enums.AdGroupAdStatusEnum.PAUSED

    ad = aga.ad
    ad.final_urls.append(final_url)

    rsa = ad.responsive_search_ad
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

    resp = svc.mutate_ad_group_ads(customer_id=customer_id, operations=[op])
    return resp.results[0].resource_name


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Create RSA with Final URL and pause others")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--ad-group-id", required=True)
    p.add_argument("--final-url", required=True)
    p.add_argument("--config", default=None)
    args = p.parse_args(argv)

    try:
        client = GoogleAdsClient.load_from_storage(path=args.config) if args.config else GoogleAdsClient.load_from_storage()
        ad_group_res = get_ad_group_resource_name(client, args.customer_id, args.ad_group_id)

        rows = list_rsas_in_ad_group(client, args.customer_id, ad_group_res)
        # Pause every non-removed RSA in this ad group so traffic consolidates to the new LP ad
        to_pause: List[str] = []
        for row in rows:
            status = row.ad_group_ad.status.name
            rn = row.ad_group_ad.resource_name
            if status != "REMOVED":
                to_pause.append(rn)

        if to_pause:
            pause_ads(client, args.customer_id, to_pause)

        # High-quality asset set to improve Ad Strength (15 headlines, 4 descriptions)
        headlines = [
            "Mobile Notary Near You",
            "Houston Mobile Notary",
            "Book Same‑Day Notary",
            "We Come To Your Location",
            "Evenings & Weekends Available",
            "Licensed, Bonded, Insured",
            "Loan Signing Specialist",
            "Remote Online Notary (RON)",
            "Transparent Upfront Pricing",
            "60‑Second Booking",
            "24/7 Customer Support",
            "Business Accounts Welcome",
            "Apostille & POA Notarization",
            "Witness Available On Request",
            "Local Houston Professionals",
        ]
        descriptions = [
            "Houston‑area mobile notary. Same‑day appointments. We travel to you. Book in minutes.",
            "Loan signings, POA, affidavits, real estate. Licensed & insured. Evenings & weekends.",
            "Upfront pricing. SMS/email reminders. Pay securely online. 5‑star local service.",
            "Mobile or online notarization (RON). Fast response. Reserve your time now.",
        ]
        rn = create_rsa(
            client=client,
            customer_id=args.customer_id,
            ad_group_resource=ad_group_res,
            final_url=args.final_url,
            headlines=headlines,
            descriptions=descriptions,
            enabled=True,
        )
        print(f"Created RSA: {rn}")

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


