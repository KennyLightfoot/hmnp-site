#!/usr/bin/env python3
"""
Generate a Google Ads API refresh token using an Installed (Desktop) OAuth client JSON.

Usage:
  python3 scripts/ads/generate_refresh_token.py --client-secrets /abs/path/client_secret.json

This opens a console-based OAuth flow. Copy/paste the URL into a browser, authorize,
then paste the verification code back into the terminal. The script prints the
refresh token you can place into google-ads.yaml.
"""

from __future__ import annotations

import argparse
import json
import sys
from typing import Optional

from google_auth_oauthlib.flow import InstalledAppFlow


SCOPE = "https://www.googleapis.com/auth/adwords"


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Generate a Google Ads refresh token")
    parser.add_argument("--client-secrets", required=True, help="Path to installed (Desktop) OAuth client JSON")
    parser.add_argument("--no-browser", action="store_true", help="Do not attempt to open a browser (prints the URL instead)")
    parser.add_argument("--print-auth-url", action="store_true", help="Only print the authorization URL and exit")
    parser.add_argument("--auth-code", default=None, help="Authorization code returned by Google (for non-interactive exchange)")
    args = parser.parse_args(argv)

    try:
        flow = InstalledAppFlow.from_client_secrets_file(args.client_secrets, scopes=[SCOPE])
        # Non-interactive helpers
        if args.print_auth_url:
            auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent", include_granted_scopes="true")
            print("Authorization URL:\n" + auth_url)
            return 0

        if args.auth_code:
            flow.fetch_token(code=args.auth_code)
            creds = flow.credentials
        else:
            # Use local server OAuth flow; prints the URL if open_browser is False
            creds = flow.run_local_server(port=0, open_browser=not args.no_browser)
        if not creds.refresh_token:
            print("No refresh token received. If you've authorized before, revoke access in your Google Account security settings and try again.", file=sys.stderr)
            return 1
        print("Refresh token:")
        print(creds.refresh_token)
        return 0
    except Exception as ex:  # noqa: BLE001
        print(f"Error generating refresh token: {ex}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())


