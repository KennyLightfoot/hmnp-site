# Complete List of APIs Required for HMNP Web App

**Last Updated:** 2025-01-27  
**Project:** Houston Mobile Notary Pros

---

## 🎯 Summary

**Total APIs Required:** 15+ APIs across multiple providers

**Recommendation:** Use **ONE Google Cloud Project ("HMNP")** for all Google APIs to avoid confusion.

---

## 📊 Google Cloud APIs (Use ONE Project)

### ✅ Required Google APIs

#### 1. **Google My Business API** ⭐ CRITICAL
- **Purpose:** Manage Google Business Profile (GBP)
- **What it does:**
  - Update business information
  - Manage categories and service areas
  - Post updates to GBP
  - Manage reviews and Q&A
- **Environment Variables:**
  - `GOOGLE_MY_BUSINESS_CLIENT_ID`
  - `GOOGLE_MY_BUSINESS_CLIENT_SECRET`
  - `GOOGLE_MY_BUSINESS_REFRESH_TOKEN`
  - `GOOGLE_MY_BUSINESS_ACCOUNT_ID`
  - `GOOGLE_MY_BUSINESS_LOCATION_ID`
- **OAuth Scope:** `https://www.googleapis.com/auth/business.manage`
- **Status:** ✅ Currently being set up

#### 2. **Google My Business Business Information API** ⭐ CRITICAL
- **Purpose:** Newer API for managing business information
- **What it does:**
  - Update business details
  - Manage locations
  - Update hours and attributes
- **Note:** This is the newer version of GMB API
- **Status:** ✅ Should be enabled alongside GMB API

#### 3. **Google Maps API** ⭐ CRITICAL
- **Purpose:** Location services, geocoding, distance calculation
- **What it does:**
  - Geocode addresses (convert address to coordinates)
  - Calculate distances for travel fees
  - Reverse geocoding (coordinates to address)
  - Places autocomplete
  - Service area validation
- **Environment Variables:**
  - `GOOGLE_MAPS_API_KEY` (server-side)
  - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (client-side)
- **API Services Used:**
  - Geocoding API
  - Distance Matrix API
  - Places API (Autocomplete)
  - Maps JavaScript API
- **Status:** ✅ Already in use

#### 4. **Google Calendar API** ⭐ CRITICAL
- **Purpose:** Calendar integration for availability
- **What it does:**
  - Create calendar events for bookings
  - Check availability
  - Sync with Google Calendar
- **Environment Variables:**
  - `GOOGLE_SERVICE_ACCOUNT_JSON` (service account credentials)
  - `GOOGLE_SERVICE_ACCOUNT_KEY` (alternative: path to key file)
- **OAuth Scope:** `https://www.googleapis.com/auth/calendar`
- **Status:** ✅ Already in use

#### 5. **Google Cloud Vertex AI API** ⭐ CRITICAL
- **Purpose:** AI chat system (Gemini model)
- **What it does:**
  - Power AI receptionist/chatbot
  - Generate intelligent responses
  - RAG (Retrieval-Augmented Generation)
  - Function calling for real-time data
- **Environment Variables:**
  - `GOOGLE_SERVICE_ACCOUNT_JSON` (shared with Calendar)
  - `GOOGLE_PROJECT_ID`
  - `GOOGLE_REGION` (e.g., `us-central1`)
  - `VERTEX_MODEL_ID` (e.g., `gemini-2.5-flash`)
  - `VERTEX_CHAT_PROMPT_ID` (optional)
  - `VERTEX_RAG_CORPUS` (optional)
- **Status:** ✅ Already in use

#### 6. **Google Analytics (GA4)** 📊
- **Purpose:** Website analytics and tracking
- **What it does:**
  - Track page views
  - User behavior analytics
  - Conversion tracking
- **Environment Variables:**
  - `NEXT_PUBLIC_GA_ID` (e.g., `G-XXXXXXXXXX`)
- **Status:** ✅ Already configured

#### 7. **Google Tag Manager (GTM)** 📊
- **Purpose:** Tag management for analytics/marketing
- **What it does:**
  - Manage tracking scripts
  - A/B testing tags
  - Marketing pixel management
- **Environment Variables:**
  - `NEXT_PUBLIC_GTM_ID` (e.g., `GTM-XXXXXXX`)
- **Status:** ✅ Already configured

#### 8. **Google Ads API** 📊
- **Purpose:** Conversion tracking for Google Ads
- **What it does:**
  - Track conversions from ads
  - Remarketing audiences
  - Offline conversion tracking
- **Environment Variables:**
  - `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID`
- **Status:** ✅ Already configured

---

## 🔵 Third-Party APIs (Non-Google)

### 9. **Stripe API** 💳 CRITICAL
- **Purpose:** Payment processing
- **What it does:**
  - Process deposits and payments
  - Handle payment intents
  - Webhook processing for payment events
  - Refund processing
- **Environment Variables:**
  - `STRIPE_SECRET_KEY`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- **Status:** ✅ Already in use

### 10. **GoHighLevel (GHL) API** 📞 CRITICAL
- **Purpose:** CRM, calendar, SMS, workflows
- **What it does:**
  - Create/update contacts
  - Manage appointments/calendar
  - Send SMS messages
  - Trigger workflows
  - Webhook handling
- **Environment Variables:**
  - `GHL_PRIVATE_INTEGRATION_TOKEN`
  - `GHL_LOCATION_ID`
  - `GHL_API_BASE_URL`
  - `GHL_DEFAULT_TEAM_MEMBER_ID`
- **Status:** ✅ Already in use

### 11. **Resend API** 📧 CRITICAL
- **Purpose:** Transactional email sending
- **What it does:**
  - Send booking confirmations
  - Send reminders
  - Send notifications
- **Environment Variables:**
  - `RESEND_API_KEY`
  - `FROM_EMAIL`
- **Status:** ✅ Already in use

### 12. **Proof.com API** 📄 LEGACY (Removed)
- **Purpose:** Remote Online Notarization (RON) platform (legacy)
- **Status:** ❌ **REMOVED** - RON is now handled via Notary Hub UI with its own environment variables
- **Note:** All `PROOF_*` environment variables have been removed from the codebase

### 13. **AWS S3 API** 📦 CRITICAL
- **Purpose:** File storage for uploaded documents
- **What it does:**
  - Store booking documents
  - Generate presigned URLs
  - Manage file uploads
- **Environment Variables:**
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_S3_BUCKET_NAME`
  - `AWS_REGION`
- **Status:** ✅ Already in use

### 14. **Supabase API** 🗄️ CRITICAL
- **Purpose:** Database and authentication
- **What it does:**
  - PostgreSQL database access
  - User authentication
  - Real-time subscriptions
- **Environment Variables:**
  - `DATABASE_URL` (Supabase PostgreSQL connection)
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- **Status:** ✅ Already in use

### 15. **Redis/Upstash API** ⚡ CRITICAL
- **Purpose:** Caching and job queues
- **What it does:**
  - Rate limiting
  - Cache API responses
  - Job queue management
  - Session storage
- **Environment Variables:**
  - `REDIS_URL` (Upstash Redis connection string)
- **Status:** ✅ Already in use

### 16. **Sentry API** 🐛 MONITORING
- **Purpose:** Error tracking and monitoring
- **What it does:**
  - Track application errors
  - Performance monitoring
  - Release tracking
- **Environment Variables:**
  - `SENTRY_DSN`
  - `SENTRY_AUTH_TOKEN`
  - `NEXT_PUBLIC_SENTRY_DSN`
- **Status:** ✅ Already configured

### 17. **LaunchDarkly API** 🚩 LEGACY (Removed)
- **Purpose:** Feature flag management (legacy)
- **Status:** ❌ **REMOVED** - No longer in use, all `LAUNCHDARKLY_*` environment variables have been removed

### 18. **Vercel Analytics API** 📊 ANALYTICS
- **Purpose:** Web vitals and analytics
- **What it does:**
  - Performance metrics
  - Web vitals tracking
  - Analytics dashboard
- **Note:** Built into Vercel, no separate API key needed
- **Status:** ✅ Already configured

---

## 📋 Google Cloud Console Setup Checklist

### For "HMNP" Project (Recommended)

Enable these APIs in Google Cloud Console:

1. ✅ **Google My Business API**
   - Go to: APIs & Services → Library
   - Search: "Google My Business API"
   - Click "Enable"

2. ✅ **Google My Business Business Information API**
   - Search: "Google My Business Business Information API"
   - Click "Enable"

3. ✅ **Google Maps Platform APIs**
   - Search: "Maps JavaScript API" → Enable
   - Search: "Geocoding API" → Enable
   - Search: "Distance Matrix API" → Enable
   - Search: "Places API" → Enable

4. ✅ **Google Calendar API**
   - Search: "Google Calendar API"
   - Click "Enable"

5. ✅ **Vertex AI API**
   - Search: "Vertex AI API"
   - Click "Enable"
   - Also enable: "Generative Language API" if needed

6. ✅ **Google Analytics API** (if programmatic access needed)
   - Usually not needed for basic GA4 tracking
   - Only enable if you need API access to analytics data

### OAuth Clients Needed

Create these OAuth 2.0 Clients in "HMNP" project:

#### OAuth Client 1: GMB API Client
- **Type:** Web application
- **Name:** "HMNP GMB API Client"
- **Redirect URIs:**
  - `http://localhost:8080/callback` (for scripts)
  - `http://localhost:3000/api/auth/callback/google` (for NextAuth local)
  - `https://houstonmobilenotarypros.com/api/auth/callback/google` (for NextAuth production)
- **Scopes:**
  - `https://www.googleapis.com/auth/business.manage`

#### OAuth Client 2: Calendar API Client (if using OAuth instead of service account)
- **Type:** Web application
- **Name:** "HMNP Calendar Client"
- **Scopes:**
  - `https://www.googleapis.com/auth/calendar`

**Note:** Calendar API is currently using Service Account (not OAuth), so you may not need this client.

### Service Accounts Needed

#### Service Account 1: Vertex AI & Calendar
- **Purpose:** Server-to-server authentication for Vertex AI and Calendar
- **Permissions:**
  - Vertex AI User
  - Calendar API access
- **Environment Variable:** `GOOGLE_SERVICE_ACCOUNT_JSON`

---

## 🎯 Quick Setup Guide

### Step 1: Choose Project
- **Use:** "HMNP" project (`hmnp-6aa08`)

### Step 2: Enable All Google APIs
Go to: https://console.cloud.google.com/apis/library

Enable:
1. Google My Business API ✅
2. Google My Business Business Information API ✅
3. Maps JavaScript API ✅
4. Geocoding API ✅
5. Distance Matrix API ✅
6. Places API ✅
7. Google Calendar API ✅
8. Vertex AI API ✅

### Step 3: Create OAuth Client
Go to: https://console.cloud.google.com/apis/credentials

Create OAuth 2.0 Client:
- Type: Web application
- Name: "HMNP Web App - All Services"
- Redirect URIs:
  - `http://localhost:8080/callback`
  - `http://localhost:3000/api/auth/callback/google`
  - `https://houstonmobilenotarypros.com/api/auth/callback/google`

### Step 4: Create Service Account (if needed)
Go to: IAM & Admin → Service Accounts

Create service account for:
- Vertex AI
- Calendar API

### Step 5: Update Environment Variables
Add all credentials to `.env.local` from the "HMNP" project.

---

## 📊 API Usage Summary

### Critical (Must Have)
1. Google My Business API ⭐
2. Google My Business Business Information API ⭐
3. Google Maps API ⭐
4. Google Calendar API ⭐
5. Vertex AI API ⭐
6. Stripe API ⭐
7. GoHighLevel API ⭐
8. Resend API ⭐
9. AWS S3 API ⭐
10. Supabase API ⭐
11. Redis/Upstash API ⭐

### Important (Should Have)
12. Google Analytics (GA4) 📊
13. Google Tag Manager 📊
14. Google Ads 📊
15. Sentry 🐛

### Legacy (Removed)
- Proof.com API ❌ (replaced by Notary Hub UI)
- LaunchDarkly ❌ (no longer in use)

### Optional (Nice to Have)
18. Vercel Analytics 📊 (built-in)

---

## 💰 Billing Considerations

### Google Cloud APIs (Free Tier Available)
- **Google My Business API:** Free (within limits)
- **Maps API:** $200/month free credit
- **Calendar API:** Free (within limits)
- **Vertex AI:** Pay per use (check pricing)

### Third-Party APIs
- **Stripe:** 2.9% + $0.30 per transaction
- **GoHighLevel:** Monthly subscription
- **Resend:** Free tier available
- **Proof.com:** Per-transaction pricing
- **AWS S3:** Pay per storage/requests
- **Supabase:** Free tier available
- **Upstash Redis:** Free tier available

---

## ✅ Action Items

1. **Consolidate to "HMNP" project** ✅
2. **Enable all Google APIs listed above** ✅
3. **Create OAuth client for GMB** ✅
4. **Verify service account for Vertex AI/Calendar** ✅
5. **Update all environment variables** ✅

---

## 📝 Notes

- **All Google APIs should be in ONE project** ("HMNP") to avoid confusion
- **OAuth clients can be shared** across multiple APIs if scopes allow
- **Service accounts** are better for server-to-server auth (Vertex AI, Calendar)
- **OAuth** is better for user-facing features (GMB management)

---

**Last Updated:** 2025-01-27

