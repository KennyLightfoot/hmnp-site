# External Cron Job Setup Guide

Since Vercel Hobby plan only allows daily cron jobs, here are alternatives for your frequent cron jobs:

## Option 1: GitHub Actions (Free)
Create `.github/workflows/cron-jobs.yml`:

```yaml
name: Cron Jobs
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
    - cron: '*/5 * * * *'  # Every 5 minutes
    - cron: '*/2 * * * *'  # Every 2 minutes
    - cron: '0 */2 * * *'  # Every 2 hours
    - cron: '*/15 * * * *' # Every 15 minutes

jobs:
  cron-tasks:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Vercel Cron Endpoints
        run: |
          curl -X POST https://your-vercel-domain.vercel.app/api/scheduler/init
          curl -X POST https://your-vercel-domain.vercel.app/api/scheduler/check
          curl -X POST "https://your-vercel-domain.vercel.app/api/queue?action=process"
          curl -X POST https://your-vercel-domain.vercel.app/api/cron/send-reminders
          curl -X POST https://your-vercel-domain.vercel.app/api/cron/process-payments
```

## Option 2: Cron-job.org (Free)
- Visit https://cron-job.org
- Create account and add your endpoints
- Set up the same schedules

## Option 3: Upstash QStash (Paid but cheap)
- Use Upstash QStash for reliable scheduling
- More reliable than free services

## Option 4: Upgrade to Vercel Pro ($20/month)
- Unlocks unlimited cron jobs
- Better for production applications

## Recommended for Your Use Case:
**Start with GitHub Actions** - it's free and reliable for most use cases. 