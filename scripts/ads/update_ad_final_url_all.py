#!/usr/bin/env python3
"""
Bulk update Responsive Search Ad Final URLs across ALL campaigns for a customer.

Examples:
  # Dry-run: replace homepage -> booking/enhanced everywhere (prints what would change)
  python3 scripts/ads/update_ad_final_url_all.py \
    --customer-id 5072649468 \
    --from-url https://houstonmobilenotarypros.com \
    --to-url https://houstonmobilenotarypros.com/booking/enhanced \
    --config /abs/path/google-ads.yaml

  # Actually apply changes
  python3 scripts/ads/update_ad_final_url_all.py \
    --customer-id 5072649468 \
    --from-url https://houstonmobilenotarypros.com \
    --to-url https://houstonmobilenotarypros.com/booking/enhanced \
    --apply \
    --config /abs/path/google-ads.yaml

Matching modes:
  --mode exact      : URLs must match from-url exactly (default)
  --mode startswith : URLs starting with from-url (prefix match)
  --mode domain     : Any URL on the same domain as from-url
"""

from __future__ import annotations

import argparse
import sys
from collections import defaultdict
from typing import Dict, Iterable, List, Tuple
from urllib.parse import urlparse

from google.ads.googleads.client import GoogleAdsClient
from google.api_core import protobuf_helpers


def _normalize_url(u: str) -> str:
  return u.rstrip('/')


def _same_domain(a: str, b: str) -> bool:
  try:
    pa, pb = urlparse(a), urlparse(b)
    # Handle bare domains passed without scheme
    host_a = pa.netloc or pa.path
    host_b = pb.netloc or pb.path
    return host_a.lower() == host_b.lower()
  except Exception:
    return False


def _should_update(urls: Iterable[str], from_url: str, mode: str) -> bool:
  from_url_n = _normalize_url(from_url)
  for u in urls:
    u_n = _normalize_url(u)
    if mode == 'exact' and u_n == from_url_n:
      return True
    if mode == 'startswith' and u_n.startswith(from_url_n):
      return True
    if mode == 'domain' and _same_domain(u_n, from_url_n):
      return True
  return False


def find_ads_all_campaigns(
  client: GoogleAdsClient,
  customer_id: str,
  from_url: str,
  mode: str,
) -> List[Tuple[str, str, str, str, List[str]]]:
  """Return list of tuples (resource_name, ad_id, campaign_name, ad_group_name, urls) to update."""
  ga = client.get_service('GoogleAdsService')
  query = """
    SELECT
      ad_group_ad.resource_name,
      ad_group_ad.ad.id,
      ad_group_ad.ad.final_urls,
      ad_group_ad.status,
      campaign.name,
      ad_group.name
    FROM ad_group_ad
    WHERE ad_group_ad.ad.type = RESPONSIVE_SEARCH_AD
      AND ad_group_ad.status != REMOVED
  """
  results = ga.search(customer_id=customer_id, query=query)
  matches: List[Tuple[str, str, str, str, List[str]]] = []
  for row in results:
    urls = list(row.ad_group_ad.ad.final_urls) if row.ad_group_ad.ad.final_urls else []
    if not urls:
      continue
    if _should_update(urls, from_url, mode):
      matches.append((
        row.ad_group_ad.resource_name,
        str(row.ad_group_ad.ad.id),
        row.campaign.name,
        row.ad_group.name,
        urls,
      ))
  return matches


def update_ads_final_url(
  client: GoogleAdsClient,
  customer_id: str,
  resources: List[str],
  to_url: str,
) -> None:
  svc = client.get_service('AdGroupAdService')
  operations = []
  for rn in resources:
    op = client.get_type('AdGroupAdOperation')
    ad_group_ad = op.update
    ad_group_ad.resource_name = rn
    ad = ad_group_ad.ad
    # Replace the final_urls list with only the target URL
    ad.final_urls[:] = [to_url]
    client.copy_from(op.update_mask, protobuf_helpers.field_mask(None, ad_group_ad._pb))
    operations.append(op)
  if not operations:
    print('No operations to apply.')
    return
  resp = svc.mutate_ad_group_ads(customer_id=customer_id, operations=operations)
  for r in resp.results:
    print(f"Updated: {r.resource_name}")


def main() -> int:
  p = argparse.ArgumentParser(description='Bulk update RSA Final URLs across all campaigns')
  p.add_argument('--customer-id', required=True, help='Customer ID without dashes')
  p.add_argument('--from-url', required=True, help='URL to match (see --mode)')
  p.add_argument('--to-url', required=True, help='New Final URL to set')
  p.add_argument('--mode', choices=['exact', 'startswith', 'domain'], default='exact')
  p.add_argument('--config', default='google-ads.yaml', help='Path to google-ads.yaml')
  p.add_argument('--apply', action='store_true', help='Actually apply changes (omit for dry-run)')
  args = p.parse_args()

  client = GoogleAdsClient.load_from_storage(path=args.config)

  print(f"Searching for RSAs to update in customer {args.customer_id}…")
  matches = find_ads_all_campaigns(client, args.customer_id, args.from_url, args.mode)

  if not matches:
    print('No matching ads found.')
    return 0

  # Report grouped by campaign/ad group
  by_campaign: Dict[Tuple[str, str], List[Tuple[str, List[str]]]] = defaultdict(list)
  for rn, ad_id, camp, ag, urls in matches:
    by_campaign[(camp, ag)].append((ad_id, urls))

  print('\nPlanned changes (dry-run):\n')
  for (camp, ag), ads in by_campaign.items():
    print(f"- {camp} › {ag}")
    for ad_id, urls in ads:
      print(f"  Ad {ad_id}: {', '.join(urls)}  =>  {args.to_url}")

  if not args.apply:
    print(f"\nDry-run only. {len(matches)} ad(s) would be updated. Re-run with --apply to make changes.")
    return 0

  # Apply
  resources = [rn for rn, *_ in matches]
  print(f"\nApplying updates to {len(resources)} ad(s)…")
  update_ads_final_url(client, args.customer_id, resources, args.to_url)
  print('Done.')
  return 0


if __name__ == '__main__':
  sys.exit(main())



