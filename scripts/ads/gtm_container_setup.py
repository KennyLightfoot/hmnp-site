#!/usr/bin/env python3
"""
Create a basic GTM Web container with GA4 tags via Google Tag Manager API.

This script uses OAuth user credentials. You'll need a GCP project with the Tag Manager API enabled and an OAuth client.

Prep:
  - Install deps: pip install -r scripts/ads/requirements.txt
  - Create OAuth creds in Google Cloud Console, download client_secret.json
  - Set env var: export GOOGLE_APPLICATION_CREDENTIALS=/abs/path/client_secret.json (for oauthlib flow)

Usage:
  python3 scripts/ads/gtm_container_setup.py \
    --account-id 1234567 \
    --container-name "Site Web" \
    --domain your-domain.com \
    --ga4-measurement-id G-XXXXXXX
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


def get_service() -> any:
    flow = InstalledAppFlow.from_client_secrets_file(
        filename=sys.getenv("GOOGLE_APPLICATION_CREDENTIALS", "client_secret.json"),
        scopes=SCOPES,
    )
    creds = flow.run_console()
    return build("tagmanager", "v2", credentials=creds)


def create_container(service, account_id: str, container_name: str, domain: str) -> str:
    body = {
        "name": container_name,
        "usageContext": ["web"],
        "domainName": [domain],
    }
    res = service.accounts().containers().create(parent=f"accounts/{account_id}", body=body).execute()
    return res["path"]  # e.g., accounts/1234567/containers/7654321


def create_workspace(service, container_path: str) -> str:
    res = service.accounts().containers().workspaces().create(parent=container_path, body={"name": "Initial"}).execute()
    return res["path"]


def add_ga4_tag(service, workspace_path: str, measurement_id: str) -> None:
    # GA4 Configuration tag
    tag_body = {
        "name": "GA4 - Configuration",
        "type": "gaawc",
        "parameter": [
            {"type": "template", "key": "measurementId", "value": measurement_id},
        ],
        "firingTriggerId": ["2147479553"],  # All Pages built-in trigger
    }
    service.accounts().containers().workspaces().tags().create(parent=workspace_path, body=tag_body).execute()


def publish(service, workspace_path: str) -> None:
    service.accounts().containers().workspaces().create_version(parent=workspace_path, body={"name": "v1"}).execute()
    service.accounts().containers().versions().publish(path=workspace_path.replace("workspaces", "versions/1")).execute()


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Provision a GTM Web container with GA4 tag")
    parser.add_argument("--account-id", required=True)
    parser.add_argument("--container-name", required=True)
    parser.add_argument("--domain", required=True)
    parser.add_argument("--ga4-measurement-id", required=True)
    args = parser.parse_args(argv)

    try:
        service = get_service()
        container_path = create_container(service, args.account_id, args.container_name, args.domain)
        workspace_path = create_workspace(service, container_path)
        add_ga4_tag(service, workspace_path, args.ga4_measurement_id)
        publish(service, workspace_path)
        print("GTM container created and published.")
        print(f"Container: {container_path}")
        return 0
    except HttpError as ex:
        print(f"HTTP Error: {ex}", file=sys.stderr)
        return 1
    except Exception as ex:  # noqa: BLE001
        print(f"Unexpected Error: {ex}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())


