# Environment Setup Guide

## Quick Start: Create `.env.local` file

The application requires environment variables to function. Create a `.env.local` file in the project root with the required variables.

## Required Variables for Development

### Database
```bash
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
```

### Authentication
```bash
NEXTAUTH_SECRET="your-32-character-minimum-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Stripe (for payment processing)
```bash
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Application URLs
```bash
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### Supabase
```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."
```

### GoHighLevel (CRM)
```bash
GHL_LOCATION_ID="your-location-id"
GHL_PRIVATE_INTEGRATION_TOKEN="your-token"
GHL_API_BASE_URL="https://services.leadconnectorhq.com"
```

### Email (Resend)
```bash
RESEND_API_KEY="re_..."
FROM_EMAIL="no-reply@yourdomain.com"
```

### AWS S3 (File Storage)
```bash
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."
AWS_REGION="us-east-1"
S3_BUCKET="your-bucket-name"
```

### Google Maps
```bash
GOOGLE_MAPS_API_KEY="AIza..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIza..."
```

### Agents + Admin Integration
These variables make the web app talk to the standalone agents service and protect the admin dashboards:
```bash
# URL to the agents HTTP server (default dev port is 4001)
AGENTS_BASE_URL="http://localhost:4001"

# Shared secret that protects agent webhooks (fallbacks to NEXTJS_API_SECRET if unset)
AGENTS_WEBHOOK_SECRET="super-strong-shared-secret"

# Secret used when Next.js calls the agents admin/review APIs
AGENTS_ADMIN_SECRET="agents-admin-secret"

# Back-compat name for the webhook secret. Keep this identical to AGENTS_WEBHOOK_SECRET.
NEXTJS_API_SECRET="super-strong-shared-secret"
```

After setting or updating these values, run the alignment checker to confirm the `hmnp` repo and the `agents/` repo agree on every secret:
```bash
pnpm check:agents-env
```
The script inspects `.env*` in both folders and fails fast if the webhook or admin secrets drift.

## Steps to Create `.env.local`

1. **Create the file** in the project root:
   ```bash
   touch .env.local
   ```

2. **Add your variables** to the file (see examples above)

3. **Verify the file exists**:
   ```bash
   ls -la .env.local
   ```

4. **Validate your configuration**:
   ```bash
   pnpm env:check
   ```
5. **If you are working on agents or automation features**, also run:
   ```bash
   pnpm check:agents-env
   ```

## Important Notes

- `.env.local` is in `.gitignore` and won't be committed to git
- For production, see `ENV_REFERENCE.md` for the complete list of variables
- Use `pnpm env:check` to validate your environment configuration
- Never commit secrets to git - use environment variables or secure secret management

## Complete Reference

For a complete list of all environment variables (required, optional, legacy), see `ENV_REFERENCE.md`.

