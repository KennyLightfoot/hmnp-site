# 🔍 PRODUCTION DIAGNOSTIC PROMPT - IMMEDIATE ROOT CAUSE ANALYSIS

**Run these checks FIRST to identify what's broken:**

---

## 🚨 QUICK DIAGNOSIS (Run in 5 minutes)

### **1. Environment Variable Mismatch Analysis**

**The database error shows**: `db.unnyhvuhobnmxnpffore.supabase.co:5432`
**But your local .env shows**: Different Supabase URL

**IMMEDIATE CHECK:**
```bash
# In production, verify these match:
echo "Production DATABASE_URL:"
echo $DATABASE_URL

# Compare with your .env.local file
# Look for mismatch in database hostnames
```

**LIKELY CAUSE:** Production environment variables are pointing to wrong/old database

---

### **2. Services API Response Analysis**

**Error shows**: Frontend getting error objects instead of service data

**QUICK TEST:**
```bash
# Test services endpoint directly
curl -s https://houstonmobilenotarypros.com/api/services | jq .

# Should return:
# {
#   "success": true,
#   "services": [...],
#   "meta": {...}
# }

# If it returns error object, that's the problem
```

**LIKELY CAUSE:** Database connection failure causing API to return errors instead of data

---

### **3. Webhook Signature Issue**

**IMMEDIATE CHECK:**
```bash
# Verify Stripe webhook secret exists in production
vercel env ls | grep STRIPE_WEBHOOK_SECRET

# Check if webhook is registered in Stripe dashboard
# URL should be: https://houstonmobilenotarypros.com/api/webhooks/stripe
```

---

## 🎯 MOST LIKELY ROOT CAUSES

### **Scenario A: Environment Variable Sync Issue**
- Production has old/wrong DATABASE_URL
- Local environment works, production doesn't
- **FIX**: Update production environment variables

### **Scenario B: Supabase Database Issue**
- Database server is down/unreachable
- Connection limit exceeded
- **FIX**: Check Supabase dashboard, restart connection pool

### **Scenario C: Recent Deployment Broke Things**
- Last commit introduced breaking changes
- Database schema mismatch
- **FIX**: Rollback or hotfix

---

## ⚡ IMMEDIATE FIXES TO TRY

### **Fix 1: Update Production Environment Variables**
```bash
# If DATABASE_URL is wrong in production:
vercel env add DATABASE_URL
# Enter the correct URL from your .env.local

vercel env add STRIPE_WEBHOOK_SECRET
# Enter the correct webhook secret

# Redeploy
vercel --prod
```

### **Fix 2: Emergency Services API Fix**
```typescript
// In app/api/services/route.ts - add immediate fallback
export async function GET() {
  try {
    // Existing database logic...
  } catch (error) {
    // EMERGENCY: Return hardcoded services to unblock users
    return NextResponse.json({
      success: true,
      services: {
        all: [
          {
            id: 'emergency-standard',
            name: 'Standard Notary Service',
            price: 75,
            description: 'Standard notary service',
            type: 'STANDARD_NOTARY',
            isActive: true
          }
        ]
      },
      meta: { source: 'emergency_fallback' }
    });
  }
}
```

### **Fix 3: Database Connection Retry**
```typescript
// Add connection retry to handle temporary issues
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
});

// Test connection with retry
async function connectWithRetry() {
  for (let i = 0; i < 3; i++) {
    try {
      await prisma.$connect();
      return true;
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error);
      if (i === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

---

## 🔥 EMERGENCY ACTIONS (If Fixes Don't Work)

### **Option 1: Rollback Deployment**
```bash
# Find last working deployment
vercel deployments list

# Rollback to working version
vercel rollback [deployment-url]
```

### **Option 2: Enable Maintenance Mode**
```typescript
// Create app/maintenance/page.tsx
export default function Maintenance() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1>We'll be right back!</h1>
        <p>System maintenance in progress...</p>
        <p>Call (832) 617-4285 for immediate assistance</p>
      </div>
    </div>
  );
}

// Redirect all traffic to maintenance page temporarily
```

---

## 📊 SUCCESS VERIFICATION

**Once fixed, verify these work:**
```bash
# 1. Services API returns data
curl https://houstonmobilenotarypros.com/api/services | jq '.success'
# Should return: true

# 2. Database connection works
curl https://houstonmobilenotarypros.com/api/health/database
# Should return: {"status": "healthy"}

# 3. Frontend loads without errors
# Check browser console for no more service errors
```

---

**⏰ TARGET: Fix within 30 minutes to minimize customer impact!** 