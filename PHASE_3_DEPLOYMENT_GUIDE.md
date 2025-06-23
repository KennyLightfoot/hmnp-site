# Phase 3 Infrastructure Deployment Guide

## 🚀 Overview

This guide covers deploying the **Phase 3 Infrastructure Scaling & Performance** improvements:

- ✅ **Redis-based Rate Limiting** - Prevent abuse and ensure fair usage
- ✅ **Comprehensive Monitoring** - Prometheus metrics, alerting, and dashboards  
- ✅ **Intelligent Caching** - Multi-layered caching with automatic invalidation

## 📋 Prerequisites

### 1. Redis Setup

You'll need Redis for rate limiting and caching. Choose one option:

#### Option A: Upstash Redis (Recommended for Vercel)
1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and Token

#### Option B: Redis Cloud
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create a new database
3. Copy the connection URL

#### Option C: Self-hosted Redis
```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# Or install locally
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis
```

### 2. Environment Variables

Add these to your `.env.local` and Vercel environment:

```env
# Redis Configuration (choose one)
REDIS_URL="redis://localhost:6379"  # Local Redis
# OR
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"  # Upstash
UPSTASH_REDIS_REST_TOKEN="your-token"

# Monitoring & Alerting (optional)
ALERT_EMAIL="admin@yourdomain.com"
SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Monitoring Authentication
METRICS_AUTH_TOKEN="your-secure-token-here"
```

## 🔧 Installation Steps

### 1. Install Dependencies

The dependencies are already added to `package.json`. Run:

```bash
pnpm install
```

### 2. Create Missing Library Files

Since the TypeScript files weren't created in the previous response, you'll need to create them:

```bash
# Create the lib directory structure
mkdir -p lib

# Create placeholder files (you'll need to implement these based on the examples)
touch lib/redis.ts
touch lib/rate-limiting.ts  
touch lib/comprehensive-monitoring.ts
touch lib/intelligent-caching.ts
```

### 3. Implement the Core Libraries

Copy the implementations from the conversation above into these files:

- `lib/redis.ts` - Redis client with connection pooling
- `lib/rate-limiting.ts` - Advanced rate limiting system
- `lib/comprehensive-monitoring.ts` - Monitoring and metrics
- `lib/intelligent-caching.ts` - Multi-layered caching

### 4. Test Local Setup

```bash
# Start Redis (if running locally)
redis-server

# Start your development server
pnpm dev

# Test the monitoring endpoint
curl http://localhost:3000/api/metrics
```

## 🚀 Deployment

### Vercel Deployment

1. **Set Environment Variables**:
   ```bash
   # Set Redis configuration
   vercel env add UPSTASH_REDIS_REST_URL
   vercel env add UPSTASH_REDIS_REST_TOKEN
   
   # Set monitoring configuration
   vercel env add ALERT_EMAIL
   vercel env add METRICS_AUTH_TOKEN
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

### Docker Deployment

```dockerfile
# Add to your Dockerfile
FROM node:18-alpine

# Install Redis CLI for health checks
RUN apk add --no-cache redis

# Your existing Docker setup...

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1
```

## 📊 Monitoring Setup

### 1. Prometheus Integration

Add this to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'hmnp-site'
    static_configs:
      - targets: ['your-domain.com']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
    scrape_timeout: 10s
    headers:
      Authorization: 'Bearer YOUR_METRICS_AUTH_TOKEN'
```

### 2. Grafana Dashboard

Import this JSON for a basic dashboard:

```json
{
  "dashboard": {
    "title": "HMNP Site Monitoring",
    "panels": [
      {
        "title": "HTTP Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{route}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph", 
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "cache_hit_rate",
            "legendFormat": "Hit Rate %"
          }
        ]
      }
    ]
  }
}
```

### 3. Alerting Rules

Add to your `alerting_rules.yml`:

```yaml
groups:
  - name: hmnp-site
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          
      - alert: CacheMissRate
        expr: cache_hit_rate < 0.8
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Cache hit rate below 80%"
```

## 🔍 Testing & Validation

### 1. Rate Limiting Test

```bash
# Test rate limiting
for i in {1..10}; do
  curl -w "%{http_code}\n" http://localhost:3000/api/services
  sleep 0.1
done
```

### 2. Monitoring Test

```bash
# Check metrics endpoint
curl http://localhost:3000/api/metrics

# Check admin monitoring (requires authentication)
curl -H "Authorization: Bearer your-token" \
  http://localhost:3000/api/admin/monitoring
```

### 3. Cache Test

```bash
# First request (cache miss)
time curl http://localhost:3000/api/services

# Second request (cache hit - should be faster)
time curl http://localhost:3000/api/services
```

## 📈 Performance Optimization

### 1. Redis Optimization

```bash
# Redis configuration for production
redis-cli CONFIG SET maxmemory 256mb
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET save "900 1 300 10 60 10000"
```

### 2. Cache Warming

Add cache warming to your deployment:

```javascript
// In your deployment script
await caches.app.warm('services:active', () => getServicesFromDB());
await caches.app.warm('pricing:standard', () => getPricingData());
```

### 3. Rate Limit Tuning

Adjust rate limits based on your traffic:

```javascript
// In lib/rate-limiting.ts
export const rateLimitConfigs = {
  api: { windowMs: 60000, maxRequests: 200 }, // Increased for high traffic
  booking: { windowMs: 60000, maxRequests: 10 }, // Conservative for bookings
  // ... other configs
};
```

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   ```bash
   # Check Redis connectivity
   redis-cli ping
   
   # Check environment variables
   echo $REDIS_URL
   ```

2. **High Memory Usage**
   ```bash
   # Check Redis memory usage
   redis-cli INFO memory
   
   # Clear cache if needed
   curl -X DELETE http://localhost:3000/api/admin/monitoring/cache?clearAll=true
   ```

3. **Rate Limiting Too Aggressive**
   ```javascript
   // Temporarily disable rate limiting for debugging
   const rateLimitResult = { allowed: true, remaining: 100, resetTime: new Date() };
   ```

### Monitoring Alerts

Check these if you're getting alerts:

- **High Error Rate**: Check application logs and database connectivity
- **High Response Time**: Check database performance and cache hit rates  
- **Cache Miss Rate**: Verify Redis connectivity and cache warming

## 📚 Additional Resources

- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [Prometheus Monitoring](https://prometheus.io/docs/guides/getting-started/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
- [Next.js Monitoring](https://nextjs.org/docs/advanced-features/monitoring)

## 🎯 Next Steps

After successful deployment:

1. **Monitor Performance**: Watch your dashboards for the first 24-48 hours
2. **Tune Rate Limits**: Adjust based on actual traffic patterns
3. **Optimize Cache TTLs**: Monitor hit rates and adjust cache durations
4. **Set Up Alerts**: Configure email/Slack notifications for critical issues
5. **Scale Redis**: Consider Redis cluster for high-traffic scenarios

---

**Need Help?** Check the logs at `/api/admin/monitoring` or review the integration examples in `lib/integration-example.ts`. 