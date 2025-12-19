# Google Cloud Setup Guide

> **For**: Setting up Google OAuth for Google Docs export
> **Difficulty**: Beginner-friendly 🟢
> **Time**: ~15-20 minutes

This guide walks you through setting up Google Cloud so your app can create Google Docs on behalf of users.

---

## What We're Setting Up

```
┌─────────────────────────────────────────────────────────────┐
│                    Google Cloud Console                      │
│                                                              │
│  1. Project ──────────────► Container for everything         │
│                                                              │
│  2. APIs ─────────────────► Google Docs API enabled          │
│                                                              │
│  3. OAuth Consent Screen ─► What users see when connecting   │
│                                                              │
│  4. Credentials ──────────► Client ID + Secret for your app  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Sign in with your Google account (use your business account if you have one)

3. Click the project dropdown at the top (might say "Select a project")

4. Click **"New Project"** in the popup

5. Fill in:
   - **Project name**: `CleverKit` (or whatever you want)
   - **Organization**: Leave as default or select your org
   - **Location**: Leave as default

6. Click **"Create"**

7. Wait ~30 seconds for project creation

8. Make sure your new project is selected in the dropdown

---

## Step 2: Enable Google Docs API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**

2. Search for **"Google Docs API"**

3. Click on **"Google Docs API"** in the results

4. Click the big blue **"Enable"** button

5. Wait a few seconds for it to enable

**Also enable Google Drive API** (needed for creating files):

6. Go back to Library, search for **"Google Drive API"**

7. Click **"Enable"**

---

## Step 3: Configure OAuth Consent Screen

This is what users see when they connect their Google account to your app.

1. In left sidebar: **"APIs & Services"** → **"OAuth consent screen"**

2. Choose **"External"** (unless you have a Google Workspace org and only want internal users)

3. Click **"Create"**

4. Fill in the **App Information**:

   | Field | Value |
   |-------|-------|
   | App name | `CleverKit` |
   | User support email | Your email |
   | App logo | Optional (can add later) |

5. Fill in **App domain** (optional for testing, required for production):

   | Field | Value |
   |-------|-------|
   | Application home page | `https://your-domain.com` |
   | Privacy policy | `https://your-domain.com/privacy` |
   | Terms of service | `https://your-domain.com/terms` |

   > **For local testing**: You can leave these blank initially

6. **Developer contact information**: Add your email

7. Click **"Save and Continue"**

### Scopes

8. Click **"Add or Remove Scopes"**

9. In the filter, search for and check these scopes:

   | Scope | Description |
   |-------|-------------|
   | `.../auth/documents` | See, create, and edit Google Docs |
   | `.../auth/drive.file` | See and manage files created by this app |

   > **Important**: These are NOT sensitive scopes. You won't need expensive security review.

10. Click **"Update"** then **"Save and Continue"**

### Test Users (For Development)

11. Click **"Add Users"**

12. Add your email (and any team members testing)

13. Click **"Save and Continue"**

14. Review summary, click **"Back to Dashboard"**

> **Note**: While in "Testing" mode, only test users can use OAuth. When you're ready for production, you'll click "Publish App".

---

## Step 4: Create OAuth Credentials

1. In left sidebar: **"APIs & Services"** → **"Credentials"**

2. Click **"+ Create Credentials"** at the top

3. Select **"OAuth client ID"**

4. Choose **Application type**: **"Web application"**

5. **Name**: `CleverKit Web Client`

6. **Authorized JavaScript origins** — Add:
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```

7. **Authorized redirect URIs** — Add:
   ```
   http://localhost:3000/api/integrations/google/callback
   https://your-production-domain.com/api/integrations/google/callback
   ```

   > **Important**: These must match EXACTLY what your app sends. No trailing slashes!

8. Click **"Create"**

9. A popup shows your credentials:
   - **Client ID**: `xxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxx`

10. Click **"Download JSON"** to save a backup

11. Click **"OK"**

---

## Step 5: Add to Environment Variables

Add these to your `.env.local`:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/integrations/google/callback
```

For production (Vercel), add the same variables with production URLs.

---

## Step 6: Verify Your Setup

Run this checklist:

- [ ] Google Cloud project created
- [ ] Google Docs API enabled
- [ ] Google Drive API enabled
- [ ] OAuth consent screen configured
- [ ] Scopes added (documents, drive.file)
- [ ] Test users added (including yourself)
- [ ] OAuth credentials created (Web application)
- [ ] Redirect URIs configured (localhost + production)
- [ ] Environment variables added

---

## Understanding OAuth Flow

Here's what happens when a user clicks "Connect Google":

```
1. Your app redirects to:
   https://accounts.google.com/o/oauth2/v2/auth
   ?client_id=YOUR_CLIENT_ID
   &redirect_uri=YOUR_CALLBACK_URL
   &response_type=code
   &scope=https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive.file
   &access_type=offline        ← Important! Gets refresh token
   &prompt=consent             ← Important! Always shows consent screen

2. User sees Google's consent screen:
   ┌─────────────────────────────────────────┐
   │  CleverKit wants to:                    │
   │                                         │
   │  • See, create, and edit Google Docs    │
   │  • Manage files created by this app     │
   │                                         │
   │  [Cancel]              [Allow]          │
   └─────────────────────────────────────────┘

3. User clicks "Allow"

4. Google redirects to your callback with a code:
   /api/integrations/google/callback?code=AUTHORIZATION_CODE

5. Your backend exchanges the code for tokens:
   POST https://oauth2.googleapis.com/token
   → Returns: access_token + refresh_token

6. You store the refresh_token in the database

7. When exporting, use refresh_token to get fresh access_token
```

---

## Common Issues & Fixes

### "Access blocked: App not verified"

**Cause**: You haven't published your app or added yourself as test user.

**Fix**:
1. Go to OAuth consent screen
2. Add your email under "Test users"
3. OR publish the app (for production)

### "Redirect URI mismatch"

**Cause**: The redirect URI in your request doesn't match what's configured in Google Cloud.

**Fix**:
1. Check for typos (http vs https, trailing slashes)
2. Make sure localhost vs production URLs match
3. Add all variations you might need

### "Invalid client"

**Cause**: Wrong Client ID or Client Secret.

**Fix**: Double-check your `.env.local` values against Google Cloud Console.

### No refresh_token returned

**Cause**: Missing `access_type=offline` or user already authorized before.

**Fix**:
1. Always include `access_type=offline` in auth URL
2. Add `prompt=consent` to force re-consent and get new refresh token
3. Or have user revoke access at https://myaccount.google.com/permissions then retry

---

## Going to Production

When you're ready to launch:

### 1. Publish OAuth Consent Screen

1. Go to OAuth consent screen
2. Click **"Publish App"**
3. Status changes from "Testing" to "In production"

> **Note**: Since you're only using non-sensitive scopes (documents, drive.file), you don't need Google's security review. It goes live immediately.

### 2. Update Redirect URIs

Make sure your production URLs are in the Credentials settings.

### 3. Update Environment Variables

Add production credentials to Vercel:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (production URL)

### 4. (Optional) Get Verified

If you want to remove the "unverified app" warning:
1. Add privacy policy + terms pages to your site
2. Submit for verification in OAuth consent screen
3. Google reviews (takes a few days for non-sensitive scopes)

---

## Quota & Limits

Google Docs API has generous limits:

| Quota | Limit | Notes |
|-------|-------|-------|
| Requests per minute (per user) | 300 | More than enough |
| Requests per day (per project) | 10,000,000 | You won't hit this |

You can monitor usage in **"APIs & Services"** → **"Dashboard"**.

---

## Security Best Practices

1. **Never commit credentials** — Use environment variables
2. **Minimize scopes** — Only request what you need
3. **Use HTTPS in production** — Required by Google anyway
4. **Store refresh tokens securely** — Supabase encrypts at rest
5. **Handle token revocation** — User can revoke at any time
6. **Log OAuth events** — For debugging and security auditing

---

## Next Steps

Once you've completed this setup:

1. ✅ Google Cloud is ready
2. Next: Implement the OAuth flow (see `13-GOOGLE_DOCS_EXPORT.md`)
3. Then: Build the export UI

---

## Reference Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Docs API Documentation](https://developers.google.com/docs/api)
- [OAuth 2.0 for Web Apps](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google API Scopes Reference](https://developers.google.com/identity/protocols/oauth2/scopes)
- [Manage Third-Party Access](https://myaccount.google.com/permissions) (for testing revocation)

