# Environment Variables Configuration

## Required Environment Variables

Copy this to your `.env.local` file and update with your actual values:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/hmnp_database"
DIRECT_URL="postgresql://postgres:password@localhost:5432/hmnp_database"

# Authentication & Security
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_PASSWORD="your-secure-admin-password-here"

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Google/Maps Configuration
GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project"}'

# GoHighLevel Integration
GHL_API_KEY="your-ghl-api-key"
GHL_LOCATION_ID="your-ghl-location-id"

# AI Services
GEMINI_API_KEY="your-gemini-api-key-here"

# Feature Flags
LAUNCHDARKLY_SERVER_SDK_KEY="your-launchdarkly-server-key"
NEXT_PUBLIC_LAUNCHDARKLY_CLIENT_SDK_KEY="your-launchdarkly-client-key"

# Redis Configuration (optional)
REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"

# Email Configuration
RESEND_API_KEY="your-resend-api-key"

# Application URLs
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"

# Business Configuration
BUSINESS_BASE_ZIP="77591"
BUSINESS_NAME="Houston Mobile Notary Pros"
BUSINESS_EMAIL="contact@houstonmobilenotarypros.com"
BUSINESS_PHONE="(832) 617-4285"

# Service Area Configuration
MAX_TRAVEL_DISTANCE_MILES="20"
BASE_TRAVEL_DISTANCE_MILES="15"
MILEAGE_RATE_PER_MILE="0.50"
```

## Security Notes

- Never commit actual values to version control
- Use Vercel's encrypted environment variables for production
- Rotate API keys regularly
- Use strong, unique passwords for ADMIN_PASSWORD
- Validate all environment variables at startup