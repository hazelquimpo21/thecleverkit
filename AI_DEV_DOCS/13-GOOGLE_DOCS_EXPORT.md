# Google Docs Export — Implementation Plan

> **Status**: ✅ **IMPLEMENTED** (December 19, 2025)
> **Created**: December 19, 2025

## Overview

Allow users to export generated docs directly to their Google Drive as Google Docs. The exported doc appears in their Google Drive, and we store a reference (with link) in our `generated_docs` record.

**Key UX**: User clicks "Save to Google Docs" → Doc appears in their Drive → They can open it from CleverKit or from Drive.

### Implementation Summary

All phases complete! The feature includes:
- Popup-based OAuth flow (doesn't disrupt user flow)
- Token management with automatic refresh
- Markdown to Google Docs conversion with formatting (headings, bold, italic, lists)
- Settings page with Connected Apps section
- Google Docs link shown in doc list after export

---

## Table of Contents

1. [Architecture Decision](#architecture-decision)
2. [User Flow](#user-flow)
3. [Data Model Changes](#data-model-changes)
4. [Implementation Phases](#implementation-phases)
5. [Google Cloud Setup Guide](#google-cloud-setup-guide)
6. [Security Considerations](#security-considerations)
7. [Future: Other Integrations](#future-other-integrations)

---

## Architecture Decision

### Auth Strategy: Separate OAuth (Not Login)

We're keeping magic link as the primary auth method and adding Google as a **connected integration** for exports.

```
┌─────────────────────────────────────────────────────────────┐
│                     CleverKit Auth                          │
│                                                             │
│  Primary Login: Magic Link (Supabase Auth)                  │
│                                                             │
│  Connected Integrations:                                    │
│    ├── Google (for Docs/Drive export)                       │
│    ├── Notion (future)                                      │
│    └── Dropbox (future)                                     │
└─────────────────────────────────────────────────────────────┘
```

**Why this approach:**
- Not all users have/want Google accounts
- Export is optional functionality
- Modular — easy to add more integrations later
- User stays in control of what's connected
- Cleaner than forcing Google login for everyone

### OAuth Flow Architecture

```
User clicks "Save to Google Docs"
    │
    ├─── First time: ────────────────────────────────────────┐
    │                                                         │
    │    Modal: "Connect your Google account"                 │
    │        ↓                                                │
    │    Click [Connect Google]                               │
    │        ↓                                                │
    │    Popup: Google OAuth consent screen                   │
    │        ↓                                                │
    │    User grants permission                               │
    │        ↓                                                │
    │    Callback → Store refresh_token in profiles           │
    │        ↓                                                │
    │    Popup closes → Continue with export                  │
    │                                                         │
    ├─── Already connected: ─────────────────────────────────┤
    │                                                         │
    │    Use stored refresh_token                             │
    │        ↓                                                │
    │    Get fresh access_token                               │
    │        ↓                                                │
    │    Create Google Doc via API                            │
    │        ↓                                                │
    │    Store google_doc_id + google_doc_url                 │
    │        ↓                                                │
    │    Show success: "Saved! [Open in Google Docs]"         │
    │                                                         │
    └─────────────────────────────────────────────────────────┘
```

---

## User Flow

### Happy Path: First Export (Not Connected)

```
Brand Profile → Docs tab → View a doc
    │
    ▼
Click [Export ▾] → "Save to Google Docs"
    │
    ▼
Modal appears:
┌──────────────────────────────────────────┐
│  📄 Save to Google Docs                  │
│                                          │
│  Connect your Google account to save     │
│  docs directly to your Drive.            │
│                                          │
│  [🔗 Connect Google Account]  [Cancel]   │
│                                          │
│  ℹ️ We'll only access Google Docs.       │
│     We can't see your other files.       │
└──────────────────────────────────────────┘
    │
    ▼
Click [Connect Google Account]
    │
    ▼
Popup opens: Google OAuth consent
    │
    ▼
User clicks "Allow"
    │
    ▼
Popup closes, modal updates:
┌──────────────────────────────────────────┐
│  ✓ Google connected!                     │
│                                          │
│  Saving "Golden Circle: Acme Co"...      │
│  [████████████░░░░░░░░]                  │
└──────────────────────────────────────────┘
    │
    ▼
Doc created, modal shows:
┌──────────────────────────────────────────┐
│  ✅ Saved to Google Docs!                │
│                                          │
│  Your doc is now in your Google Drive.   │
│                                          │
│  [Open in Google Docs]  [Done]           │
└──────────────────────────────────────────┘
```

### Happy Path: Already Connected

```
Click [Export ▾] → "Save to Google Docs"
    │
    ▼
Brief loading state (1-2 seconds)
    │
    ▼
Toast: "Saved to Google Docs! [Open]"
    │
    ▼
Doc list item now shows Google Docs icon + link
```

### Viewing Exported Doc in Library

```
YOUR DOCS
┌────────────────────────────────────────────────────────────┐
│ 📄 Golden Circle  •  Dec 19, 2025                          │
│                                                            │
│ 🔗 Saved to Google Docs  [Open ↗]                         │
│                                                            │
│ [View] [Export ▾]                                          │
└────────────────────────────────────────────────────────────┘
```

### Disconnect Flow (Settings)

```
Settings → Connected Apps
    │
    ▼
┌──────────────────────────────────────────┐
│  Connected Apps                          │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ 🟢 Google                          │  │
│  │ Connected as jane@gmail.com        │  │
│  │                        [Disconnect]│  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ ⚪ Notion           [Connect]      │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

## Data Model Changes

### profiles Table Updates

Add columns for Google OAuth:

```sql
ALTER TABLE profiles ADD COLUMN google_refresh_token TEXT;
ALTER TABLE profiles ADD COLUMN google_email TEXT;
ALTER TABLE profiles ADD COLUMN google_connected_at TIMESTAMPTZ;
```

**Why store in profiles:**
- One Google account per user (not per brand)
- Easy to check connection status
- Easy to disconnect

**Security note:** Refresh tokens are sensitive. They're stored encrypted at rest in Supabase, but consider additional encryption if you're paranoid.

### generated_docs Table Updates

Add columns for Google Docs reference:

```sql
ALTER TABLE generated_docs ADD COLUMN google_doc_id TEXT;
ALTER TABLE generated_docs ADD COLUMN google_doc_url TEXT;
ALTER TABLE generated_docs ADD COLUMN google_exported_at TIMESTAMPTZ;
```

**Why these fields:**
- `google_doc_id`: The Google Docs document ID (for future updates)
- `google_doc_url`: Direct link to open the doc
- `google_exported_at`: When it was exported (useful for showing in UI)

### TypeScript Types

```typescript
// types/database.ts - update Profile type
export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  // ... existing fields
  google_refresh_token: string | null;
  google_email: string | null;
  google_connected_at: string | null;
};

// types/docs.ts - update GeneratedDoc type
export type GeneratedDoc = {
  // ... existing fields
  google_doc_id: string | null;
  google_doc_url: string | null;
  google_exported_at: string | null;
};
```

---

## Implementation Phases

### Phase 1: Google Cloud & OAuth Foundation ✅

- [x] Create Google Cloud project (user setup via `14-GOOGLE_CLOUD_SETUP.md`)
- [x] Enable Google Docs API + Drive API
- [x] Configure OAuth consent screen
- [x] Create OAuth credentials (Web application type)
- [x] Add environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [x] Create `lib/integrations/google/` module structure

### Phase 2: Database & Backend ✅

- [x] Run SQL migrations (`supabase/migrations/001_google_docs_export.sql`)
- [x] Update TypeScript types (`types/database.ts`, `types/docs.ts`)
- [x] Create `POST /api/integrations/google/auth` (returns OAuth URL for popup)
- [x] Create `GET /api/integrations/google/callback` (exchanges code, stores tokens)
- [x] Create `POST /api/integrations/google/disconnect` (revokes + deletes)
- [x] Create `GET /api/integrations/google/status` (check connection)
- [x] Create `lib/integrations/google/client.ts` (token exchange, refresh, revoke)
- [x] Create `lib/integrations/google/docs.ts` (Google Docs API with markdown conversion)

### Phase 3: Export Flow ✅

- [x] Create `POST /api/export/google-docs` route
- [x] Create `hooks/use-google-integration.ts` (React Query based)
- [x] Handle token refresh logic in `getValidAccessToken()`
- [x] Markdown to Google Docs formatting (H1-H3, bold, italic, lists)

### Phase 4: UI Components ✅

- [x] Create `components/integrations/google-connect-modal.tsx`
- [x] Create GoogleIcon SVG component
- [x] Update `doc-export-menu.tsx` with Google Docs option
- [x] Update `doc-list-item.tsx` to show Google Docs link after export
- [x] Create `/settings` page with Connected Apps section
- [x] Create OAuth success page (`/integrations/google/success`)
- [x] Create OAuth error page (`/integrations/google/error`)

### Phase 5: Polish & Edge Cases ✅

- [x] Handle token expiration gracefully (auto-refresh, prompt to reconnect)
- [x] Handle disconnection (links still work, user owns the doc)
- [x] Handle Google API errors (toast notifications)
- [x] Add loading states (connecting, exporting)
- [x] Suspense boundary for useSearchParams in error page

---

## Google Cloud Setup Guide

See `14-GOOGLE_CLOUD_SETUP.md` for step-by-step instructions.

---

## Security Considerations

### Token Storage

- Refresh tokens stored in Supabase (encrypted at rest)
- Access tokens are short-lived (1 hour), never stored
- RLS ensures users can only access their own tokens

### Scope Minimization

We only request:
- `https://www.googleapis.com/auth/documents` — Create/edit docs
- `https://www.googleapis.com/auth/drive.file` — Access files we create

We explicitly do NOT request:
- Full Drive access
- Email/contacts access
- Any other Google services

### User Transparency

- Clear messaging about what we access
- Easy disconnect option in settings
- Show which Google account is connected

### Token Revocation

When user disconnects:
1. Revoke token with Google
2. Delete from our database
3. Keep Google Doc links (they still work, user owns the doc)

---

## File Structure (As Implemented)

```
lib/integrations/
├── types.ts                    # IntegrationStatus type ✅
├── index.ts                    # Exports ✅
└── google/
    ├── config.ts              # OAuth config, scopes, buildGoogleAuthUrl() ✅
    ├── client.ts              # exchangeCodeForTokens, refreshAccessToken, getValidAccessToken ✅
    ├── docs.ts                # createGoogleDoc with markdown conversion ✅
    └── index.ts               # Exports ✅

app/api/integrations/google/
├── auth/route.ts              # POST: Returns OAuth URL for popup ✅
├── callback/route.ts          # GET: Exchanges code, stores tokens ✅
├── disconnect/route.ts        # POST: Revokes token, clears from DB ✅
└── status/route.ts            # GET: Returns connection status ✅

app/api/export/
└── google-docs/route.ts       # POST: Creates Google Doc, stores reference ✅

app/integrations/google/
├── success/page.tsx           # OAuth success (closes popup, notifies parent) ✅
└── error/page.tsx             # OAuth error page ✅

app/settings/
├── page.tsx                   # Settings page ✅
└── connected-apps-section.tsx # Google integration management ✅

components/integrations/
├── google-connect-modal.tsx   # Modal for first-time connect ✅
├── index.ts                   # Exports GoogleConnectModal, GoogleIcon ✅

hooks/
├── use-google-integration.ts  # React Query hook for status/connect/disconnect ✅
└── index.ts                   # Exports ✅
```

---

## Future: Other Integrations

This architecture makes it easy to add:

### Notion
```
lib/integrations/notion/
├── config.ts
├── client.ts
├── pages.ts      # Notion Pages API
└── index.ts
```

### Google Slides
```
lib/integrations/google/
├── slides.ts     # Add to existing google module
```

### Dropbox
```
lib/integrations/dropbox/
├── config.ts
├── client.ts
├── files.ts
└── index.ts
```

The pattern is consistent:
1. OAuth config + scopes
2. Token management (client.ts)
3. API wrapper (docs.ts, pages.ts, etc.)
4. Export route
5. UI components

---

## Decisions Made

| Question | Decision | Notes |
|----------|----------|-------|
| Re-export behavior? | Create new doc each time | Simple, no update conflicts |
| Doc naming in Drive? | Uses doc title directly | e.g., "Golden Circle: Acme Co" |
| Folder in Drive? | Root folder | Simpler UX, user can organize |
| What if token expires during export? | Auto-refresh | `getValidAccessToken()` handles this |

---

## Related Documentation

- `14-GOOGLE_CLOUD_SETUP.md` — Step-by-step Google Cloud setup
- `12-DOCS_FEATURE.md` — Original docs feature plan
- `02-ARCHITECTURE.md` — System architecture

