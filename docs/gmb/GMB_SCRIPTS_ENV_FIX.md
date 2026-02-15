# GMB Scripts Environment Variables Fix

## ✅ Fixed

All GMB scripts now automatically load environment variables from `.env.local` and `.env` files using `dotenv`.

**Updated Scripts:**
- `scripts/verify-gmb-credentials.js`
- `scripts/get-gmb-refresh-token.js`
- `scripts/get-gmb-account-location.js`
- `scripts/update-gbp-complete.js`

## 📋 How It Works

The scripts now:
1. Load `.env.local` first (higher priority)
2. Then load `.env` (lower priority, won't override .env.local)
3. Use environment variables from both files

## ✅ Testing

Run the verification script to test:

```bash
node scripts/verify-gmb-credentials.js
```

You should now see your credentials loaded from `.env.local` or `.env` files.

## 📝 Required Environment Variables

Make sure these are set in your `.env.local` or `.env` file:

```bash
GOOGLE_MY_BUSINESS_CLIENT_ID=your_client_id_here
GOOGLE_MY_BUSINESS_CLIENT_SECRET=your_client_secret_here
GOOGLE_MY_BUSINESS_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_MY_BUSINESS_ACCOUNT_ID=your_account_id_here
GOOGLE_MY_BUSINESS_LOCATION_ID=your_location_id_here
```

## 🔍 Troubleshooting

If credentials still aren't loading:

1. **Check file location:** Ensure `.env.local` or `.env` is in the project root (same directory as `package.json`)

2. **Check variable names:** Ensure variable names match exactly (case-sensitive)

3. **Check for typos:** No spaces around `=` sign:
   ```bash
   # ✅ Correct
   GOOGLE_MY_BUSINESS_CLIENT_ID=value
   
   # ❌ Wrong
   GOOGLE_MY_BUSINESS_CLIENT_ID = value
   ```

4. **Restart terminal:** After adding variables, restart your terminal/PowerShell

5. **Verify dotenv is installed:** Should already be installed, but you can check:
   ```bash
   npm list dotenv
   ```

## 🚀 Next Steps

Once credentials are loading correctly:

1. Run: `node scripts/verify-gmb-credentials.js` - Should show all credentials ✅
2. Run: `node scripts/update-gbp-complete.js` - Will update your GBP profile

