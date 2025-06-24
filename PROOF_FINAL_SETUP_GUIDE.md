# 🚀 Proof.com Final Setup Guide
## Houston Mobile Notary Pros - Complete Your RON Integration

### 📋 **Current Status**
- ✅ **API Key:** `wVc8ni3bWaEvZNQBBM215h1v`
- ✅ **Organization ID:** `ord7g866b`
- ⏳ **Missing:** Webhook Secret
- ⏳ **Verify:** Production vs Sandbox Environment

---

## 🔍 **Step 1: Verify Your Environment**

Your API key format suggests this might be sandbox. Let's verify:

### **Test Your API Connection**
```bash
# Test 1: Check if your credentials work
curl -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" \
     -H "Content-Type: application/json" \
     https://api.proof.com/v2/organizations/ord7g866b

# Test 2: If production fails, try sandbox
curl -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" \
     -H "Content-Type: application/json" \
     https://api.fairfax.proof.com/v2/organizations/ord7g866b
```

### **Expected Responses:**
- **✅ Success (200):** Your credentials work
- **❌ 401 Unauthorized:** API key is invalid
- **❌ 404 Not Found:** Organization ID is wrong
- **❌ Connection refused:** Wrong base URL (try sandbox)

---

## 🏗️ **Step 2: Access Your Proof Dashboard**

### **Login Options:**
1. **Production:** [https://app.proof.com](https://app.proof.com)
2. **Sandbox:** [https://app.fairfax.proof.com](https://app.fairfax.proof.com)

**💡 Try sandbox first if production doesn't work**

---

## 🔗 **Step 3: Find Webhook Configuration**

Once logged in, look for webhooks in these locations:

### **Option A: Main Navigation**
- Look for **"Developers"** or **"API"** tab
- Click **"Webhooks"** or **"Webhook Configuration"**

### **Option B: Settings Menu**
- Go to **Settings** → **Integrations** → **Webhooks**
- Or **Settings** → **API** → **Webhooks**

### **Option C: Account/Organization Settings**
- **Account Settings** → **API & Webhooks**
- **Organization** → **Developer Tools**

---

## ⚙️ **Step 4: Create/Configure Webhook**

### **Webhook Settings:**
```
Webhook URL: https://houstonmobilenotarypros.com/api/webhooks/proof
Method: POST
Content-Type: application/json
```

### **Events to Subscribe:**
```
✅ transaction.created
✅ transaction.status.updated
✅ transaction.completed
✅ transaction.expired
✅ transaction.canceled
✅ meeting.started
✅ meeting.ended
✅ user.failed.transaction
```

### **After Creating:**
1. **Copy the webhook secret** (format: `whsec_xxxxxxxxxxxxx`)
2. **Test the webhook** (most dashboards have a "Test" button)
3. **Save the configuration**

---

## 🔧 **Step 5: Update Your Environment**

### **If Production Environment:**
Update `.env.local`:
```env
PROOF_API_KEY=wVc8ni3bWaEvZNQBBM215h1v
PROOF_API_BASE_URL=https://api.proof.com
PROOF_WEBHOOK_SECRET=whsec_your_webhook_secret_here
PROOF_ORGANIZATION_ID=ord7g866b
PROOF_ENVIRONMENT=production
```

### **If Sandbox Environment:**
Update `.env.local`:
```env
PROOF_API_KEY=wVc8ni3bWaEvZNQBBM215h1v
PROOF_API_BASE_URL=https://api.fairfax.proof.com
PROOF_WEBHOOK_SECRET=whsec_your_webhook_secret_here
PROOF_ORGANIZATION_ID=ord7g866b
PROOF_ENVIRONMENT=sandbox
```

---

## 🧪 **Step 6: Test Your Integration**

### **Test Webhook Endpoint:**
```bash
# Test that your webhook endpoint is accessible
curl -I https://houstonmobilenotarypros.com/api/webhooks/proof
# Should return: 405 Method Not Allowed (because we're using GET instead of POST)
```

### **Test Complete Flow:**
1. **Start your development server:** `pnpm dev`
2. **Create a test RON booking** on your site
3. **Upload a test document**
4. **Start RON session** (creates Proof transaction)
5. **Check webhook logs** for status updates

---

## 🚨 **Troubleshooting Guide**

### **Can't Find Webhooks in Dashboard?**
- Contact Proof support: support@proof.com
- Ask specifically: "Where do I configure webhooks in my dashboard?"
- Mention your organization ID: `ord7g866b`

### **API Key Not Working?**
- **Check environment:** Try both production and sandbox URLs
- **Verify permissions:** Your API key might need webhook permissions
- **Contact support:** They can verify your key status

### **Webhook Secret Not Visible?**
- Some dashboards hide secrets after creation
- Look for **"Regenerate Secret"** or **"Show Secret"** buttons
- You might need to create a new webhook to see the secret

---

## 📞 **Proof Support Contacts**

### **General Support:**
- **Email:** support@proof.com
- **Documentation:** [dev.proof.com](https://dev.proof.com)

### **What to Tell Support:**
```
Subject: Webhook Configuration Help - Organization ord7g866b

Hi Proof Support,

I'm setting up webhooks for RON integration with Houston Mobile Notary Pros.

Organization ID: ord7g866b
API Key: wVc8ni3bWaEvZNQBBM215h1v (first few chars)
Webhook URL: https://houstonmobilenotarypros.com/api/webhooks/proof

Questions:
1. Is this a production or sandbox environment?
2. Where do I configure webhooks in my dashboard?
3. How do I get the webhook signing secret?

Thank you!
```

---

## 🎯 **Next Steps After Webhook Setup**

Once you have the webhook secret:

1. **Update `.env.local`** with the webhook secret
2. **Deploy to production** (if using production credentials)
3. **Test end-to-end RON flow**
4. **Monitor webhook logs** for any issues
5. **Go live!** 🎉

---

## 🔍 **Quick Environment Detection**

Run this to determine your environment:
```bash
# Check which base URL works
curl -s -o /dev/null -w "%{http_code}" -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" https://api.proof.com/v2/organizations/ord7g866b
# If returns 200: Production
# If returns 401/404: Try sandbox

curl -s -o /dev/null -w "%{http_code}" -H "ApiKey: wVc8ni3bWaEvZNQBBM215h1v" https://api.fairfax.proof.com/v2/organizations/ord7g866b
# If returns 200: Sandbox
```

---

**🎯 You're 95% there! Just need that webhook secret and you're production-ready!** 