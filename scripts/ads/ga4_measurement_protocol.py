#!/usr/bin/env python3
"""
Send GA4 Measurement Protocol events (e.g., generate_lead) from server-side.

Usage:
  python3 scripts/ads/ga4_measurement_protocol.py \
    --measurement-id G-XXXXXXX \
    --api-secret YOUR_API_SECRET \
    --client-id 555.1234567890 \
    --event generate_lead \
    --param lead_type=booking --param value=1

Notes:
- client_id format: <random_int>.<timestamp_ms> (or reuse a client ID from frontend). If none, pass a random value.
- To import conversions to Google Ads, link GA4 to Ads and import the GA4 event as a conversion.
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Dict, List, Optional

import requests


def parse_kv_params(items: Optional[List[str]]) -> Dict[str, str]:
    params: Dict[str, str] = {}
    if not items:
        return params
    for item in items:
        if "=" not in item:
            continue
        key, value = item.split("=", 1)
        params[key] = value
    return params


def send_event(measurement_id: str, api_secret: str, client_id: str, event_name: str, params: Dict[str, str]) -> requests.Response:
    url = f"https://www.google-analytics.com/mp/collect?measurement_id={measurement_id}&api_secret={api_secret}"
    payload = {
        "client_id": client_id,
        "events": [
            {
                "name": event_name,
                "params": params,
            }
        ],
    }
    headers = {"Content-Type": "application/json"}
    return requests.post(url, headers=headers, data=json.dumps(payload), timeout=10)


def main(argv: Optional[List[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Send a GA4 Measurement Protocol event")
    parser.add_argument("--measurement-id", required=True)
    parser.add_argument("--api-secret", required=True)
    parser.add_argument("--client-id", required=True)
    parser.add_argument("--event", required=True, help="Event name, e.g., generate_lead")
    parser.add_argument("--param", action="append", help="Additional event params as key=value; repeatable")
    args = parser.parse_args(argv)

    params = parse_kv_params(args.param)
    try:
        resp = send_event(args.measurement_id, args.api_secret, args.client_id, args.event, params)
        print(f"Status: {resp.status_code}")
        if resp.text:
            print(resp.text)
        return 0 if resp.ok else 1
    except Exception as ex:  # noqa: BLE001
        print(f"Error: {ex}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())


