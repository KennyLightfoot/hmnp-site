# Notary Network Migration Instructions

## Prerequisites

1. Ensure you have a backup of your database
2. Have admin access to your database
3. Ensure `DATABASE_URL` is set in your `.env` file

## Step 1: Run Database Migration

```bash
pnpm prisma migrate dev --name add_notary_network_models
```

This will:
- Create `NotaryApplication` table
- Create `JobOffer` table
- Add new fields to `notary_profiles` table
- Add new fields to `Booking` table
- Create new enums for application status, onboarding status, etc.

## Step 2: Generate Prisma Client

```bash
pnpm prisma generate
```

This updates the Prisma client with the new models and types.

## Step 3: Verify Migration

Check that the following tables exist:
- `NotaryApplication`
- `JobOffer`

And that `notary_profiles` has the new fields:
- `onboarding_status`
- `eo_insurance_provider`
- `eo_insurance_policy`
- `eo_insurance_expiry`
- `background_check_status`
- `w9_on_file`
- `availability_status`
- etc.

## Step 4: Environment Variables

Ensure these are set (if not already):
- `RESEND_API_KEY` - For email notifications
- `ADMIN_EMAIL` - For admin notifications (defaults to admin@houstonmobilenotarypros.com)
- `NEXT_PUBLIC_BASE_URL` - Your site URL

## Step 5: Test the System

1. **Test Application Flow:**
   - Visit `/work-with-us`
   - Submit a test application
   - Check admin email for notification
   - Review application in `/admin/notary-applications`

2. **Test Job Offer Flow:**
   - Create a booking
   - Mark it "Send to Network" (via API or admin UI)
   - Verify offers are created for eligible notaries
   - Test accepting/declining offers

3. **Test Onboarding:**
   - Convert an approved application to a user
   - Log in as that notary
   - Visit `/notary/onboarding`
   - Complete the checklist

## Troubleshooting

### Migration Fails
- Check database connection
- Ensure no conflicting migrations
- Review Prisma migration logs

### Email Not Sending
- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- Review application logs

### Job Offers Not Creating
- Verify notaries have `onboarding_status: COMPLETE`
- Check `is_active: true` on notary profiles
- Verify geographic matching logic

## Rollback (if needed)

If you need to rollback:

```bash
pnpm prisma migrate reset
# Then restore from backup
```

**Warning:** This will delete all data. Only use if absolutely necessary.

