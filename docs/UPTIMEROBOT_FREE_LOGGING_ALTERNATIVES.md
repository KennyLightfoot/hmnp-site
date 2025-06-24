# UptimeRobot + FREE Logging Alternatives Setup Guide

## Overview
You're right! Papertrail now charges $5/month. Here are better FREE alternatives that work perfectly with Vercel.

## 🆓 Best FREE Logging Services for Vercel

### 1. Better Stack (Formerly Logtail) - RECOMMENDED ⭐
**Free Tier:** 3GB/month, 3-day retention
**Vercel Integration:** Native integration available
**Why it's awesome:**
- Built specifically for modern log management
- SQL-based log querying (like a database!)
- Hosted Grafana dashboards included
- Excellent Vercel integration
- Much cheaper than competitors when you scale

**Setup:**
1. Go to Vercel Marketplace → Better Stack integration
2. Connect your account
3. Select projects to monitor
4. Logs appear automatically in Better Stack dashboard

### 2. GraphJSON - GREAT FOR DEVELOPERS 🔥
**Free Tier:** 50k events/month FOREVER
**Vercel Integration:** Native integration available
**Why it's awesome:**
- SQL notebook for log analysis
- Full-blown data visualization
- Anomaly detection alerts
- Easy filter groups
- Generous free tier

**Setup:**
1. Go to Vercel Marketplace → GraphJSON integration
2. Connect account and select projects
3. Use SQL queries to analyze your logs

### 3. FlexLogs - BUSINESS METRICS FOCUSED 📊
**Free Tier:** 5k events/month
**Why it's awesome:**
- Turns logs into business metrics
- No agents to install
- 3-minute setup
- Perfect for tracking user signups, conversions, etc.

### 4. AppLogs - JAVASCRIPT FOCUSED 💻
**Free Tier:** 5k logs/day, 3-day retention
**Why it's awesome:**
- Built specifically for JavaScript apps
- TypeScript support
- Real-time monitoring
- Cross-platform (frontend, backend, serverless)

## 🤖 UptimeRobot Setup (Still FREE!)

UptimeRobot still has an excellent free tier:
- **50 monitors**
- **5-minute intervals**
- **Email alerts**
- **SMS alerts** (limited)

### Setup Steps:
1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Create free account
3. Add HTTP monitor: `https://your-domain.com/api/health`
4. Set 5-minute intervals
5. Add email alerts

## 🚀 Recommended Setup Combination

### For Most Projects:
**Better Stack + UptimeRobot**
- Better Stack: 3GB logs/month free
- UptimeRobot: 50 monitors free
- Total cost: $0

### For High-Traffic Projects:
**GraphJSON + UptimeRobot**
- GraphJSON: 50k events/month free
- UptimeRobot: 50 monitors free
- Total cost: $0

### For Business Analytics:
**FlexLogs + UptimeRobot**
- FlexLogs: Business metrics from logs
- UptimeRobot: Uptime monitoring
- Total cost: $0

## 📝 Updated Environment Variables

Update your `.env` file with your chosen service:

```env
# Better Stack (recommended)
BETTER_STACK_SOURCE_TOKEN=your-source-token

# Or GraphJSON
GRAPHJSON_API_KEY=your-api-key

# Or FlexLogs
FLEXLOGS_API_KEY=your-api-key

# UptimeRobot (optional webhook)
UPTIMEROBOT_WEBHOOK_URL=https://api.uptimerobot.com/v2/webhook
```

## 🔧 Code Updates Needed

Since we're moving away from Papertrail, let's update our logger:

### Option 1: Better Stack Integration
```typescript
// lib/logging/logger.ts - Better Stack version
import { createConsoleTransport } from '@betterstack/winston';

// Add Better Stack transport instead of Papertrail
if (process.env.BETTER_STACK_SOURCE_TOKEN) {
  const betterStackTransport = createConsoleTransport({
    sourceToken: process.env.BETTER_STACK_SOURCE_TOKEN,
  });
  transports.push(betterStackTransport);
}
```

### Option 2: Simple HTTP Transport (Works with all services)
```typescript
// lib/logging/logger.ts - Generic HTTP version
import { HttpTransport } from 'winston-transport-http';

// Generic HTTP transport for any logging service
if (process.env.LOGGING_ENDPOINT && process.env.LOGGING_API_KEY) {
  const httpTransport = new HttpTransport({
    host: process.env.LOGGING_ENDPOINT,
    headers: {
      'Authorization': `Bearer ${process.env.LOGGING_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  transports.push(httpTransport);
}
```

## 💰 Cost Comparison

| Service | Free Tier | Paid Plans Start |
|---------|-----------|------------------|
| ~~Papertrail~~ | ~~None~~ | ~~$5/month~~ |
| Better Stack | 3GB/month | $25/month |
| GraphJSON | 50k events/month | Contact for pricing |
| FlexLogs | 5k events/month | $29/month |
| AppLogs | 5k logs/day | $4/month |

## 🎯 Next Steps

1. **Choose your logging service** (I recommend Better Stack)
2. **Keep UptimeRobot** (still has great free tier)
3. **Update environment variables**
4. **Test the integration**
5. **Update your logger code** (if needed)

## 🧪 Testing Your Setup

```bash
# Test the updated monitoring setup
pnpm tsx scripts/test-monitoring-setup.ts

# Start your app
pnpm dev

# Check health endpoint
curl http://localhost:3000/api/health
```

## 🎉 Benefits of This Setup

✅ **$0 monthly cost** for most projects  
✅ **Better features** than Papertrail  
✅ **Native Vercel integration** for most services  
✅ **More generous free tiers**  
✅ **Modern, developer-friendly interfaces**  

## 📞 Support

If you need help choosing or setting up any of these services:
1. Better Stack has excellent documentation and support
2. GraphJSON has SQL-based querying (familiar to developers)
3. All services have Vercel marketplace integrations

**Bottom line:** You'll get better monitoring for FREE than what Papertrail was offering for $5/month! 🎯 