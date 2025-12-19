# Google Docs Export — Implementation Plan

> **Status**: 📋 Planning
> **Created**: December 19, 2025

## Overview

Allow users to export generated docs directly to their Google Drive as Google Docs. The exported doc appears in their Google Drive, and we store a reference (with link) in our `generated_docs` record.

**Key UX**: User clicks "Save to Google Docs" → Doc appears in their Drive → They can open it from CleverKit or from Drive.

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

### Phase 1: Google Cloud & OAuth Foundation

- [ ] Create Google Cloud project
- [ ] Enable Google Docs API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth credentials
- [ ] Add environment variables
- [ ] Create `lib/integrations/google/` module structure

### Phase 2: Database & Backend

- [ ] Run SQL migrations (profiles + generated_docs columns)
- [ ] Update TypeScript types
- [ ] Create `POST /api/integrations/google/auth` (initiate OAuth)
- [ ] Create `GET /api/integrations/google/callback` (handle callback)
- [ ] Create `POST /api/integrations/google/disconnect`
- [ ] Create `lib/integrations/google/client.ts` (token management)
- [ ] Create `lib/integrations/google/docs.ts` (Docs API wrapper)

### Phase 3: Export Flow

- [ ] Create `POST /api/export/google-docs` route
- [ ] Update `lib/supabase/generated-docs.ts` with google fields
- [ ] Create `hooks/use-google-integration.ts`
- [ ] Handle token refresh logic

### Phase 4: UI Components

- [ ] Create `components/integrations/google-connect-modal.tsx`
- [ ] Create `components/integrations/google-connect-button.tsx`
- [ ] Update `doc-export-menu.tsx` with Google Docs option
- [ ] Update `doc-list-item.tsx` to show Google Docs link
- [ ] Create settings page section for connected apps

### Phase 5: Polish & Edge Cases

- [ ] Handle token expiration gracefully
- [ ] Handle disconnection (what happens to existing links?)
- [ ] Handle Google API errors
- [ ] Add loading states
- [ ] Test full flow end-to-end

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

## File Structure

```
lib/integrations/
├── types.ts                    # Shared integration types
├── google/
│   ├── config.ts              # OAuth config, scopes
│   ├── client.ts              # Token management
│   ├── docs.ts                # Google Docs API wrapper
│   ├── auth.ts                # OAuth flow helpers
│   └── index.ts               # Exports

app/api/integrations/google/
├── auth/route.ts              # POST: Initiate OAuth
├── callback/route.ts          # GET: OAuth callback
└── disconnect/route.ts        # POST: Revoke & delete

app/api/export/
└── google-docs/route.ts       # POST: Export doc to Google

components/integrations/
├── google-connect-modal.tsx   # First-time connect flow
├── google-connect-button.tsx  # Reusable connect button
├── connected-apps-list.tsx    # Settings page component
└── index.ts

hooks/
└── use-google-integration.ts  # Connection status, connect/disconnect
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

## Open Questions

| Question | Options | Decision |
|----------|---------|----------|
| Re-export behavior? | Create new doc vs update existing | TBD |
| Doc naming in Drive? | "[Brand] - Golden Circle" or configurable | TBD |
| Folder in Drive? | Root, or create "CleverKit" folder | TBD |
| What if token expires during export? | Auto-refresh or ask to reconnect | Auto-refresh |

---

## Related Documentation

- `14-GOOGLE_CLOUD_SETUP.md` — Step-by-step Google Cloud setup
- `12-DOCS_FEATURE.md` — Original docs feature plan
- `02-ARCHITECTURE.md` — System architecture

