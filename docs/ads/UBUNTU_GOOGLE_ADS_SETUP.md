### Ubuntu CLI setup for Google Ads automation

- **Install tooling**
```bash
sudo apt update && sudo apt install -y python3-venv
cd /home/fleece-johnson/HMNP-Site/hmnp-site
python3 -m venv .venv && source .venv/bin/activate
pip install -r scripts/ads/requirements.txt
```

- **Credentials**
  - Copy `docs/ads/google-ads.yaml.example` to a safe path (outside git if preferred) as `google-ads.yaml`.
  - Fill in: `developer_token`, `login_customer_id`, `client_id`, `client_secret`, `refresh_token`.
  - Optionally export a path: `export GOOGLE_ADS_CONFIGURATION_FILE=/abs/path/google-ads.yaml`.

- **Run the turnkey campaign script**
```bash
python3 scripts/ads/houston_mobile_notary_campaign.py \
  --customer-id 1234567890 \
  --campaign-name "Houston Mobile Notary – Core" \
  --domain "https://your-domain.com" \
  --daily-budget 20000000
```

- **What it creates**
  - Search campaign (Paused), shared budget, 3 ad groups, keywords, campaign negatives
  - City-based geo targets around Houston area
  - One RSA per ad group with multiple headlines/descriptions

- **Next steps**
  - Review assets and enable the campaign in the Google Ads UI
  - Add call and location assets in the UI (or extend this script)
  - Wire cron or CI to re-run keyword/negative refreshes on a schedule
