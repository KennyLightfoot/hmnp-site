# HMNP Google Automation – Quick Start

This folder contains scripts to automate Google Ads / GA4 / GTM / GBP setup.

## Prerequisites

- Python 3.10+ and a virtualenv
- `pip install -r scripts/ads/requirements.txt`
- For Google Ads API: Developer token, OAuth client, and a refresh token
- For Analytics Admin and Tag Manager: OAuth client or a Service Account JSON

## One-Time Credentials

1. Google Ads refresh token:

```bash
python3 scripts/ads/generate_refresh_token.py --client-secrets /abs/path/client_secret.json
```

2. Generate `google-ads.yaml` from env:

```bash
export GOOGLE_ADS_DEVELOPER_TOKEN=...
export GOOGLE_ADS_CLIENT_ID=...
export GOOGLE_ADS_CLIENT_SECRET=...
export GOOGLE_ADS_REFRESH_TOKEN=...
# Optional: export GOOGLE_ADS_LOGIN_CUSTOMER_ID=...  # MCC id, no dashes
python3 scripts/ads/generate_google_ads_yaml.py
```

## Bootstrap Ads account

Creates conversions and optionally attaches call/location assets:

```bash
python3 scripts/ads/bootstrap_account.py \
  --customer-id 4075392995 \
  --config ./google-ads.yaml \
  --phone +18326174285 \
  --attach-assets
```

This prints the CONVERSION_LABEL for your env:

```
NEXT_PUBLIC_GOOGLE_ADS_SEND_TO=AW-17079349538/<LABEL>
```

## Create conversions only

```bash
python3 scripts/ads/create_conversions.py --customer-id 4075392995 --config ./google-ads.yaml
```

## Link GA4 ↔ Ads

```bash
# Requires Analytics Admin API credentials (service account or OAuth)
python3 scripts/ads/link_ga4_property.py --property-id <GA4_NUMERIC_PROPERTY_ID> --customer-id 4075392995
```

## GTM

- `scripts/ads/gtm_container_setup.py` creates a GTM container with a GA4 config tag.
- `scripts/ads/gtm_extend_workspace.py` adds DLVs (value, currency, transaction_id, enhanced_conversion_data) and event triggers (booking_complete, booking_started, click_to_call).
- Consent Mode v2 is already added in-app (`app/layout.tsx`).

## GBP (Business Profile)

Use `scripts/get-gmb-account-location.js` to fetch account/location IDs after you obtain an OAuth refresh token with `scripts/get-gmb-refresh-token.js`. Content updates (hours, appointment link, categories) can be added similarly if desired.

---

Run these from the repository root. If you get auth prompts, paste the URL to your browser, approve, then paste back the code.

