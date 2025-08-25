#!/usr/bin/env python3
"""
Send weekly Google Ads performance summary via email.

Usage:
  python3 scripts/ads/weekly_summary.py --customer-id 5072649468 --config google-ads.yaml

Environment variables needed:
  SMTP_USER=houstonmobilenotarypros@gmail.com
  SMTP_PASS=zmdc rwax qvwx dqdr
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  WEEKLY_RECIPIENT=houstonmobilenotarypros@gmail.com
"""

from __future__ import annotations

import argparse
import os
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from google.ads.googleads.client import GoogleAdsClient


def micros_to_usd(micros: int) -> float:
    return round(micros / 1_000_000, 2)


def get_weekly_data(client: GoogleAdsClient, customer_id: str) -> dict[str, Any]:
    """Fetch weekly campaign performance data."""
    end_date = datetime.now(timezone.utc).date()
    start_date = end_date - timedelta(days=7)
    
    query = f"""
      SELECT
        segments.date,
        campaign.id,
        campaign.name,
        campaign.status,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value,
        metrics.average_cpc,
        metrics.ctr,
        metrics.average_cpm
      FROM campaign
      WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
        AND campaign.status != 'REMOVED'
      ORDER BY segments.date DESC, campaign.name
    """
    
    svc = client.get_service("GoogleAdsService")
    rows = svc.search(customer_id=customer_id, query=query)
    
    campaigns = {}
    total_impressions = 0
    total_clicks = 0
    total_cost = 0
    total_conversions = 0
    total_value = 0
    
    for row in rows:
        campaign_id = str(row.campaign.id)
        if campaign_id not in campaigns:
            campaigns[campaign_id] = {
                'name': row.campaign.name,
                'status': row.campaign.status,
                'impressions': 0,
                'clicks': 0,
                'cost_micros': 0,
                'conversions': 0,
                'conversions_value': 0,
                'daily_data': []
            }
        
        daily_data = {
            'date': row.segments.date,
            'impressions': row.metrics.impressions or 0,
            'clicks': row.metrics.clicks or 0,
            'cost_micros': row.metrics.cost_micros or 0,
            'conversions': row.metrics.conversions or 0,
            'conversions_value': row.metrics.conversions_value or 0,
        }
        
        campaigns[campaign_id]['daily_data'].append(daily_data)
        campaigns[campaign_id]['impressions'] += daily_data['impressions']
        campaigns[campaign_id]['clicks'] += daily_data['clicks']
        campaigns[campaign_id]['cost_micros'] += daily_data['cost_micros']
        campaigns[campaign_id]['conversions'] += daily_data['conversions']
        campaigns[campaign_id]['conversions_value'] += daily_data['conversions_value']
        
        total_impressions += daily_data['impressions']
        total_clicks += daily_data['clicks']
        total_cost += daily_data['cost_micros']
        total_conversions += daily_data['conversions']
        total_value += daily_data['conversions_value']
    
    return {
        'campaigns': campaigns,
        'summary': {
            'start_date': start_date,
            'end_date': end_date,
            'total_impressions': total_impressions,
            'total_clicks': total_clicks,
            'total_cost': total_cost,
            'total_conversions': total_conversions,
            'total_value': total_value,
        }
    }


def generate_html_report(data: dict[str, Any]) -> str:
    """Generate HTML email report."""
    summary = data['summary']
    campaigns = data['campaigns']
    
    total_cost_usd = micros_to_usd(summary['total_cost'])
    ctr = round((summary['total_clicks'] / summary['total_impressions'] * 100), 2) if summary['total_impressions'] > 0 else 0
    cpc = round(total_cost_usd / summary['total_clicks'], 2) if summary['total_clicks'] > 0 else 0
    conv_rate = round((summary['total_conversions'] / summary['total_clicks'] * 100), 2) if summary['total_clicks'] > 0 else 0
    roas = round(summary['total_value'] / total_cost_usd, 2) if total_cost_usd > 0 else 0
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }}
            .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #4285f4, #34a853); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; }}
            .summary-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }}
            .metric-card {{ background: #f8f9fa; padding: 15px; border-radius: 6px; text-align: center; border-left: 4px solid #4285f4; }}
            .metric-value {{ font-size: 24px; font-weight: bold; color: #4285f4; }}
            .metric-label {{ color: #666; font-size: 14px; margin-top: 5px; }}
            .campaign-table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            .campaign-table th, .campaign-table td {{ padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }}
            .campaign-table th {{ background-color: #f8f9fa; font-weight: bold; }}
            .status-active {{ color: #28a745; font-weight: bold; }}
            .status-paused {{ color: #ffc107; font-weight: bold; }}
            .footer {{ margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 HMNP Google Ads Weekly Report</h1>
                <p>{summary['start_date']} to {summary['end_date']}</p>
            </div>
            
            <div class="summary-grid">
                <div class="metric-card">
                    <div class="metric-value">${total_cost_usd:,.2f}</div>
                    <div class="metric-label">Total Spend</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{summary['total_impressions']:,}</div>
                    <div class="metric-label">Impressions</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{summary['total_clicks']:,}</div>
                    <div class="metric-label">Clicks</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{ctr}%</div>
                    <div class="metric-label">CTR</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${cpc}</div>
                    <div class="metric-label">Avg CPC</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{conv_rate}%</div>
                    <div class="metric-label">Conv. Rate</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{summary['total_conversions']}</div>
                    <div class="metric-label">Conversions</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">{roas}x</div>
                    <div class="metric-label">ROAS</div>
                </div>
            </div>
            
            <h2>Campaign Performance</h2>
            <table class="campaign-table">
                <thead>
                    <tr>
                        <th>Campaign</th>
                        <th>Status</th>
                        <th>Impressions</th>
                        <th>Clicks</th>
                        <th>Cost</th>
                        <th>CTR</th>
                        <th>Conversions</th>
                        <th>Conv. Rate</th>
                    </tr>
                </thead>
                <tbody>
    """
    
    for campaign_id, campaign in campaigns.items():
        campaign_cost_usd = micros_to_usd(campaign['cost_micros'])
        campaign_ctr = round((campaign['clicks'] / campaign['impressions'] * 100), 2) if campaign['impressions'] > 0 else 0
        campaign_conv_rate = round((campaign['conversions'] / campaign['clicks'] * 100), 2) if campaign['clicks'] > 0 else 0
        
        status_class = 'status-active' if campaign['status'] == 'ENABLED' else 'status-paused'
        status_text = 'Active' if campaign['status'] == 'ENABLED' else 'Paused'
        
        html += f"""
                    <tr>
                        <td><strong>{campaign['name']}</strong></td>
                        <td class="{status_class}">{status_text}</td>
                        <td>{campaign['impressions']:,}</td>
                        <td>{campaign['clicks']:,}</td>
                        <td>${campaign_cost_usd:,.2f}</td>
                        <td>{campaign_ctr}%</td>
                        <td>{campaign['conversions']}</td>
                        <td>{campaign_conv_rate}%</td>
                    </tr>
        """
    
    html += f"""
                </tbody>
            </table>
            
            <div class="footer">
                <p>Report generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC</p>
                <p>Houston Mobile Notary Pros - Marketing Automation</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return html


def send_email(html_content: str, subject: str, recipient: str) -> None:
    """Send HTML email via Gmail SMTP."""
    smtp_user = os.getenv('SMTP_USER', 'houstonmobilenotarypros@gmail.com')
    smtp_pass = os.getenv('SMTP_PASS', 'zmdc rwax qvwx dqdr')
    smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.getenv('SMTP_PORT', '587'))
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_user
    msg['To'] = recipient
    
    html_part = MIMEText(html_content, 'html')
    msg.attach(html_part)
    
    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
        print(f"✅ Weekly report sent to {recipient}")
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        raise


def main() -> int:
    p = argparse.ArgumentParser(description="Send weekly Google Ads performance summary")
    p.add_argument("--customer-id", required=True)
    p.add_argument("--config", default="google-ads.yaml")
    p.add_argument("--recipient", default=os.getenv('WEEKLY_RECIPIENT', 'houstonmobilenotarypros@gmail.com'))
    args = p.parse_args()
    
    # Set SMTP credentials
    os.environ['SMTP_USER'] = 'houstonmobilenotarypros@gmail.com'
    os.environ['SMTP_PASS'] = 'zmdc rwax qvwx dqdr'
    os.environ['SMTP_HOST'] = 'smtp.gmail.com'
    os.environ['SMTP_PORT'] = '587'
    
    client = GoogleAdsClient.load_from_storage(path=args.config)
    data = get_weekly_data(client, args.customer_id)
    
    html_content = generate_html_report(data)
    subject = f"📊 HMNP Google Ads Weekly Report - {data['summary']['start_date']} to {data['summary']['end_date']}"
    
    send_email(html_content, subject, args.recipient)
    
    # Also save HTML to file for backup
    os.makedirs('scripts/ads/exports', exist_ok=True)
    with open(f'scripts/ads/exports/weekly-{datetime.now().strftime("%Y%m%d")}.html', 'w') as f:
        f.write(html_content)
    
    print(f"📁 HTML report saved to scripts/ads/exports/weekly-{datetime.now().strftime('%Y%m%d')}.html")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
