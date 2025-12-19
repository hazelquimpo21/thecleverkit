# Architecture

> **Updated December 18, 2025**: Added React Query provider setup and shadcn/ui integration. Core architecture implemented and working. See `00-SESSION_NOTES.md` for implementation notes.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEXT.JS APP                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages/    │  │   API       │  │   Server Components     │  │
│  │   Routes    │  │   Routes    │  │   (data fetching)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
            │                │                    │
            ▼                ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Supabase      │  │   OpenAI        │  │   Scraper       │
│   (DB + Auth +  │  │   GPT-4o-mini   │  │   Service       │
│    Realtime)    │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Core Data Flow

### Adding a Brand

```
1. User submits URL
   ↓
2. Create brand record (status: pending)
   ↓
3. Create analysis_run records for each analyzer (status: queued)
   ↓
4. Scrape URL → store scraped_content on brand
   ↓
5. Build execution plan (group analyzers into waves by dependencies)
   ↓
6. For each wave, run analyzers concurrently:
   │
   ├─→ Analyzer A ─→ GPT Analysis ─→ GPT Parse ─→ Save parsed_data
   ├─→ Analyzer B ─→ GPT Analysis ─→ GPT Parse ─→ Save parsed_data
   └─→ Analyzer C ─→ GPT Analysis ─→ GPT Parse ─→ Save parsed_data
   ↓
7. All complete → brand ready to view
```

### Two-Step AI Pattern

Every analyzer follows the same pattern:

**Step 1: Analysis (human-like thinking)**
```
[Scrape content] → [Analysis prompt] → GPT → [Natural language observations]
```

**Step 2: Parsing (structured extraction)**
```
[Natural language observations] → [Parse prompt + function schema] → GPT → [Structured JSON]
```

This separation means:
- Analysis prompts can be conversational and nuanced
- Function schemas stay clean and typed
- Debugging is easier (you can see what the AI "thought" before parsing)
- Better accuracy than asking for JSON directly

## Key Architectural Decisions

### 1. Analyzers Are Self-Contained Modules

Each analyzer is a folder with:
- `prompt.ts` — The analysis prompt
- `parser.ts` — The function schema + any post-processing
- `config.ts` — Metadata (id, name, icon, dependencies)
- `types.ts` — TypeScript types for parsed output

Adding a new analyzer = adding a new folder + registering it.

### 2. Scrapers Are Also Modular

MVP has one scraper (web/homepage), but the architecture supports:
- `web-homepage` — Scrape a single URL
- `web-deep` — Crawl linked pages (future)
- `linkedin` — Pull LinkedIn company data (future)
- `social` — Aggregate social profiles (future)

Each scraper returns a standardized `ScrapedContent` object.

### 3. Dependency-Based Execution

Analyzers can declare dependencies on other analyzers:

```typescript
// Most analyzers have no dependencies (run concurrently)
{ id: 'basics', dependsOn: [] }
{ id: 'customer', dependsOn: [] }
{ id: 'products', dependsOn: [] }

// Some future analyzers might need prior results
{ id: 'competitors', dependsOn: ['basics'] }  // needs industry
{ id: 'positioning', dependsOn: ['products', 'competitors'] }
```

The runner builds a DAG and executes in waves.

### 4. Realtime Status Updates

Analysis can take 30-90 seconds. Users need feedback.

- Each `analysis_run` has a `status` field
- Status changes trigger Supabase Realtime events
- UI subscribes and updates cards individually
- No polling required

### 5. JSONB for Flexibility

Parsed analyzer data is stored as JSONB in Postgres:

```sql
parsed_data JSONB
```

This means:
- No schema migrations when adding analyzers
- Each analyzer defines its own shape
- Easy to query with Postgres JSON operators
- TypeScript types provide safety at app level

### 6. Optimistic UI with Server Truth

- TanStack Query manages all server state
- Mutations update optimistically where safe
- Supabase is always the source of truth
- Realtime syncs state across tabs/devices

### 7. Provider Composition Pattern

The app uses a layered provider architecture in `lib/providers/`:

```
<QueryProvider>              ← React Query for server state caching
  <TooltipProvider>          ← Radix UI tooltip context
    {children}
    <Toaster />              ← Sonner toast notifications
  </TooltipProvider>
</QueryProvider>
```

**Why this order?**
- QueryProvider wraps everything so any component can use React Query
- TooltipProvider must wrap components that use Tooltip
- Toaster is a sibling to children so toasts render above the app

**Configuration in `lib/providers/query-provider.tsx`:**

| Option | Value | Reason |
|--------|-------|--------|
| `staleTime` | 60 seconds | Reduces unnecessary refetches |
| `gcTime` | 10 minutes | Keeps data for fast back-navigation |
| `retry` | 1 | Single retry for transient failures |
| `refetchOnWindowFocus` | false | Prevents API spam on tab switch |

### 8. shadcn/ui + Tailwind v4 Integration

We use shadcn/ui components with custom OKLCH color tokens:

```
┌─────────────────────────────────────────────┐
│              globals.css                     │
│  ┌────────────────────────────────────────┐ │
│  │ :root { --primary: oklch(...) }        │ │
│  │        { --background: oklch(...) }    │ │
│  └────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────┐ │
│  │ @theme inline {                        │ │  ← Maps CSS vars to Tailwind
│  │   --color-primary: var(--primary);     │ │
│  │ }                                      │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│           components/ui/*.tsx                │
│  Use semantic classes:                       │
│    bg-primary, text-muted-foreground        │
│    border-border, ring-ring                 │
└─────────────────────────────────────────────┘
```

**Color Semantic Meaning:**

| Token | Usage |
|-------|-------|
| `--primary` | Brand orange, CTAs, focus rings |
| `--secondary` | Subtle backgrounds, secondary buttons |
| `--muted` | Disabled states, placeholder text |
| `--destructive` | Delete actions, errors |
| `--success` | Completed states, confirmations |
| `--warning` | Pending states, caution |

## Error Handling Strategy

### Scraper Errors
- Site unreachable → Show error, offer retry
- Site blocks scraping → Suggest different URL or manual entry
- Empty content → Warn user, proceed with what we got

### Analyzer Errors
- GPT timeout → Retry once, then mark failed
- Parse failure → Store raw analysis, let user see what AI said
- Partial failure → Show completed analyzers, offer retry on failed ones

### User-Facing Error States
- Never show raw error messages
- Always offer a next action (retry, try different URL, enter manually)
- Failed analyzers don't block viewing successful ones

## Security Considerations

### Auth
- Supabase Auth handles all authentication
- Row Level Security (RLS) on all tables
- Users can only see their own brands/analyses

### API Keys
- OpenAI key stored in environment variables
- Never exposed to client
- All GPT calls happen server-side (API routes)

### Scraping
- Rate limiting on scrape endpoint
- User-agent identifies as a bot (good citizenship)
- Respect robots.txt where critical

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Page load | < 1s | Server components, minimal client JS |
| Scrape | < 10s | Timeout at 15s |
| Single analyzer | < 20s | Both steps combined |
| Full analysis (3 analyzers) | < 60s | Running concurrently |
| Realtime update latency | < 500ms | Supabase handles this |

## Scaling Considerations (Post-MVP)

- **More analyzers**: Execution plan handles any DAG
- **Longer analyses**: Could move to background jobs (Vercel cron or Supabase Edge Functions)
- **More scrapers**: Each adds to `scraped_sources` array on brand
- **Team features**: Add `team_id` to brands, update RLS policies
- **Higher volume**: Supabase scales, may need GPT rate limit handling
