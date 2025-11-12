#!/usr/bin/env python3
"""
Create core Google Ads conversion actions for HMNP.

This script uses the official google-ads Python library and your google-ads.yaml.
It will create:
  1) Booking – HMNP           (primary, include in conversions)
  2) Calls from ads           (primary, include in conversions)
  3) Click-to-call (website)  (secondary, do NOT include in conversions)

It prints the created ConversionAction resource names and, critically, each
conversion's "id" and "tag_snippets" info including the CONVERSION_LABEL needed
for gtag send_to (AW-ACCOUNT_ID/LABEL).

Usage:
  python3 scripts/ads/create_conversions.py \
    --customer-id 4075392995 \
    --config /abs/path/google-ads.yaml
"""
from __future__ import annotations

import argparse
from typing import Optional

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException


def _enum(client, enum_name: str, member: str) -> int:
    """
    Safe enum getter: returns enum value by name, raising if missing.
    """
    enum_type = getattr(client.enums, enum_name)
    return getattr(enum_type, member)


def _try_enum(client, enum_name: str, member: str, fallback: Optional[int] = None) -> Optional[int]:
    try:
        return _enum(client, enum_name, member)
    except Exception:
        return fallback


def create_booking_conversion(client: GoogleAdsClient, customer_id: str) -> str:
    """
    Creates the primary 'Booking – HMNP' website conversion.
    """
    svc = client.get_service("ConversionActionService")
    op = client.get_type("ConversionActionOperation")
    ca = op.create

    ca.name = "Booking – HMNP"
    ca.type_ = _enum(client, "ConversionActionTypeEnum", "WEBPAGE")
    # Category: LEAD or PURCHASE – we prefer PURCHASE so it's easy to analyze value.
    ca.category = _try_enum(client, "ConversionActionCategoryEnum", "PURCHASE", None)
    ca.primary_for_goal = True
    # Count once per click
    ca.counting_type = _enum(client, "ConversionActionCountingTypeEnum", "ONE_PER_CLICK")
    # 60 day lookback is typical for lead gen
    ca.click_through_lookback_window_days = 60
    # Note: include_in_conversions_metric is set automatically by Google Ads based on category
    # Default value is used only if gtag/gtm doesn't pass a value
    ca.value_settings.default_value = 35.0
    ca.value_settings.always_use_default_value = False

    res = svc.mutate_conversion_actions(customer_id=customer_id, operations=[op])
    resource_name = res.results[0].resource_name
    print(f"[OK] Booking conversion created: {resource_name}")
    _print_conversion_label(client, customer_id, resource_name)
    return resource_name


def create_click_to_call_website(client: GoogleAdsClient, customer_id: str) -> str:
    """
    Creates a secondary 'Click-to-call (website)' conversion.
    This tracks tel: link clicks from the website.
    """
    svc = client.get_service("ConversionActionService")
    op = client.get_type("ConversionActionOperation")
    ca = op.create

    ca.name = "Click-to-call (website)"
    # CLICK_TO_CALL type is supported; fallback to WEBPAGE if library is outdated
    ca.type_ = _try_enum(client, "ConversionActionTypeEnum", "CLICK_TO_CALL",
                         _enum(client, "ConversionActionTypeEnum", "WEBPAGE"))
    ca.category = _try_enum(client, "ConversionActionCategoryEnum", "PHONE_CALL_LEAD", None)
    ca.primary_for_goal = False
    ca.counting_type = _enum(client, "ConversionActionCountingTypeEnum", "ONE_PER_CLICK")
    ca.click_through_lookback_window_days = 60
    # Note: include_in_conversions_metric is set automatically by Google Ads
    ca.value_settings.default_value = 0.0
    ca.value_settings.always_use_default_value = True

    res = svc.mutate_conversion_actions(customer_id=customer_id, operations=[op])
    resource_name = res.results[0].resource_name
    print(f"[OK] Website click-to-call conversion created: {resource_name}")
    _print_conversion_label(client, customer_id, resource_name)
    return resource_name


def create_calls_from_ads(client: GoogleAdsClient, customer_id: str) -> str:
    """
    Creates a 'Calls from ads' conversion action (primary).
    Note: Account-level call reporting must be enabled in the UI or via support.
    Note: CALL type may not be available in all API versions; this may need UI setup.
    """
    svc = client.get_service("ConversionActionService")
    op = client.get_type("ConversionActionOperation")
    ca = op.create

    ca.name = "Calls from ads"
    # Try CALL type; fallback to WEBPAGE if not available (you'll need to configure call tracking in UI)
    ca.type_ = _try_enum(client, "ConversionActionTypeEnum", "CALL",
                         _enum(client, "ConversionActionTypeEnum", "WEBPAGE"))
    ca.category = _try_enum(client, "ConversionActionCategoryEnum", "PHONE_CALL_LEAD", None)
    ca.primary_for_goal = True
    ca.counting_type = _enum(client, "ConversionActionCountingTypeEnum", "ONE_PER_CLICK")
    # Note: include_in_conversions_metric is set automatically by Google Ads
    # Default value 0; value usually not used for call conversions
    ca.value_settings.default_value = 0.0
    ca.value_settings.always_use_default_value = True

    # Some API versions allow setting a minimum call duration; ignore if unsupported
    try:
        ca.call_value_settings.call_duration_seconds = 60
    except Exception:
        pass

    res = svc.mutate_conversion_actions(customer_id=customer_id, operations=[op])
    resource_name = res.results[0].resource_name
    print(f"[OK] Calls from ads conversion created: {resource_name}")
    _print_conversion_label(client, customer_id, resource_name)
    return resource_name


def _print_conversion_label(client: GoogleAdsClient, customer_id: str, resource_name: str) -> None:
    """
    Queries the created conversion and prints its ID and tag snippet label.
    The label is used in gtag/gtm send_to: AW-ACCOUNT_ID/LABEL
    """
    ga_svc = client.get_service("GoogleAdsService")
    query = f"""
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.type,
        conversion_action.tag_snippets
      FROM conversion_action
      WHERE conversion_action.resource_name = '{resource_name}'
    """
    rows = ga_svc.search(customer_id=customer_id, query=query)
    for row in rows:
        ca = row.conversion_action
        label = ""
        try:
            # Tag snippets typically include a label in the global site tag configuration
            for snip in ca.tag_snippets:
                if hasattr(snip, 'event_snippet') and snip.event_snippet:
                    # Try to parse the label from the snippet
                    # e.g., gtag('event', 'conversion', {'send_to': 'AW-XXXXXXXXX/ABCD1234'});
                    import re
                    m = re.search(r"AW-[^/]+/([A-Za-z0-9_-]+)", snip.event_snippet)
                    if m:
                        label = m.group(1)
                        break
                if hasattr(snip, 'google_global_site_tag') and snip.google_global_site_tag:
                    # Sometimes the label is in the global site tag
                    import re
                    m = re.search(r"AW-[^/]+/([A-Za-z0-9_-]+)", snip.google_global_site_tag)
                    if m:
                        label = m.group(1)
                        break
        except Exception as e:
            pass
        print(f"  - id={ca.id}, name={ca.name}, type={ca.type_.name if hasattr(ca.type_, 'name') else ca.type_}")
        if label:
            print(f"    CONVERSION_LABEL={label}")
            print(f"    NEXT_PUBLIC_GOOGLE_ADS_SEND_TO=AW-17079349538/{label}")
        else:
            # Fallback: use the conversion ID as label (sometimes works)
            print(f"    CONVERSION_LABEL=(check Ads UI: Conversions > {ca.name} > Tag setup)")
            print(f"    Conversion ID: {ca.id} (may work as label: AW-17079349538/{ca.id})")


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Create HMNP Google Ads conversion actions")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--config", default=None, help="Path to google-ads.yaml; otherwise default lookup is used")
    args = p.parse_args(argv)

    try:
        client = GoogleAdsClient.load_from_storage(path=args.config) if args.config else GoogleAdsClient.load_from_storage()
        create_booking_conversion(client, args.customer_id)
        create_calls_from_ads(client, args.customer_id)
        create_click_to_call_website(client, args.customer_id)
        print("\nDone. Note the CONVERSION_LABEL values above for env NEXT_PUBLIC_GOOGLE_ADS_SEND_TO.")
        return 0
    except GoogleAdsException as ex:
        print(f"GoogleAdsException: {ex}")
        for e in ex.failure.errors:
            try:
                print(f"  - {e.error_code}: {e.message}")
            except Exception:
                pass
        return 2
    except Exception as ex:  # noqa: BLE001
        print(f"Error: {ex}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())


