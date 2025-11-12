#!/usr/bin/env python3
"""
Create a GA4↔Google Ads link using the Analytics Admin API.

Prereqs:
  - Enable "Analytics Admin API" in your GCP project.
  - Provide OAuth user creds (InstalledAppFlow) or a Service Account JSON with domain-wide delegation.
  - The principal used must have GA4 Editor on the property and Admin access to the Ads account or sufficient permission to create links.

Usage:
  python3 scripts/ads/link_ga4_property.py \
    --property-id 000000000 \
    --customer-id 4075392995
"""
from __future__ import annotations

import argparse
import sys
from typing import Optional

from google.oauth2 import service_account
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/analytics.edit"]


def get_service() -> any:
    """
    Creates an Analytics Admin API client via either a service account JSON (GOOGLE_APPLICATION_CREDENTIALS)
    or an interactive InstalledAppFlow if a client_secret.json is supplied.
    """
    import os
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and cred_path.endswith(".json"):
        creds = service_account.Credentials.from_service_account_file(cred_path, scopes=SCOPES)
        return build("analyticsadmin", "v1beta", credentials=creds)
    # Fallback to installed app flow
    flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", scopes=SCOPES)
    creds = flow.run_console()
    return build("analyticsadmin", "v1beta", credentials=creds)


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Link GA4 property to Google Ads account")
    p.add_argument("--property-id", required=True, help="GA4 property numeric ID (not the G-XXXX)")
    p.add_argument("--customer-id", required=True, help="Google Ads customer ID (no dashes)")
    args = p.parse_args(argv)

    try:
        svc = get_service()
        parent = f"properties/{args.property_id}"
        body = {
            "customerId": args.customer_id,
            "canManageClients": True,
            "adsPersonalizationEnabled": True,
        }
        res = svc.properties().googleAdsLinks().create(parent=parent, body=body).execute()
        print("GA4↔Ads link created:")
        print(res)
        return 0
    except Exception as ex:  # noqa: BLE001
        print(f"Error creating GA4 Ads link: {ex}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())


