# Fix: Prisma Can't Find DATABASE_URL from .env.local

## The Problem
Prisma CLI doesn't automatically load `.env.local` files - it only loads `.env` by default.

## Solution: Use dotenv-cli

Since your project has `dotenv-cli` installed, use it to load `.env.local` when running Prisma commands:

### Run Migration with dotenv-cli:

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate dev --name add_notary_network_models
```

### Check Migration Status:

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate status
```

### Generate Prisma Client:

```bash
pnpm dotenv -e .env.local -- pnpm prisma generate
```

## Alternative: Rename to .env

If you prefer, you can rename `.env.local` to `.env`:

```bash
mv .env.local .env
```

Then Prisma will automatically load it:

```bash
pnpm prisma migrate dev --name add_notary_network_models
```

**Note:** Make sure you don't already have a `.env` file that you need to keep!

## Quick Test

Test that dotenv-cli works:

```bash
pnpm dotenv -e .env.local -- pnpm prisma migrate status
```

If this works without errors, you're all set!

