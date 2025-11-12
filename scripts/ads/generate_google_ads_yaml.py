#!/usr/bin/env python3
"""
Generate a google-ads.yaml from environment variables.

Env vars used:
  GOOGLE_ADS_DEVELOPER_TOKEN
  GOOGLE_ADS_CLIENT_ID
  GOOGLE_ADS_CLIENT_SECRET
  GOOGLE_ADS_REFRESH_TOKEN
  GOOGLE_ADS_LOGIN_CUSTOMER_ID   (optional, MCC)
  GOOGLE_ADS_JSON_PATH           (optional output path; default ./google-ads.yaml)
"""
from __future__ import annotations

import os
import sys
import yaml  # type: ignore


def main() -> int:
    out_path = os.getenv("GOOGLE_ADS_JSON_PATH", "google-ads.yaml")
    cfg = {
        "developer_token": os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN", "").strip(),
        "client_id": os.getenv("GOOGLE_ADS_CLIENT_ID", "").strip(),
        "client_secret": os.getenv("GOOGLE_ADS_CLIENT_SECRET", "").strip(),
        "refresh_token": os.getenv("GOOGLE_ADS_REFRESH_TOKEN", "").strip(),
        "use_proto_plus": True,
    }
    login = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID", "").strip()
    if login:
        cfg["login_customer_id"] = login

    if not cfg["developer_token"] or not cfg["client_id"] or not cfg["client_secret"] or not cfg["refresh_token"]:
        print("Missing required env vars. Set GOOGLE_ADS_* values first.", file=sys.stderr)
        return 1

    with open(out_path, "w", encoding="utf-8") as f:
        yaml.safe_dump(cfg, f, default_flow_style=False, sort_keys=False)
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


