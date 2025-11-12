#!/usr/bin/env python3
"""
Extend an existing GTM Web container workspace with common HMNP variables and triggers.

Adds:
  - Data Layer Variables (DLV): value, currency, transaction_id, enhanced_conversion_data
  - Custom Event Triggers: booking_complete, booking_started, click_to_call

Usage:
  python3 scripts/ads/gtm_extend_workspace.py \
    --account-id 123456 \
    --container-id 789012 \
    --workspace-id 1
Requires OAuth user creds for Tag Manager API v2 (see gtm_container_setup.py header).
"""
from __future__ import annotations

import argparse
import sys
from typing import Optional

from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = [
    "https://www.googleapis.com/auth/tagmanager.edit.containers",
    "https://www.googleapis.com/auth/tagmanager.publish",
]


def get_service():
    flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", scopes=SCOPES)
    creds = flow.run_local_server(port=0, open_browser=True)
    return build("tagmanager", "v2", credentials=creds)


def create_dlv(service, parent: str, name: str, key: str) -> None:
    """
    name: display name in GTM
    key:  dataLayer key
    """
    var_name = f"DLV – {name}"
    # Check if variable already exists
    try:
        vars_list = service.accounts().containers().workspaces().variables().list(parent=parent).execute()
        for var in vars_list.get("variable", []):
            if var.get("name") == var_name:
                print(f"  [SKIP] Variable '{var_name}' already exists")
                return
    except Exception:
        pass  # Continue to create if check fails
    
    body = {
        "name": var_name,
        "type": "v",  # dataLayer variable
        "parameter": [
            {"type": "TEMPLATE", "key": "name", "value": key},
            {"type": "INTEGER", "key": "dataLayerVersion", "value": "2"},
        ],
    }
    service.accounts().containers().workspaces().variables().create(
        parent=parent, body=body
    ).execute()
    print(f"  [OK] Created variable '{var_name}'")


def create_custom_event_trigger(service, parent: str, event_name: str) -> None:
    trigger_name = f"Event – {event_name}"
    # Check if trigger already exists
    try:
        triggers_list = service.accounts().containers().workspaces().triggers().list(parent=parent).execute()
        for trig in triggers_list.get("trigger", []):
            if trig.get("name") == trigger_name:
                print(f"  [SKIP] Trigger '{trigger_name}' already exists")
                return
    except Exception:
        pass  # Continue to create if check fails
    
    body = {
        "name": trigger_name,
        "type": "CUSTOM_EVENT",
        "customEventFilter": [
            {
                "type": "EQUALS",
                "parameter": [
                    {"type": "TEMPLATE", "key": "arg0", "value": "{{_event}}"},
                    {"type": "TEMPLATE", "key": "arg1", "value": event_name},
                ],
            }
        ],
    }
    service.accounts().containers().workspaces().triggers().create(
        parent=parent, body=body
    ).execute()
    print(f"  [OK] Created trigger '{trigger_name}'")


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Extend GTM workspace with HMNP variables/triggers")
    p.add_argument("--account-id", required=True)
    p.add_argument("--container-id", required=True)
    p.add_argument("--workspace-id", required=True)
    args = p.parse_args(argv)

    try:
        svc = get_service()
        parent = f"accounts/{args.account_id}/containers/{args.container_id}/workspaces/{args.workspace_id}"

        # Variables
        create_dlv(svc, parent, "event", "event")
        create_dlv(svc, parent, "value", "value")
        create_dlv(svc, parent, "currency", "currency")
        create_dlv(svc, parent, "transaction_id", "transaction_id")
        create_dlv(svc, parent, "enhanced_conversion_data", "enhanced_conversion_data")

        # Triggers
        for evt in ["booking_complete", "booking_started", "click_to_call"]:
            create_custom_event_trigger(svc, parent, evt)

        print("Workspace extended with variables and triggers.")
        return 0
    except HttpError as ex:
        print(f"HTTP Error: {ex}", file=sys.stderr)
        return 1
    except Exception as ex:  # noqa: BLE001
        print(f"Unexpected Error: {ex}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())


