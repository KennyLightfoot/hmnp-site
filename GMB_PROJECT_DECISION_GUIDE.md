# GMB Project Decision Guide

## Why It Matters

**YES, it absolutely matters which project you use!**

- OAuth Client ID/Secret from Project A won't work with APIs enabled in Project B
- All credentials must be from the **same project**
- Mixing projects = authentication errors

## Your Projects Analysis

Based on your project list, here are the best options:

### Option 1: "Google my business" Project ⭐ RECOMMENDED

**Project ID:** `spheric-backup-465705-h4`

**Why this is best:**
- ✅ Name suggests it's already set up for GMB
- ✅ Likely already has Google My Business API enabled
- ✅ Keeps GMB credentials separate from other services
- ✅ Easier to manage permissions

**Check if it has GMB API:**
1. Switch to this project
2. Go to: https://console.cloud.google.com/apis/library
3. Search "Google My Business API"
4. If you see "API enabled" → Use this project!
5. If not → Enable it (takes 30 seconds)

### Option 2: "HMNP" Project (Main Business)

**Project ID:** `hmnp-6aa08`

**Why this could work:**
- ✅ Your main business project
- ✅ Centralizes all business APIs
- ✅ Good for your future app/automation plans
- ✅ Easier to manage everything in one place

**Use this if:**
- You want everything centralized
- You're building an app that will use multiple Google APIs
- You prefer managing one project instead of many

### Option 3: "HMNP-1-FR" Project

**Project ID:** `hmnp-1-fr`

**Why this might work:**
- ✅ Another main business project
- ✅ Might already have some APIs enabled

**Use this if:**
- It already has GMB API enabled
- You prefer this over "HMNP"

## How to Check Which Project Has GMB API Enabled

### Quick Check Method:

1. **For each project, do this:**
   - Switch to the project (click project dropdown → select project)
   - Go to: https://console.cloud.google.com/apis/library
   - Search: "Google My Business API"
   - Look for:
     - ✅ "API enabled" = Good to use
     - ❌ "Enable" button = Not enabled yet

2. **Check these projects first:**
   - "Google my business" (most likely)
   - "HMNP"
   - "HMNP-1-FR"

### What You Need Enabled:

- ✅ Google My Business API
- ✅ Google My Business Business Information API (newer version)

## My Recommendation

**Use "Google my business" project** because:
1. It's likely already set up
2. Name suggests it's for this purpose
3. Keeps GMB separate from other services
4. Less chance of conflicts

**If "Google my business" doesn't have the API enabled**, then use **"HMNP"** (your main business project) and enable the API there.

## Step-by-Step Decision Process

### Step 1: Check "Google my business" Project

1. Switch to: "Google my business"
2. Go to: https://console.cloud.google.com/apis/library
3. Search: "Google My Business API"
4. **If enabled:** ✅ Use this project! Skip to Step 3
5. **If not enabled:** Continue to Step 2

### Step 2: Enable API (if needed)

**Option A: Enable in "Google my business"**
- Click "Enable" button
- Wait 30 seconds
- ✅ Use this project

**Option B: Use "HMNP" instead**
- Switch to "HMNP" project
- Enable Google My Business API there
- ✅ Use "HMNP" project

### Step 3: Create/Find OAuth Client

1. In your chosen project, go to: https://console.cloud.google.com/apis/credentials
2. Look for existing OAuth 2.0 Client ID
3. **If exists:** Use that Client ID and Secret
4. **If not:** Create new OAuth 2.0 Client ID
   - Application type: "Web application"
   - Name: "GMB API Client" (or similar)
   - Authorized redirect URIs: `http://localhost:8080/callback`
   - Save

### Step 4: Update Environment Variables

Use the Client ID and Secret from the project you chose:

```bash
# In .env.local
GOOGLE_MY_BUSINESS_CLIENT_ID=from_your_chosen_project
GOOGLE_MY_BUSINESS_CLIENT_SECRET=from_your_chosen_project
```

## Quick Decision Tree

```
Do you want everything in one project?
├─ YES → Use "HMNP" project
│   └─ Enable GMB API if needed
│
└─ NO → Use "Google my business" project
    └─ Enable GMB API if needed
```

## Important Notes

1. **Once you choose a project, stick with it** - Don't mix credentials from different projects
2. **All GMB-related credentials must be from the same project**
3. **You can always switch projects later**, but you'll need to:
   - Create new OAuth client in new project
   - Update all environment variables
   - Re-generate refresh token

## Still Confused?

**Just use "Google my business" project** - it's the safest bet and most likely already configured correctly.

