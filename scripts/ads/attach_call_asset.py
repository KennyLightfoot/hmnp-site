#!/usr/bin/env python3
"""
Attach a Call asset at the customer level.

Usage:
  python3 scripts/ads/attach_call_asset.py --customer-id 5072649468 --phone +18326174285 --config /abs/path/google-ads.yaml
"""

from __future__ import annotations

import argparse
from typing import Optional

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Attach Call asset")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--phone", required=True, help="E.164 format, e.g., +18326174285")
    p.add_argument("--country", default="US")
    p.add_argument("--config", default=None)
    args = p.parse_args(argv)

    try:
        client = GoogleAdsClient.load_from_storage(path=args.config) if args.config else GoogleAdsClient.load_from_storage()

        # 1) Create the Asset (Call)
        asset_svc = client.get_service("AssetService")
        asset_op = client.get_type("AssetOperation")
        asset = asset_op.create
        asset.call_asset.country_code = args.country
        # Strip leading '+' for Ads requirement on call asset phone_number
        phone_digits = args.phone.lstrip('+')
        asset.call_asset.phone_number = phone_digits
        asset_res = asset_svc.mutate_assets(customer_id=args.customer_id, operations=[asset_op])
        asset_resource_name = asset_res.results[0].resource_name

        # 2) Link the asset at customer level with field_type CALL
        cust_asset_svc = client.get_service("CustomerAssetService")
        ca_op = client.get_type("CustomerAssetOperation")
        ca = ca_op.create
        ca.asset = asset_resource_name
        ca.field_type = client.enums.AssetFieldTypeEnum.CALL
        cust_asset_svc.mutate_customer_assets(customer_id=args.customer_id, operations=[ca_op])

        print("Call asset attached.")
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


