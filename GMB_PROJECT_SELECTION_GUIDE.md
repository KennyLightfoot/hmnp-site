# GMB Project Selection Guide

## Which Google Cloud Project Should You Use?

You have multiple Google Cloud projects. Here's how to choose the right one for GMB API:

### Option 1: Use Existing "Google my business" Project (Recommended)

If you have a project called "Google my business", use that one:
1. It's likely already set up for GMB API
2. May already have the API enabled
3. Keeps GMB-related credentials organized

### Option 2: Use Your Main Business Project

If you want everything in one place, use your main business project (probably "HMNP" or "HMNP-1-FR"):
1. Centralizes all business APIs
2. Easier to manage permissions
3. Better for your future app/automation plans

### Option 3: Create New Project

Create a dedicated project just for GMB:
1. Go to: https://console.cloud.google.com/
2. Click project dropdown → "New Project"
3. Name it: "HMNP Google My Business"
4. Create it

## How to Check Which Project Has GMB API Enabled

1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google My Business API"
3. Check each project to see which one has it enabled (green checkmark)
4. Use that project, OR enable it in your preferred project

## Important: Use the Same Project for Everything

Once you choose a project, use it for:
- ✅ OAuth Client ID/Secret
- ✅ API enablement
- ✅ All GMB-related credentials

**Don't mix projects** - your Client ID from one project won't work with APIs from another.

## Quick Setup Checklist

For whichever project you choose:

1. **Enable APIs:**
   - Google My Business API
   - Google My Business Business Information API

2. **Create/Use OAuth Client:**
   - Go to: APIs & Services → Credentials
   - Create OAuth 2.0 Client ID (or use existing)
   - Add redirect URI: `http://localhost:8080/callback`

3. **Set Environment Variables:**
   - Use the Client ID and Secret from THIS project
   - Add to `.env.local`

## Current Setup Issue

You're currently in "HMNP n8n Sheets" project. This might work IF:
- ✅ It has Google My Business API enabled
- ✅ You use OAuth credentials from this project

But it's better to use a project specifically for GMB or your main business project.

## Recommendation

**Use "Google my business" project if it exists**, OR **create a new dedicated project** for GMB. This keeps things organized and makes it easier to manage permissions and credentials.

