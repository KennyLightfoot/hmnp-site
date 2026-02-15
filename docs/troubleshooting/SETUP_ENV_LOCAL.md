# Setting Up .env.local File

## Quick Setup Guide

This guide helps you set up your local development environment.

### Step 1: Create the .env.local file

Create the file in the project root:

```bash
touch .env.local
```

### Step 2: Add Required Variables

Open `.env.local` in your editor and add the minimum required variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Authentication
NEXTAUTH_SECRET="your-32-character-minimum-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NODE_ENV="development"

# Agents integration
AGENTS_BASE_URL="http://localhost:4001"
NEXTJS_API_SECRET="super-strong-shared-secret"
AGENTS_WEBHOOK_SECRET="super-strong-shared-secret" # keep in sync with NEXTJS_API_SECRET
AGENTS_ADMIN_SECRET="local-admin-secret"
```

> ℹ️ `NEXTJS_API_SECRET` is the fallback secret used by the webhook guards. If you prefer to keep webhook auth separate, still populate `NEXTJS_API_SECRET` and set `AGENTS_WEBHOOK_SECRET` to the same value so both repos stay aligned.

### Step 3: Validate Configuration

Run the environment checks:

```bash
pnpm env:check          # Validates Next.js vars
pnpm check:agents-env   # Ensures hmnp ↔ agents secrets match
```

This will show you which variables are missing or invalid.

### Step 4: Add Additional Variables as Needed

Based on the features you're working on, add:
- Stripe keys (for payment processing)
- Supabase keys (for database/auth)
- GHL keys (for CRM integration)
- AWS S3 keys (for file uploads)
- Google Maps keys (for location services)
- Resend API key (for emails)

See `ENV_REFERENCE.md` for the complete list.

## Important Notes

- `.env.local` is in `.gitignore` - it won't be committed to git (this is correct!)
- Make sure you're in the project root directory
- The file should be named exactly `.env.local` (with the dot at the beginning)
- Never commit secrets to git - always use environment variables
- Use `pnpm env:check` and `pnpm check:agents-env` to validate your configuration

## Complete Reference

For a complete list of all environment variables, see `ENV_REFERENCE.md`.

