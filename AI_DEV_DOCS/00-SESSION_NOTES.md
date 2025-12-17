# Session Notes for AI Developers

> Last updated: December 17, 2025
> Status: MVP Core Implementation Complete (Build Passing)

This document provides context for future AI developers working on this codebase. Read this first!

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
| UI components | ✅ Complete | Button, Card, Input, Badge, Skeleton |
| Brand detail page | ✅ Complete | Shows analysis results |
| Home page | ✅ Complete | Add brand form |
| Logger utility | ✅ Complete | Emoji-rich, formatted logging |
| Auth UI (login page) | ✅ Complete | Magic link authentication |
| Auth hook (useAuth) | ✅ Complete | User state management |
| Header sign in/out | ✅ Complete | Shows login button or user menu |
| Route protection middleware | ✅ Complete | Protects /dashboard, /brands, /settings |

### Not Yet Implemented

| Feature | Priority | Notes |
|---------|----------|-------|
| Dashboard/brand list page | High | Currently redirects to home |
| Realtime subscriptions | Medium | Supabase realtime enabled but not wired to UI |
| Edit forms for analysis data | Medium | View-only currently |
| Retry failed analyzers | Medium | API exists conceptually |
| User settings page | Low | |
| TanStack Query hooks | Low | Using direct Supabase calls |

---

## Key Files to Know

### Configuration & Types

| File | Purpose |
|------|---------|
| `types/database.ts` | **Critical** - Supabase table types + Insert/Update types |
| `types/analyzers.ts` | Parsed output types for each analyzer |
| `lib/supabase/server.ts` | Server-side Supabase client creation |
| `supabase/schema.sql` | Database schema - run this in Supabase SQL editor |

### Authentication

| File | Purpose |
|------|---------|
| `hooks/use-auth.ts` | Auth hook - provides `user`, `isLoading`, `signOut` |
| `components/auth/login-form.tsx` | Magic link login form component |
| `app/login/page.tsx` | Login page with auth redirect logic |
| `middleware.ts` | Route protection (protects /dashboard, /brands, /settings) |
| `components/layout/header.tsx` | Header with Sign In button / User menu |

### Core Business Logic

| File | Purpose |
|------|---------|
| `lib/analyzers/runner.ts` | Orchestrates concurrent analyzer execution |
| `lib/api/openai.ts` | GPT wrapper with `analyzeWithGPT()` and `parseWithGPT()` |
| `lib/scrapers/web-homepage/index.ts` | Homepage scraper |
| `app/api/brands/analyze/route.ts` | Main analysis endpoint |

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

---

## Code Style Notes

- **File size limit**: ~400 lines max per file
- **Logging**: Use `lib/utils/logger.ts` with emojis for visibility
- **Imports**: Use `@/` path alias for absolute imports
- **Types**: Export from `@/types` barrel file
- **Comments**: Focus on "why" not "what", keep evergreen

---

## Testing the Flow Manually

1. Start dev server: `npm run dev`
2. Open http://localhost:3000
3. Enter a URL in the form (you'll need to be authenticated)
4. Watch terminal logs for analysis progress
5. View results at `/brands/{brandId}`

Note: Without proper auth setup, you may need to test API routes directly or add a test user.

---

## Next Steps for Future Development

Priority order for completing MVP:

1. ~~**Auth UI** - Create login/signup pages with Supabase Auth~~ ✅ Done
2. **Dashboard** - Brand list view at `/dashboard`
3. **Realtime UI** - Wire up Supabase realtime to show live progress
4. **Edit forms** - Allow editing parsed data
5. **Error recovery** - Retry failed analyzers UI

---

## Questions?

Check the other docs in `AI_DEV_DOCS/`:
- `01-PROJECT_OVERVIEW.md` - What the app does
- `02-ARCHITECTURE.md` - System design
- `03-DATA_MODEL.md` - Database schema explanation
- `05-ANALYZERS.md` - Analyzer architecture deep dive
- `09-FILE_STRUCTURE.md` - Where things go
- `11-IMPLEMENTATION_ROADMAP.md` - Full feature checklist
