# HMNP Google Ads CLI Setup Guide

**Quick Reference:** All commands to run via CLI for complete setup.

---

## Prerequisites

1. **Install Python dependencies:**
   ```bash
   pip install -r scripts/ads/requirements.txt
   ```

2. **Verify `google-ads.yaml` exists** (already present in repo root)

3. **Customer ID:** `5072649468` (no dashes)
4. **GA4 Property ID:** `479840000`
5. **Phone:** `+18326174285`

---

## Step-by-Step CLI Execution

### Step 1: Link GA4 ↔ Google Ads

```bash
python3 scripts/ads/link_ga4_property.py \
  --property-id 479840000 \
  --customer-id 5072649468
```

**Note:** This requires Analytics Admin API credentials. If you get an auth error:
- Set `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON, OR
- Place `client_secret.json` in the repo root for OAuth flow

---

### Step 2: Create Conversion Actions

```bash
python3 scripts/ads/create_conversions.py \
  --customer-id 5072649468 \
  --config google-ads.yaml
```

**Output:** This prints the `CONVERSION_LABEL` values. Save them for your `.env`:
```
NEXT_PUBLIC_GOOGLE_ADS_SEND_TO=AW-5072649468/<LABEL>
```

---

### Step 3: Create Campaigns (All-in-One Script)

```bash
python3 scripts/ads/setup_complete_hmnp.py \
  --customer-id 5072649468 \
  --ga4-property-id 479840000 \
  --phone +18326174285 \
  --config google-ads.yaml \
  --monthly-budget 300
```

**What this does:**
- Creates 3 campaigns with budget split (50% RON, 35% Mobile, 15% Loan)
- Sets geo targeting (radius from 77591, excludes Downtown Houston, >50mi)
- Adds keywords, negatives, RSAs
- Campaigns are created in **PAUSED** status (review before enabling)

**Budget breakdown (if $300/mo):**
- RON: $5.00/day ($150/mo)
- Mobile: $3.50/day ($105/mo)
- Loan: $1.50/day ($45/mo)

---

### Step 4: Add Audiences (Observation Mode)

Add to each campaign:

```bash
# RON Campaign
python3 scripts/ads/add_observation_audiences.py \
  --customer-id 5072649468 \
  --campaign-name "HMNP – RON (Remote Online Notarization)" \
  --config google-ads.yaml

# Mobile Campaign
python3 scripts/ads/add_observation_audiences.py \
  --customer-id 5072649468 \
  --campaign-name "HMNP – Mobile Notary (20–30 mi)" \
  --config google-ads.yaml

# Loan Signing Campaign
python3 scripts/ads/add_observation_audiences.py \
  --customer-id 5072649468 \
  --campaign-name "HMNP – Loan Signing" \
  --config google-ads.yaml
```

---

## Alternative: Individual Campaign Creation

If you prefer to create campaigns one-by-one:

### RON Campaign
```bash
python3 scripts/ads/houston_mobile_notary_campaign.py \
  --customer-id 5072649468 \
  --campaign-name "HMNP – RON (Remote Online Notarization)" \
  --domain https://houstonmobilenotarypros.com \
  --daily-budget 5000000 \
  --zip 77591 \
  --radius-miles 50 \
  --bidding maximize_clicks \
  --cpc-cap-micros 2000000 \
  --include-ron \
  --config google-ads.yaml
```

### Mobile Notary Campaign
```bash
python3 scripts/ads/houston_mobile_notary_campaign.py \
  --customer-id 5072649468 \
  --campaign-name "HMNP – Mobile Notary (20–30 mi)" \
  --domain https://houstonmobilenotarypros.com \
  --daily-budget 3500000 \
  --zip 77591 \
  --radius-miles 30 \
  --bidding maximize_clicks \
  --cpc-cap-micros 1800000 \
  --config google-ads.yaml
```

### Loan Signing Campaign
```bash
python3 scripts/ads/houston_mobile_notary_campaign.py \
  --customer-id 5072649468 \
  --campaign-name "HMNP – Loan Signing" \
  --domain https://houstonmobilenotarypros.com \
  --daily-budget 1500000 \
  --zip 77591 \
  --radius-miles 30 \
  --bidding maximize_clicks \
  --cpc-cap-micros 2500000 \
  --include-loan-signing \
  --config google-ads.yaml
```

**Note:** Daily budgets are in **micros** (multiply USD by 1,000,000):
- $5.00/day = 5,000,000 micros
- $3.50/day = 3,500,000 micros
- $1.50/day = 1,500,000 micros

---

## Post-Setup (Manual in Google Ads UI)

After running CLI scripts, complete these in the Google Ads UI:

### 1. Ad Extensions (All Campaigns)

**Sitelinks:**
- Book Now → `https://houstonmobilenotarypros.com/booking`
- Pricing → `https://houstonmobilenotarypros.com/pricing`
- RON Services → `https://houstonmobilenotarypros.com/services/remote-online-notarization`
- Mobile Notary → `https://houstonmobilenotarypros.com/services/mobile-notary`

**Callouts:**
- Same-day available
- 25-mile radius included
- Transparent pricing
- Licensed & bonded
- 24/7 availability
- Pay on site

**Structured Snippets:**
- Services: Mobile Notary, RON, Loan Signing
- Service Options: Same-day, After-hours, Emergency

**Call Extension:**
- Phone: (832) 617-4285
- Enable call reporting

**Location Extension:**
- Link to Google Business Profile (after GBP is linked to Ads)

### 2. Link GBP to Ads

1. Google Ads → Tools & Settings → Linked accounts → Business Profile
2. Click "Link" → Search for "Houston Mobile Notary Pros LLC"
3. Select and link

### 3. Attach Location Asset to Campaigns

1. Campaigns → Select campaign → Assets → Location assets
2. Add linked GBP location

### 4. Review & Enable Campaigns

1. Review all campaigns in UI
2. Verify conversion tracking
3. Check geo targeting (include/exclude)
4. Enable campaigns when ready

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'google'"
```bash
pip install -r scripts/ads/requirements.txt
```

### "Authentication failed"
- Check `google-ads.yaml` has valid `refresh_token`
- Regenerate refresh token if needed:
  ```bash
  python3 scripts/ads/generate_refresh_token.py --client-secrets client_secret.json
  ```

### "GA4 linking failed"
- Ensure Analytics Admin API is enabled in GCP project
- Provide service account JSON via `GOOGLE_APPLICATION_CREDENTIALS`, OR
- Place `client_secret.json` in repo root for OAuth flow

### "Campaign already exists"
- Scripts check for existing campaigns by name and skip creation
- To recreate, delete the campaign in UI first, or use a different name

---

## Quick Reference: All Commands in One Block

```bash
# 1. Link GA4 ↔ Ads
python3 scripts/ads/link_ga4_property.py --property-id 479840000 --customer-id 5072649468

# 2. Create conversions
python3 scripts/ads/create_conversions.py --customer-id 5072649468 --config google-ads.yaml

# 3. Create all campaigns (or use individual commands above)
python3 scripts/ads/setup_complete_hmnp.py \
  --customer-id 5072649468 \
  --ga4-property-id 479840000 \
  --phone +18326174285 \
  --config google-ads.yaml \
  --monthly-budget 300

# 4. Add audiences
python3 scripts/ads/add_observation_audiences.py --customer-id 5072649468 --campaign-name "HMNP – RON (Remote Online Notarization)" --config google-ads.yaml
python3 scripts/ads/add_observation_audiences.py --customer-id 5072649468 --campaign-name "HMNP – Mobile Notary (20–30 mi)" --config google-ads.yaml
python3 scripts/ads/add_observation_audiences.py --customer-id 5072649468 --campaign-name "HMNP – Loan Signing" --config google-ads.yaml
```

---

**Status:** Ready to execute. Run commands in order, then complete manual steps in Google Ads UI.










