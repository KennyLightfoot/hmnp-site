# How to Navigate to OAuth Consent Screen

## 🎯 Where to Go

The OAuth consent screen is on a **different page** than Credentials.

### Direct Link:
**https://console.cloud.google.com/apis/credentials/consent**

### Or Navigate Manually:

1. **From where you are now (Credentials page):**
   - Look at the **left sidebar**
   - Find **"OAuth consent screen"** (should be right above or below "Credentials")
   - Click on it

2. **Alternative navigation:**
   - Click **"APIs & Services"** in the left sidebar (the key icon)
   - You'll see a menu with:
     - Dashboard
     - **OAuth consent screen** ← Click this!
     - Credentials
     - Domain verification
   - Click **"OAuth consent screen"**

---

## 📋 What You'll See on OAuth Consent Screen Page

Once you're on the OAuth consent screen page, you'll see:

### Top Section: Publishing Status
- Shows if app is in "Testing" or "In production"
- Has a **"PUBLISH APP"** button (if in testing mode)

### Sections:
1. **App information** - App name, support email, etc.
2. **App domain** - Your website domain
3. **Authorized domains** - Domains that can use the app
4. **Scopes** - API permissions (should include GMB scope)
5. **Test users** ← **THIS IS WHAT YOU NEED!**
6. **Summary** - Overview of settings

---

## ✅ Adding Test Users (Step-by-Step)

### Step 1: Find "Test users" Section

On the OAuth consent screen page:
1. Scroll down past "Scopes"
2. Look for **"Test users"** section
3. You'll see:
   - Current test users (if any)
   - **"+ ADD USERS"** button

### Step 2: Add Your Email

1. Click **"+ ADD USERS"** button
2. A dialog/popup will appear
3. Enter your email: `houstonmobilenotarypros@gmail.com`
4. Click **"ADD"** (or "SAVE")
5. Your email should appear in the test users list

### Step 3: Save Changes

1. Scroll to the bottom of the page
2. Click **"SAVE AND CONTINUE"** or **"SAVE"** button
3. Wait 1-2 minutes for changes to take effect

---

## 🔍 If You Don't See "Test users" Section

### Possible Reasons:

1. **App is already published:**
   - If status shows "In production", you don't need test users
   - Anyone can use it
   - But you might still get the error if scopes aren't configured

2. **Wrong project:**
   - Make sure you're in the "HMNP" project
   - Check the project dropdown at the top

3. **OAuth consent screen not configured:**
   - You might need to complete the initial setup first
   - Fill in required fields (App name, support email, etc.)
   - Then you'll see the Test users section

---

## 📝 Quick Navigation Checklist

- [ ] Go to: https://console.cloud.google.com/apis/credentials/consent
- [ ] OR: Click "OAuth consent screen" in left sidebar
- [ ] Scroll to "Test users" section
- [ ] Click "+ ADD USERS"
- [ ] Add: `houstonmobilenotarypros@gmail.com`
- [ ] Click "ADD"
- [ ] Click "SAVE" at bottom of page
- [ ] Wait 1-2 minutes
- [ ] Try script again

---

## 🆘 Still Can't Find It?

### Check These:

1. **Are you in the right project?**
   - Top left should say "HMNP"
   - If not, click project dropdown and select "HMNP"

2. **Do you have an OAuth client created?**
   - If you haven't created an OAuth client yet, the consent screen might not be fully set up
   - Create an OAuth client first (which you've already done)

3. **Try the direct link:**
   - https://console.cloud.google.com/apis/credentials/consent
   - Make sure you're logged in with the right Google account

---

## 📸 What the Page Should Look Like

The OAuth consent screen page has:
- **Top:** Publishing status (Testing/In production)
- **Left sidebar:** Navigation menu
- **Main area:** 
  - App information form
  - Scopes list
  - **Test users section** (with "+ ADD USERS" button)
  - Save button at bottom

---

**Last Updated:** 2025-01-27

