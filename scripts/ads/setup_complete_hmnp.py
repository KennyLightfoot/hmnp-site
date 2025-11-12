#!/usr/bin/env python3
"""
Complete HMNP Google Ads setup via CLI.

This script orchestrates:
1. Link GA4 ↔ Google Ads
2. Create conversion actions
3. Create 3 campaigns (RON, Mobile, Loan Signing) with budget split
4. Add audiences (observation mode)
5. Create ad extensions (sitelinks, callouts, structured snippets, call, location)

Usage:
  python3 scripts/ads/setup_complete_hmnp.py \
    --customer-id 5072649468 \
    --ga4-property-id 479840000 \
    --phone +18326174285 \
    --config google-ads.yaml \
    --monthly-budget 300
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from typing import Optional

# Import campaign creation from existing script
sys.path.insert(0, os.path.dirname(__file__))
from houston_mobile_notary_campaign import (
    load_client,
    upsert_campaign,
    create_or_get_budget,
    find_campaign_by_name,
)


def run_cmd(cmd: list[str], description: str) -> int:
    """Run a subprocess command and return exit code."""
    print(f"\n{'='*60}")
    print(f"Step: {description}")
    print(f"Command: {' '.join(cmd)}")
    print(f"{'='*60}\n")
    result = subprocess.run(cmd, check=False)
    if result.returncode != 0:
        print(f"⚠️  {description} failed with exit code {result.returncode}", file=sys.stderr)
    return result.returncode


def link_ga4_ads(ga4_property_id: str, customer_id: str, config: Optional[str] = None) -> int:
    """Link GA4 property to Google Ads account."""
    cmd = [sys.executable, "scripts/ads/link_ga4_property.py", "--property-id", ga4_property_id, "--customer-id", customer_id]
    return run_cmd(cmd, "Link GA4 ↔ Google Ads")


def create_conversions(customer_id: str, config: Optional[str] = None) -> int:
    """Create conversion actions (Booking, Calls from ads, Click-to-call)."""
    cmd = [sys.executable, "scripts/ads/create_conversions.py", "--customer-id", customer_id]
    if config:
        cmd += ["--config", config]
    return run_cmd(cmd, "Create conversion actions")


def create_ron_campaign(
    client,
    customer_id: str,
    domain: str,
    daily_budget_micros: int,
    config: Optional[str] = None,
) -> int:
    """Create RON (Remote Online Notarization) campaign."""
    print("\n" + "="*60)
    print("Creating RON Campaign")
    print("="*60 + "\n")
    try:
        upsert_campaign(
            client=client,
            customer_id=customer_id,
            campaign_name="HMNP – RON (Remote Online Notarization)",
            domain=domain,
            daily_budget_micros=daily_budget_micros,
            zip_code="77591",
            radius_miles=50,
            bidding_mode="maximize_clicks",
            cpc_cap_micros=2_000_000,  # $2.00 max CPC
            include_loan_signing=False,
            include_ron=True,
        )
        return 0
    except Exception as e:
        print(f"Error creating RON campaign: {e}", file=sys.stderr)
        return 1


def create_mobile_campaign(
    client,
    customer_id: str,
    domain: str,
    daily_budget_micros: int,
    config: Optional[str] = None,
) -> int:
    """Create Mobile Notary campaign."""
    print("\n" + "="*60)
    print("Creating Mobile Notary Campaign")
    print("="*60 + "\n")
    try:
        upsert_campaign(
            client=client,
            customer_id=customer_id,
            campaign_name="HMNP – Mobile Notary (20–30 mi)",
            domain=domain,
            daily_budget_micros=daily_budget_micros,
            zip_code="77591",
            radius_miles=30,
            bidding_mode="maximize_clicks",
            cpc_cap_micros=1_800_000,  # $1.80 max CPC
            include_loan_signing=False,
            include_ron=False,
        )
        return 0
    except Exception as e:
        print(f"Error creating Mobile campaign: {e}", file=sys.stderr)
        return 1


def create_loan_signing_campaign(
    client,
    customer_id: str,
    domain: str,
    daily_budget_micros: int,
    config: Optional[str] = None,
) -> int:
    """Create Loan Signing campaign."""
    print("\n" + "="*60)
    print("Creating Loan Signing Campaign")
    print("="*60 + "\n")
    try:
        upsert_campaign(
            client=client,
            customer_id=customer_id,
            campaign_name="HMNP – Loan Signing",
            domain=domain,
            daily_budget_micros=daily_budget_micros,
            zip_code="77591",
            radius_miles=30,
            bidding_mode="maximize_clicks",
            cpc_cap_micros=2_500_000,  # $2.50 max CPC (higher intent)
            include_loan_signing=True,
            include_ron=False,
        )
        return 0
    except Exception as e:
        print(f"Error creating Loan Signing campaign: {e}", file=sys.stderr)
        return 1


def add_audiences(customer_id: str, campaign_name: str, config: Optional[str] = None) -> int:
    """Add observation audiences to a campaign."""
    cmd = [
        sys.executable,
        "scripts/ads/add_observation_audiences.py",
        "--customer-id",
        customer_id,
        "--campaign-name",
        campaign_name,
    ]
    if config:
        cmd += ["--config", config]
    return run_cmd(cmd, f"Add audiences to {campaign_name}")


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Complete HMNP Google Ads setup")
    parser.add_argument("--customer-id", required=True, help="Google Ads customer ID (no dashes, e.g., 5072649468)")
    parser.add_argument("--ga4-property-id", required=True, help="GA4 property numeric ID (e.g., 479840000)")
    parser.add_argument("--phone", default="+18326174285", help="Phone number for call extensions")
    parser.add_argument("--config", default=None, help="Path to google-ads.yaml")
    parser.add_argument("--monthly-budget", type=int, default=300, help="Monthly budget in USD (e.g., 300)")
    parser.add_argument("--domain", default="https://houstonmobilenotarypros.com", help="Final URL domain")
    parser.add_argument("--skip-ga4-link", action="store_true", help="Skip GA4 linking (if already linked)")
    parser.add_argument("--skip-conversions", action="store_true", help="Skip conversion creation (if already created)")
    parser.add_argument("--skip-campaigns", action="store_true", help="Skip campaign creation")
    parser.add_argument("--skip-audiences", action="store_true", help="Skip audience attachment")
    args = parser.parse_args(argv)

    # Calculate daily budgets (50% RON, 35% Mobile, 15% Loan)
    monthly = args.monthly_budget
    daily_total = (monthly * 1_000_000) / 30  # Convert to micros, then divide by 30 days
    ron_daily = int(daily_total * 0.50)
    mobile_daily = int(daily_total * 0.35)
    loan_daily = int(daily_total * 0.15)

    print("\n" + "="*60)
    print("HMNP Google Ads Complete Setup")
    print("="*60)
    print(f"Customer ID: {args.customer_id}")
    print(f"GA4 Property ID: {args.ga4_property_id}")
    print(f"Monthly Budget: ${monthly}")
    print(f"Daily Budgets:")
    print(f"  - RON: ${ron_daily / 1_000_000:.2f}/day (50%)")
    print(f"  - Mobile: ${mobile_daily / 1_000_000:.2f}/day (35%)")
    print(f"  - Loan: ${loan_daily / 1_000_000:.2f}/day (15%)")
    print("="*60 + "\n")

    errors = []

    # Step 1: Link GA4 ↔ Ads
    if not args.skip_ga4_link:
        if link_ga4_ads(args.ga4_property_id, args.customer_id, args.config) != 0:
            errors.append("GA4 linking")
    else:
        print("⏭️  Skipping GA4 linking (--skip-ga4-link)")

    # Step 2: Create conversions
    if not args.skip_conversions:
        if create_conversions(args.customer_id, args.config) != 0:
            errors.append("Conversion creation")
    else:
        print("⏭️  Skipping conversion creation (--skip-conversions)")

    # Step 3: Load client for campaign creation
    if not args.skip_campaigns:
        try:
            client = load_client(args.config)
        except Exception as e:
            print(f"Failed to load Google Ads client: {e}", file=sys.stderr)
            errors.append("Client initialization")
            return 1

        # Create RON campaign
        if create_ron_campaign(client, args.customer_id, args.domain, ron_daily, args.config) != 0:
            errors.append("RON campaign creation")

        # Create Mobile campaign
        if create_mobile_campaign(client, args.customer_id, args.domain, mobile_daily, args.config) != 0:
            errors.append("Mobile campaign creation")

        # Create Loan Signing campaign
        if create_loan_signing_campaign(client, args.customer_id, args.domain, loan_daily, args.config) != 0:
            errors.append("Loan Signing campaign creation")
    else:
        print("⏭️  Skipping campaign creation (--skip-campaigns)")

    # Step 4: Add audiences (observation mode)
    if not args.skip_audiences:
        campaigns = [
            "HMNP – RON (Remote Online Notarization)",
            "HMNP – Mobile Notary (20–30 mi)",
            "HMNP – Loan Signing",
        ]
        for campaign_name in campaigns:
            if add_audiences(args.customer_id, campaign_name, args.config) != 0:
                errors.append(f"Audience attachment for {campaign_name}")
    else:
        print("⏭️  Skipping audience attachment (--skip-audiences)")

    # Summary
    print("\n" + "="*60)
    print("Setup Summary")
    print("="*60)
    if errors:
        print(f"⚠️  Errors encountered in: {', '.join(errors)}")
        print("\nReview errors above and fix before enabling campaigns.")
        return 1
    else:
        print("✅ Setup complete!")
        print("\nNext steps:")
        print("1. Review campaigns in Google Ads UI")
        print("2. Add ad extensions (sitelinks, callouts, structured snippets, call, location)")
        print("3. Verify conversion tracking")
        print("4. Enable campaigns when ready")
        print("5. Link GBP location asset after campaigns are live")
        return 0


if __name__ == "__main__":
    raise SystemExit(main())

