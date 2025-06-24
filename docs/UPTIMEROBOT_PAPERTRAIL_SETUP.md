# UptimeRobot + Papertrail Setup Guide

## Overview
This guide will help you set up UptimeRobot for uptime monitoring and Papertrail for centralized logging - both FREE tiers.

## Phase 1: UptimeRobot Setup

### 1.1 Create UptimeRobot Account
1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Click "Sign Up" and create a free account
3. Verify your email address

### 1.2 Add Your First Monitor
1. Log into UptimeRobot dashboard
2. Click "Add New Monitor"
3. Configure the following settings:

**Monitor Type:** HTTP(s)
**Friendly Name:** HMNP Main Site
**URL:** `https://your-domain.com` (replace with your actual domain)
**Monitoring Interval:** 5 minutes (free tier limit)
**Alert Contacts:** Add your email

### 1.3 Add Additional Monitors
Create monitors for these critical endpoints:

1. **API Health Check**
   - URL: `https://your-domain.com/api/health`
   - Name: "HMNP API Health"

2. **Booking System**
   - URL: `https://your-domain.com/booking`
   - Name: "HMNP Booking System"

3. **Admin Dashboard**
   - URL: `https://your-domain.com/admin`
   - Name: "HMNP Admin Dashboard"

### 1.4 Configure Alert Settings
1. Go to "Alert Contacts" in UptimeRobot
2. Add your email address
3. Set up SMS alerts (optional, requires credits)
4. Configure alert thresholds:
   - Alert when down for 1 minute
   - Alert when back up
   - Daily/weekly reports

## Phase 2: Papertrail Setup

### 2.1 Create Papertrail Account
1. Go to [Papertrail.com](https://papertrail.com)
2. Click "Sign Up" and create a free account
3. Verify your email

### 2.2 Get Your Papertrail Destination
1. Log into Papertrail dashboard
2. Go to "Log Destinations"
3. Note your unique destination URL (format: `logs.papertrailapp.com:XXXXX`)

### 2.3 Configure Winston for Papertrail
Update your logging configuration to send logs to Papertrail.

## Phase 3: Implementation

### 3.1 Install Required Dependencies
```bash
pnpm add winston-papertrail
```

### 3.2 Update Environment Variables
Add these to your `.env` file:
```env
# Papertrail Configuration
PAPERTRAIL_HOST=logs.papertrailapp.com
PAPERTRAIL_PORT=XXXXX
PAPERTRAIL_HOSTNAME=hmnp-production

# UptimeRobot Webhook (optional)
UPTIMEROBOT_WEBHOOK_URL=https://api.uptimerobot.com/v2/webhook
```

### 3.3 Update Logger Configuration
The logger will be updated to include Papertrail transport.

### 3.4 Create Health Check Endpoint
A health check endpoint will be created at `/api/health` for UptimeRobot monitoring.

## Phase 4: Testing & Verification

### 4.1 Test UptimeRobot
1. Create a test monitor pointing to your health endpoint
2. Verify alerts are working by temporarily taking down the endpoint
3. Check that uptime tracking is accurate

### 4.2 Test Papertrail
1. Generate some test logs
2. Verify they appear in Papertrail dashboard
3. Test log search and filtering

### 4.3 Set Up Log Alerts
1. Configure Papertrail alerts for error patterns
2. Set up alerts for high error rates
3. Create alerts for security events

## Phase 5: Advanced Configuration

### 5.1 Custom Log Formats
Configure structured logging for better searchability.

### 5.2 Log Retention
Set up log retention policies (free tier has limitations).

### 5.3 Integration with Existing Systems
Integrate with your existing Sentry and other monitoring tools.

## Next Steps
After completing this setup, you'll be ready to implement enhanced security middleware next week.

## Troubleshooting

### Common Issues
1. **Logs not appearing in Papertrail**
   - Check firewall settings
   - Verify port configuration
   - Check network connectivity

2. **UptimeRobot false positives**
   - Adjust monitoring intervals
   - Check response time thresholds
   - Verify URL accessibility

3. **High log volume**
   - Implement log filtering
   - Use log levels appropriately
   - Consider log sampling

## Support Resources
- [UptimeRobot Documentation](https://uptimerobot.com/help/)
- [Papertrail Documentation](https://help.papertrailapp.com/)
- [Winston Documentation](https://github.com/winstonjs/winston) 