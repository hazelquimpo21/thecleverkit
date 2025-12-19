# Session Notes for AI Developers

> Last updated: December 19, 2025
> Status: Dashboard & Core MVP Complete. Docs + Google Docs Export Implemented. (Build Passing)

This document provides context for future AI developers working on this codebase. Read this first!

---

## Current Focus: Google Docs Export ✅

**Just implemented**: Full Google OAuth integration for exporting docs to Google Docs.

**See documentation:**
- `12-DOCS_FEATURE.md` - Docs feature implementation plan
- `13-GOOGLE_DOCS_EXPORT.md` - Google Docs export implementation plan
- `14-GOOGLE_CLOUD_SETUP.md` - Step-by-step Google Cloud setup guide

**What's now available:**
- Export any generated doc directly to Google Docs
- OAuth flow with popup-based connection
- Google connection status in Settings page
- Docs show "Saved to Google Docs" link after export
- Disconnect/reconnect Google anytime

**Key architecture decisions:**
- Separate OAuth (not tied to login) - more flexible
- Token stored in profiles table
- Google Doc reference stored in generated_docs table
- Modular integrations pattern (ready for Notion, etc.)

---

## What Was Built

The MVP core has been implemented with a working build. Here's what exists:

### Implemented (Build Passes)

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js 14 App Router setup | ✅ Complete | Using Turbopack |
| Supabase client configuration | ✅ Complete | Server + Browser + Admin clients |
| Database schema (SQL) | ✅ Complete | See `supabase/schema.sql` |
| TypeScript types | ✅ Complete | Proper Supabase typing with Insert/Update types |
| Three analyzers (basics, customer, products) | ✅ Complete | Full two-step AI flow |
| Analyzer runner/orchestration | ✅ Complete | Concurrent execution with dependency support |
| Web scraper | ✅ Complete | Homepage scraping with Cheerio |
| OpenAI GPT wrapper | ✅ Complete | Analysis + parsing with function calling |
| API route: `/api/brands/analyze` | ✅ Complete | Full analysis pipeline |
| API route: `/api/auth/callback` | ✅ Complete | Supabase auth callback |
| **shadcn/ui components** | ✅ Complete | Full suite with semantic CSS variables |
| **React Query (TanStack Query)** | ✅ Complete | Provider + hooks wired up |
| **Toast notifications (Sonner)** | ✅ Complete | Integrated with React Query mutations |
| Brand detail page | ✅ Complete | Shows analysis results |
| Home page | ✅ Complete | Add brand form |
| Logger utility | ✅ Complete | Emoji-rich, formatted logging |
| Auth UI (login page) | ✅ Complete | Magic link authentication |
| Auth hook (useAuth) | ✅ Complete | User state management |
| Header sign in/out | ✅ Complete | Shows login button or user menu |
| Route protection middleware | ✅ Complete | Protects /dashboard, /brands, /settings, /analyze |
| Auth-gated analysis flow | ✅ Complete | Smart login flow preserves user's URL intent |
| Realtime analysis updates | ✅ Complete | Auto-refresh with Supabase subscriptions + polling fallback |
| **Dashboard page** | ✅ Complete | Brand list with empty state, delete, navigation |
| **Brand cards** | ✅ Complete | Shows status, actions, links to detail |
| **Header navigation** | ✅ Complete | My Brands, Add Brand links for auth users |
| **Google Docs Export** | ✅ Complete | OAuth + Docs API integration |
| **Settings page** | ✅ Complete | Connected Apps management |

### Not Yet Implemented

| Feature | Priority | Notes |
|---------|----------|-------|
| **Docs Feature (Templates)** | **High** | Golden Circle template in progress - see `12-DOCS_FEATURE.md` |
| Edit forms for analysis data | Medium | View-only currently |
| Retry failed analyzers | Medium | API exists conceptually |
| Re-analyze brand | Medium | UI button disabled, needs API |
| Additional export integrations | Low | Notion, Slides (Google Docs done) |

---

## Key Files to Know

### Configuration & Types

| File | Purpose |
|------|---------|
| `types/database.ts` | **Critical** - Supabase table types + Insert/Update types |
| `types/analyzers.ts` | Parsed output types for each analyzer |
| `lib/supabase/server.ts` | Server-side Supabase client creation |
| `supabase/schema.sql` | Database schema - run this in Supabase SQL editor |
| `components.json` | **NEW** - shadcn/ui configuration |

### Authentication

| File | Purpose |
|------|---------|
| `hooks/use-auth.ts` | Auth hook - provides `user`, `isLoading`, `signOut` |
| `hooks/use-auth-gate.ts` | Auth gating hook - redirects to login with intent |
| `lib/utils/auth-intent.ts` | Saves/retrieves analysis intent across login |
| `components/auth/login-form.tsx` | Magic link login form component |
| `app/login/page.tsx` | Login page with auth redirect logic |
| `app/login/login-page-content.tsx` | Client component for intent-aware login UI |
| `app/analyze/page.tsx` | Post-login analysis continuation page |
| `middleware.ts` | Route protection (protects /dashboard, /brands, /settings, /analyze) |
| `components/layout/header.tsx` | Header with Sign In button / User menu |

### Core Business Logic

| File | Purpose |
|------|---------|
| `lib/analyzers/runner.ts` | Orchestrates concurrent analyzer execution |
| `lib/api/openai.ts` | GPT wrapper with `analyzeWithGPT()` and `parseWithGPT()` |
| `lib/scrapers/web-homepage/index.ts` | Homepage scraper |
| `app/api/brands/analyze/route.ts` | Main analysis endpoint |

### Providers & State Management (NEW)

| File | Purpose |
|------|---------|
| `lib/providers/index.tsx` | **NEW** - Composes all providers (Query, Tooltip, Toaster) |
| `lib/providers/query-provider.tsx` | **NEW** - React Query client configuration |
| `hooks/use-brands.ts` | **NEW** - React Query hooks for brand data |

### Dashboard Components (NEW)

| File | Purpose |
|------|---------|
| `app/dashboard/page.tsx` | Dashboard page (shows brand list) |
| `app/dashboard/dashboard-content.tsx` | Client component with React Query data fetching |
| `components/brands/brand-card.tsx` | Single brand card in list view |
| `components/brands/brand-empty-state.tsx` | Empty state for new users |
| `components/brands/delete-brand-dialog.tsx` | Confirmation dialog for brand deletion |

### Google Docs Integration (NEW - December 19, 2025)

| File | Purpose |
|------|---------|
| `lib/integrations/types.ts` | Shared integration types |
| `lib/integrations/google/config.ts` | OAuth scopes, URLs, buildAuthUrl() |
| `lib/integrations/google/client.ts` | Token exchange, refresh, revocation |
| `lib/integrations/google/docs.ts` | Google Docs API + markdown conversion |
| `app/api/integrations/google/auth/route.ts` | POST: Initiate OAuth |
| `app/api/integrations/google/callback/route.ts` | GET: OAuth callback |
| `app/api/integrations/google/disconnect/route.ts` | POST: Revoke tokens |
| `app/api/integrations/google/status/route.ts` | GET: Connection status |
| `app/api/export/google-docs/route.ts` | POST: Export doc to Google Docs |
| `hooks/use-google-integration.ts` | Hook for connect/disconnect/export |
| `components/integrations/google-connect-modal.tsx` | OAuth connect modal |
| `app/settings/page.tsx` | Settings with Connected Apps |

### Each Analyzer Module

```
lib/analyzers/{name}/
├── config.ts    # Metadata (id, name, icon)
├── prompt.ts    # Analysis prompt builder
├── parser.ts    # Function schema for structured extraction
├── types.ts     # TypeScript types for parsed output
└── index.ts     # Exports AnalyzerDefinition
```

---

## shadcn/ui Setup (NEW - December 19, 2025)

### What Was Installed

Full shadcn/ui component suite using Tailwind v4 with OKLCH colors:

**Core UI Components:**
- `button.tsx` - Primary, secondary, destructive, outline, ghost, link variants
- `card.tsx` - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `input.tsx` - Text input with error state support
- `badge.tsx` - Status badges with success, warning, error, info, muted, orange variants
- `skeleton.tsx` - Loading placeholder

**New Accessible Components (Radix UI primitives):**
- `label.tsx` - Form labels
- `checkbox.tsx` - Checkboxes with checked/unchecked states
- `dialog.tsx` - Modal dialogs with overlay
- `dropdown-menu.tsx` - Full dropdown menu system
- `tooltip.tsx` - Accessible tooltips
- `separator.tsx` - Visual dividers
- `sonner.tsx` - Toast notification wrapper

### CSS Variables (OKLCH Color System)

Colors are defined in `app/globals.css` using OKLCH for better color interpolation:

```css
:root {
  --background: oklch(0.985 0.002 75);      /* Warm cream */
  --foreground: oklch(0.147 0.004 49.25);   /* Dark text */
  --primary: oklch(0.646 0.222 41.116);     /* Orange accent */
  --muted: oklch(0.97 0.001 106.424);       /* Light gray */
  --destructive: oklch(0.577 0.245 27.325); /* Red */
  --success: oklch(0.648 0.15 160);         /* Green */
  --warning: oklch(0.769 0.188 70.08);      /* Amber */
  /* ... and more */
}
```

### Using Semantic Colors

**DO THIS:**
```tsx
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
<div className="text-muted-foreground">
<div className="border-border">
```

**DON'T DO THIS:**
```tsx
<div className="bg-stone-100 text-stone-900">  // Hardcoded colors
<div className="bg-orange-500 text-white">     // Use bg-primary instead
```

### Configuration File

`components.json` configures shadcn/ui for the project:

```json
{
  "style": "new-york",
  "tailwind": {
    "baseColor": "stone",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  }
}
```

---

## React Query Setup (NEW - December 19, 2025)

### Provider Architecture

The app is wrapped with providers in this order:

```
<QueryProvider>           ← React Query for server state
  <TooltipProvider>       ← Radix tooltip context
    {children}
    <Toaster />           ← Sonner toast notifications
  </TooltipProvider>
</QueryProvider>
```

### Query Client Configuration

Located in `lib/providers/query-provider.tsx`:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // Data fresh for 60s
      gcTime: 10 * 60 * 1000,      // Cache for 10 min
      retry: 1,                     // Single retry
      refetchOnWindowFocus: false,  // No refetch on tab switch
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        toast.error(error.message); // Global error toast
      },
    },
  },
});
```

### Available Hooks

All hooks exported from `hooks/index.ts`:

```typescript
// Brand data fetching
import {
  useBrands,        // Fetch all brands
  useBrand,         // Fetch single brand with analysis runs
  useCreateBrand,   // Create mutation with cache invalidation
  useDeleteBrand,   // Delete mutation
  usePrefetchBrand, // Prefetch for faster navigation
  brandKeys,        // Query key factory
} from '@/hooks';
```

### Query Key Structure

```typescript
// Query key factory for cache management
const brandKeys = {
  all: ['brands'],
  lists: () => [...brandKeys.all, 'list'],
  list: (filters) => [...brandKeys.lists(), filters],
  details: () => [...brandKeys.all, 'detail'],
  detail: (id) => [...brandKeys.details(), id],
};
```

### Using React Query Hooks

```typescript
// Fetch all brands
const { data: brands, isLoading, error } = useBrands();

// Fetch single brand
const { data: brand } = useBrand(brandId);

// Create brand mutation
const createBrand = useCreateBrand();
await createBrand.mutateAsync({ url: 'https://example.com' });

// Prefetch on hover
const prefetch = usePrefetchBrand();
<Link onMouseEnter={() => prefetch(brand.id)}>
```

### Toast Notifications

Using Sonner, imported from `@/components/ui/sonner`:

```typescript
import { toast } from '@/components/ui/sonner';

// Success
toast.success('Brand analysis started!');

// Error
toast.error('Failed to create brand');

// With description
toast.success('Complete', {
  description: 'All analyzers finished successfully',
});
```

---

## Important Gotchas & Fixes Applied

### 1. Supabase Type Errors

**Problem**: Supabase client operations returning `never` type errors.

**Root Cause**: The Database type wasn't properly structured for Supabase's expected format.

**Solution Applied**: Created explicit Insert/Update types and added required Supabase schema properties:

```typescript
// types/database.ts - Key structure:
export type Database = {
  public: {
    Tables: {
      brands: {
        Row: Brand;
        Insert: BrandInsert;        // Explicit insert type
        Update: BrandUpdate;        // Explicit update type
        Relationships: [...];       // Required by Supabase
      };
      // ...
    };
    Views: Record<string, never>;    // Required
    Functions: Record<string, never>; // Required
    Enums: {...};
    CompositeTypes: Record<string, never>; // Required
  };
};
```

**Key Insight**: When using Supabase queries, always cast results:
```typescript
const { data } = await supabase.from('brands').select('*').single();
return data as Brand; // Cast to proper type
```

### 2. OpenAI Function Schema Types

**Problem**: TypeScript errors with OpenAI's function calling parameter types.

**Solution Applied**: Cast schema to bypass strict typing:
```typescript
// lib/api/openai.ts
const response = await openai.chat.completions.create({
  tools: [{
    type: 'function',
    function: {
      name: functionName,
      parameters: schema as unknown as Record<string, unknown>, // Cast here
    },
  }],
  tool_choice: { type: 'function', function: { name: functionName } },
});
```

### 3. OpenAI tool_calls Access

**Problem**: TypeScript doesn't know `tool_calls[0].function` exists.

**Solution Applied**: Add type guard:
```typescript
const toolCall = choice.message.tool_calls?.[0];
if (!toolCall || toolCall.type !== 'function') {
  throw new Error('No function call in response');
}
const args = toolCall.function.arguments; // Now TypeScript knows it's a function type
```

### 4. Dynamic require() with TypeScript

**Problem**: `require()` doesn't support type arguments.

**Solution Applied**: Cast the require result:
```typescript
// lib/supabase/server.ts
const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
return createClient<Database>(url, key, {...});
```

### 5. Google Fonts Network Errors

**Problem**: Build failing due to Google Fonts network timeouts.

**Solution Applied**: Removed Google Fonts, using system fonts instead:
```typescript
// app/layout.tsx
<body className="font-sans antialiased">
```

### 6. Tailwind v4 with shadcn/ui (NEW)

**Problem**: shadcn/ui expects Tailwind v3 configuration.

**Solution Applied**:
- Use `@theme inline` directive in globals.css for Tailwind v4
- Define all CSS variables in `:root` with OKLCH values
- Map variables to Tailwind theme using `--color-*` convention

```css
@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* ... maps all CSS vars to Tailwind */
}
```

### 7. Badge Variant Type Safety (NEW)

**Problem**: Badge component used in status-badge.tsx needs `info` and `error` variants.

**Solution Applied**: Extended badge variants to include all status types:
```typescript
// components/ui/badge.tsx
variant: {
  default: '...',
  secondary: '...',
  destructive: '...',
  outline: '...',
  success: '...',    // Green
  warning: '...',    // Amber
  muted: '...',      // Gray
  error: '...',      // Same as destructive
  info: '...',       // Blue
  orange: '...',     // Primary tint
}
```

---

## Auth-Gated Analysis Flow

When an unauthenticated user tries to analyze a brand, we preserve their intent across the login flow:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER JOURNEY: Unauthenticated → Analyze Brand                               │
└─────────────────────────────────────────────────────────────────────────────┘

1. User enters URL on home page, clicks "Analyze Brand"
   └─→ useAuthGate hook detects user is not authenticated
       └─→ saveAnalysisIntent() stores URL to localStorage
           └─→ Redirect to /login?next=/analyze&intent=analyze

2. Login page detects intent=analyze
   └─→ LoginPageContent reads intent from localStorage
       └─→ Shows custom message: "Sign in to continue analyzing [URL]"

3. User signs in via magic link
   └─→ Auth callback redirects to /analyze (the 'next' param)

4. /analyze page loads (protected route, user now authenticated)
   └─→ AnalyzeContinuation reads intent from localStorage
       └─→ Shows URL with "Start Analysis" button
           └─→ User can edit URL or cancel

5. User clicks "Start Analysis"
   └─→ Calls /api/brands/analyze
       └─→ clearAnalysisIntent() clears localStorage
           └─→ Redirect to /brands/{brandId}
```

### Key Files

| File | Purpose |
|------|---------|
| `lib/utils/auth-intent.ts` | Save/load/clear analysis intent (localStorage) |
| `hooks/use-auth-gate.ts` | Hook to gate actions behind auth |
| `components/brands/add-brand-form.tsx` | Uses useAuthGate to check auth on submit |
| `app/login/login-page-content.tsx` | Shows intent-aware login UI |
| `app/analyze/analyze-continuation.tsx` | Post-login continuation flow |

### Design Decisions

1. **localStorage over URL params**: URL params can leak sensitive URLs in referrers/logs
2. **30-minute expiry**: Intent expires after 30 min to prevent stale data
3. **User can edit**: After login, user sees their URL and can change it
4. **Graceful degradation**: If localStorage unavailable, flow still works (just loses the URL)

---

## Realtime Analysis Updates

The brand profile page automatically updates as analyzers complete, without requiring manual refresh.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ARCHITECTURE: Realtime Analysis Updates                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│   Server Component │────▶│  Client Component  │────▶│   React UI         │
│   (Initial Load)   │     │  (Realtime Sub)    │     │   (Auto-updating)  │
└────────────────────┘     └────────────────────┘     └────────────────────┘
                                    │
                                    │ Supabase Realtime
                                    │ (WebSocket)
                                    ▼
                           ┌────────────────────┐
                           │   analysis_runs    │
                           │   (PostgreSQL)     │
                           └────────────────────┘
```

### How It Works

1. **Server Component** (`app/brands/[brandId]/page.tsx`)
   - Fetches initial brand + analysis runs on page load
   - Provides fast first paint and SEO benefits
   - Passes data to client component

2. **Client Component** (`components/brands/brand-analysis-content.tsx`)
   - Receives initial data from server
   - Uses `useBrandAnalysis` hook for state management
   - Subscribes to Supabase realtime via `useRealtimeAnalysis`

3. **Realtime Hook** (`hooks/use-realtime-analysis.ts`)
   - Creates Supabase channel for `analysis_runs` table
   - Filters by `brand_id` for this specific brand
   - Handles reconnection with exponential backoff
   - Falls back to polling if WebSocket fails

4. **Analysis Hook** (`hooks/use-brand-analysis.ts`)
   - Manages state for analysis runs
   - Computes derived values (isAnalyzing, isComplete, etc.)
   - Detects completion transition for celebration UX

### Key Files

| File | Purpose |
|------|---------|
| `hooks/use-realtime-analysis.ts` | Supabase realtime subscription hook |
| `hooks/use-brand-analysis.ts` | Analysis state management hook |
| `components/brands/brand-analysis-content.tsx` | Client component wrapper |
| `components/brands/brand-header.tsx` | Brand header (server component) |
| `components/brands/completion-celebration.tsx` | Toast when analysis completes |
| `components/brands/connection-status.tsx` | Shows realtime connection status |

### Design Decisions

1. **Server + Client split**: Server component for initial data (SEO, fast first paint), client component for interactivity
2. **Fallback polling**: If WebSocket fails after 5 reconnect attempts, falls back to 3-second polling
3. **Completion celebration**: Shows toast when analysis transitions from running → complete
4. **Connection indicator**: Shows subtle indicator during analysis to reassure users updates are live

### Example Usage

```typescript
// In a client component:
const {
  runs,
  isAnalyzing,
  isComplete,
  justCompleted,
  acknowledgeCompletion,
} = useBrandAnalysis({
  brandId: brand.id,
  initialRuns: runsFromServer,
});

// UI automatically updates as analyzers complete
// justCompleted is true briefly after all complete (for celebration)
```

---

## Dashboard Implementation (NEW - December 19, 2025)

The dashboard is the main authenticated landing page showing all user's brands.

### Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ DASHBOARD STRUCTURE                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

/dashboard
    │
    ├─→ DashboardContent (client component)
    │       │
    │       ├─→ useBrands() - React Query hook
    │       │       └─→ Fetches brands with analysis_runs
    │       │
    │       ├─→ Empty State (BrandEmptyState)
    │       │       └─→ Shown when user has no brands
    │       │
    │       ├─→ Brand List
    │       │       ├─→ "Your Brand" section (is_own_brand)
    │       │       └─→ "Brands You Manage" section
    │       │               └─→ BrandCard for each brand
    │       │
    │       └─→ DeleteBrandDialog
    │               └─→ Confirmation before delete
    │
    └─→ Header Navigation
            ├─→ "My Brands" link (active on /dashboard)
            └─→ "Add Brand" link (navigates to home)
```

### Key Features

1. **Categorized brand lists**: Separates "Your Brand" (is_own_brand) from managed brands
2. **Empty state**: Welcoming UI for new users with CTA to add first brand
3. **Brand cards**: Show name, domain, status badge, and quick actions
4. **Delete with confirmation**: Dialog prevents accidental deletion
5. **Prefetching**: Hovers on cards prefetch brand data for fast navigation
6. **Back navigation**: Brand detail page has link back to dashboard

### Component Summary

| Component | Purpose |
|-----------|---------|
| `DashboardContent` | Client component with React Query, state management |
| `BrandCard` | Displays single brand with status, dropdown menu |
| `BrandEmptyState` | Welcome screen for users with no brands |
| `DeleteBrandDialog` | Confirmation modal for brand deletion |
| `NavLink` | Header nav links with active state styling |

### Status Computation

Brand cards show an overall status computed from analysis runs:

```typescript
// Priority: error > analyzing/parsing > queued > complete
function computeOverallStatus(brand): AnalysisStatus {
  const runs = brand.analysis_runs;
  if (runs.some(r => r.status === 'error')) return 'error';
  if (runs.some(r => r.status === 'analyzing' || r.status === 'parsing')) return 'analyzing';
  if (runs.some(r => r.status === 'queued')) return 'queued';
  if (runs.every(r => r.status === 'complete')) return 'complete';
  return 'pending';
}
```

---

## Two-Step AI Pattern Explained

This is the core architectural pattern. Every analyzer uses it:

```
STEP 1: ANALYSIS (Natural Language Thinking)
┌─────────────────────────────────────────────────────────┐
│ Input: Scraped website content                          │
│ Prompt: "Analyze this website and tell me about..."     │
│ Output: Natural language observations                    │
│ Model: GPT-4o-mini                                      │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
STEP 2: PARSING (Structured Extraction)
┌─────────────────────────────────────────────────────────┐
│ Input: Natural language observations from Step 1         │
│ Prompt: "Extract structured data from these notes"       │
│ Tool: Function calling with JSON schema                  │
│ Output: Typed JSON matching our TypeScript types         │
└─────────────────────────────────────────────────────────┘
```

**Why two steps?**
- Analysis prompts can be conversational and detailed
- Parser schemas stay clean and typed
- Better accuracy than direct JSON extraction
- Debugging is easier (can see what AI "thought")

---

## Database Setup

Before running the app, you need to:

1. Create a Supabase project at supabase.com
2. Run the schema in `supabase/schema.sql` in the SQL Editor
3. This creates:
   - `profiles` table (extends auth.users)
   - `brands` table (the businesses being analyzed)
   - `analysis_runs` table (one per analyzer per brand)
   - RLS policies for security
   - Realtime enabled on key tables

---

## Environment Variables Required

```bash
# .env.local

# Supabase (get from project settings)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Server-side only, bypasses RLS

# OpenAI
OPENAI_API_KEY=sk-...

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Running the App

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (also runs type check)
npm run build

# Start production server
npm start
```

---

## Adding a New Analyzer

1. **Create folder**: `lib/analyzers/{name}/`

2. **Add files**:
   - `config.ts` - Metadata
   - `prompt.ts` - Analysis prompt
   - `parser.ts` - Function schema + post-processing
   - `types.ts` - TypeScript types
   - `index.ts` - Exports

3. **Register** in `lib/analyzers/index.ts`:
   ```typescript
   import { newAnalyzer } from './new-analyzer';
   export const ANALYZERS = { basics, customer, products, newAnalyzer };
   ```

4. **Add to database enum** (run SQL):
   ```sql
   ALTER TYPE analyzer_type ADD VALUE 'new_analyzer';
   ```

5. **Create UI card**: `components/analysis/cards/{name}-card.tsx`

6. **Add to brand page**: Import and render in `app/brands/[brandId]/page.tsx`

---

## Adding a New UI Component

### Using shadcn/ui pattern:

1. Create file in `components/ui/{name}.tsx`
2. Use semantic color classes (`bg-primary`, `text-muted-foreground`, etc.)
3. Use `cn()` helper for conditional classes
4. Export from the file

### Example:

```typescript
// components/ui/alert.tsx
import { cn } from '@/lib/utils/cn';

interface AlertProps {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
}

export function Alert({ variant = 'default', children }: AlertProps) {
  return (
    <div className={cn(
      'rounded-lg border p-4',
      variant === 'default' && 'bg-background text-foreground',
      variant === 'destructive' && 'bg-destructive/10 text-destructive border-destructive/50'
    )}>
      {children}
    </div>
  );
}
```

---

## Common Tasks

### Modify an analyzer's output fields

1. Update types in `lib/analyzers/{name}/types.ts`
2. Update parser schema in `lib/analyzers/{name}/parser.ts`
3. Update UI card in `components/analysis/cards/{name}-card.tsx`
4. Update `types/analyzers.ts` if the type guard needs changing

### Change the GPT model

Edit `lib/api/openai.ts`:
```typescript
const MODEL = 'gpt-4o-mini'; // Change this
```

### Add a new scraper

1. Create folder: `lib/scrapers/{name}/`
2. Add `config.ts`, `index.ts`, optional `parser.ts`
3. Register in `lib/scrapers/index.ts`
4. Call from API route when needed

### Add a new React Query hook

1. Create in `hooks/use-{name}.ts`
2. Define query keys for cache management
3. Export from `hooks/index.ts`
4. Use `toast` for mutation error handling

---

## Code Style Notes

- **File size limit**: ~400 lines max per file
- **Logging**: Use `lib/utils/logger.ts` with emojis for visibility
- **Imports**: Use `@/` path alias for absolute imports
- **Types**: Export from `@/types` barrel file
- **Comments**: Focus on "why" not "what", keep evergreen
- **Colors**: Always use semantic classes (`text-primary`, `bg-muted`), never hardcoded (`text-orange-500`)

---

## Testing the Flow Manually

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Enter a URL in the form (you'll need to be authenticated)
4. Watch terminal logs for analysis progress
5. View results at `/brands/{brandId}`

Note: Without proper auth setup, you may need to test API routes directly or add a test user.

---

## Frequently Asked Questions

### Q: Why OKLCH colors instead of HSL?

OKLCH provides perceptually uniform color interpolation. When you do `bg-primary/50` (50% opacity), the color looks more natural than with HSL. It's the modern standard for CSS colors.

### Q: Why is React Query configured with 60s staleTime?

Brand data doesn't change during a session. 60s prevents redundant fetches when navigating between pages while still keeping data reasonably fresh.

### Q: Why separate QueryProvider from other providers?

React Query's QueryClient must be created carefully for SSR. The pattern in `query-provider.tsx` handles both server (new client per request) and browser (singleton) correctly.

### Q: Can I use the old `stone-*` color classes?

Avoid them. Use semantic classes instead:
- `stone-100` → `bg-muted`
- `stone-500` → `text-muted-foreground`
- `stone-900` → `text-foreground`
- `orange-500` → `text-primary`

### Q: How do I add dark mode?

The CSS variables for `.dark` are already defined in `globals.css`. You just need to:
1. Add a theme toggle component
2. Add/remove the `dark` class on `<html>`
3. Consider using `next-themes` package

---

## Next Steps for Future Development

Priority order:

1. ~~**Auth UI** - Create login/signup pages with Supabase Auth~~ ✅ Done
2. ~~**Realtime UI** - Wire up Supabase realtime to show live progress~~ ✅ Done
3. ~~**shadcn/ui + React Query** - Install and wire up~~ ✅ Done
4. ~~**Dashboard** - Brand list view at `/dashboard`~~ ✅ Done
5. ~~**Google Docs Export** - OAuth integration + Docs API~~ ✅ Done
6. **Docs Feature Templates** - Generate docs from brand data (see `12-DOCS_FEATURE.md`) ← **CURRENT**
7. **Edit forms** - Allow editing parsed data
8. **Error recovery** - Retry failed analyzers UI
9. **Additional Integrations** - Notion, Google Slides (follow same pattern as Google Docs)

---

## Questions?

Check the other docs in `AI_DEV_DOCS/`:
- `01-PROJECT_OVERVIEW.md` - What the app does
- `02-ARCHITECTURE.md` - System design
- `03-DATA_MODEL.md` - Database schema explanation
- `05-ANALYZERS.md` - Analyzer architecture deep dive
- `08-UI_COMPONENTS.md` - Component inventory and patterns
- `09-FILE_STRUCTURE.md` - Where things go
- `10-API_PATTERNS.md` - React Query and API patterns
- `11-IMPLEMENTATION_ROADMAP.md` - Full feature checklist
- `12-DOCS_FEATURE.md` - Docs feature implementation plan
- `13-GOOGLE_DOCS_EXPORT.md` - **Google Docs export (IMPLEMENTED)**
- `14-GOOGLE_CLOUD_SETUP.md` - Step-by-step Google Cloud setup guide
