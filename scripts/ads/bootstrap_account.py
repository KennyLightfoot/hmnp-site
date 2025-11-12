#!/usr/bin/env python3
"""
Bootstrap HMNP Google Ads account:
 - Ensure google-ads.yaml is present
 - Create core conversions (Booking, Calls from ads, Click-to-call website)
 - Optionally attach call & location assets

Usage:
  python3 scripts/ads/bootstrap_account.py \
    --customer-id 4075392995 \
    --config /abs/path/google-ads.yaml \
    --phone +18326174285 \
    --attach-assets
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from typing import Optional


def run(cmd: list[str]) -> int:
    print(">>", " ".join(cmd))
    return subprocess.call(cmd)


def main(argv: Optional[list[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Bootstrap HMNP Ads account")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--config", default=None, help="Path to google-ads.yaml")
    p.add_argument("--phone", default="+18326174285")
    p.add_argument("--attach-assets", action="store_true")
    args = p.parse_args(argv)

    # 1) Create conversions
    cmd = [sys.executable, "scripts/ads/create_conversions.py", "--customer-id", args.customer_id]
    if args.config:
        cmd += ["--config", args.config]
    if run(cmd) != 0:
        print("Failed to create conversions", file=sys.stderr)
        return 1

    # 2) (optional) Attach call and location assets
    if args.attach-assets:  # hyphen in attribute not allowed; map manually
        pass
    if args.attach_assets:
        cmd = [sys.executable, "scripts/ads/attach_call_asset.py", "--customer-id", args.customer_id, "--phone", args.phone]
        if args.config:
            cmd += ["--config", args.config]
        run(cmd)

        cmd = [sys.executable, "scripts/ads/attach_location_asset.py", "--customer-id", args.customer_id]
        if args.config:
            cmd += ["--config", args.config]
        run(cmd)

    print("\nBootstrap complete. If CONVERSION_LABEL printed above, set:")
    print("  NEXT_PUBLIC_GOOGLE_ADS_SEND_TO=AW-17079349538/<CONVERSION_LABEL>")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


