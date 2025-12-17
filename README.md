# The Clever Kit

> AI-powered brand intelligence for agencies and freelancers.

Paste a URL, get instant brand insights in 60 seconds.

---

## Implementation Status (December 17, 2025)

| Feature | Status | Notes |
|---------|--------|-------|
| Next.js 14 + TypeScript | ✅ | App Router, Turbopack |
| Supabase Integration | ✅ | Types, clients, schema ready |
| Web Scraper | ✅ | Homepage scraping with Cheerio |
| Three AI Analyzers | ✅ | Basics, Customer, Products |
| Two-Step AI Pattern | ✅ | Analysis → Parsing |
| Brand Profile Page | ✅ | Shows all analysis results |
| Add Brand Form | ✅ | URL input, triggers full pipeline |
| Auth UI | ❌ | Login/signup pages needed |
| Dashboard/Brand List | ❌ | Need list view |
| Realtime Updates | 🔶 | Backend ready, UI needs hook |
| Edit Forms | ❌ | View-only currently |

**Build Status**: ✅ Passing

> **For AI Developers**: See `AI_DEV_DOCS/00-SESSION_NOTES.md` for implementation details, gotchas, and common fixes.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

You'll need:
- **Supabase** project URL and keys (get from [supabase.com](https://supabase.com))
- **OpenAI** API key (get from [platform.openai.com](https://platform.openai.com/api-keys))

### 3. Set Up Database

Run the SQL schema in your Supabase SQL Editor:

```bash
# Copy contents of supabase/schema.sql and run in Supabase SQL Editor
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Architecture Overview

```
                      USER ENTERS URL
                            |
                            v
                 +-----------------------+
                 |    /api/brands/analyze |
                 +-----------------------+
                            |
         +------------------+------------------+
         |                  |                  |
         v                  v                  v
   +-----------+     +-----------+     +-----------+
   |  SCRAPER  |     | CREATE    |     | CREATE    |
   | (fetch &  |     | BRAND     |     | ANALYSIS  |
   |  parse)   |     | RECORD    |     | RUNS      |
   +-----------+     +-----------+     +-----------+
         |                                    |
         +------------------------------------+
                            |
                            v
              +---------------------------+
              |    CONCURRENT ANALYZERS    |
              +---------------------------+
              |                           |
    +---------+---------+       +---------+---------+
    |                   |       |                   |
    v                   v       v                   v
+-------+           +-------+-------+           +-------+
|BASICS |           |CUSTOMER|      |           |PRODUCTS|
+-------+           +-------+      +-------+   +-------+
    |                   |               |           |
    +-------------------+---------------+-----------+
                            |
                            v
              +---------------------------+
              |    TWO-STEP AI PROCESS     |
              +---------------------------+
              |                           |
              |  1. ANALYSIS (GPT-4o-mini)|
              |     Natural language      |
              |     "thinking"            |
              |                           |
              |  2. PARSING (Function     |
              |     calling to extract    |
              |     structured JSON)      |
              +---------------------------+
                            |
                            v
              +---------------------------+
              |    SUPABASE DATABASE       |
              |    (Realtime updates)      |
              +---------------------------+
```

---

## Project Structure

```
thecleverkit/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (add brand form)
│   ├── globals.css              # Global styles
│   ├── api/
│   │   ├── auth/callback/       # Supabase auth callback
│   │   └── brands/analyze/      # Main analysis endpoint
│   └── brands/
│       └── [brandId]/           # Brand detail page
│
├── components/                   # React components
│   ├── ui/                      # Primitives (Button, Card, etc.)
│   ├── layout/                  # Layout components
│   ├── brands/                  # Brand-related components
│   └── analysis/
│       ├── cards/               # Result display cards
│       └── progress-list.tsx    # Analysis progress
│
├── lib/                          # Business logic
│   ├── analyzers/               # AI analyzer modules
│   │   ├── basics/              # Business basics
│   │   ├── customer/            # Customer profile
│   │   ├── products/            # Products & pricing
│   │   ├── runner.ts            # Orchestration
│   │   └── types.ts             # Shared types
│   ├── scrapers/
│   │   └── web-homepage/        # URL scraper
│   ├── supabase/                # Database clients & helpers
│   ├── api/
│   │   └── openai.ts            # GPT wrapper
│   └── utils/                   # Utilities
│
├── types/                        # TypeScript types
│   ├── database.ts              # Supabase table types
│   └── analyzers.ts             # Analyzer output types
│
├── supabase/
│   └── schema.sql               # Database schema
│
└── .env.example                  # Environment template
```

---

## Key Concepts

### Two-Step AI Process

Every analyzer follows this pattern for better accuracy:

**Step 1: Analysis (Natural Language)**
```
Scraped Content → GPT Prompt → Natural language observations
```

**Step 2: Parsing (Structured Extraction)**
```
Observations → Function Calling → Typed JSON
```

This separation produces better results than asking GPT to output JSON directly.

### Analyzer Module Structure

Each analyzer is a self-contained folder:

```
lib/analyzers/basics/
├── config.ts    # Metadata (id, name, icon, dependencies)
├── prompt.ts    # Analysis prompt builder
├── parser.ts    # Function schema + post-processing
├── types.ts     # TypeScript types
└── index.ts     # Exports
```

### State Management

Analysis states flow through:

```
queued → analyzing → parsing → complete
                           ↘ error
```

---

## Data Model

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends Supabase Auth) |
| `brands` | Brands being analyzed |
| `analysis_runs` | One record per analyzer per brand |

### Key Relationships

```
User (profiles)
  └── Brands (many)
        └── Analysis Runs (many, one per analyzer type)
```

### Analysis Run Statuses

| Status | Description |
|--------|-------------|
| `queued` | Waiting to start |
| `analyzing` | Step 1: GPT analysis in progress |
| `parsing` | Step 2: Extracting structured data |
| `complete` | Successfully finished |
| `error` | Failed (check error_message) |

---

## Analyzers

### Basics
Extracts core business identity:
- Business name
- Founder name
- Founded year
- Industry
- Business description
- Business model (B2B Services, SaaS, Agency, etc.)

### Customer Profile
Understands the target audience:
- Subcultures/communities they serve
- Primary problem they solve
- Secondary problems
- Customer sophistication (Beginner/Informed/Expert)
- Buying motivation (Pain relief/Aspiration/Necessity/etc.)

### Products & Pricing
Analyzes what they sell:
- Offering type (Products/Services/Both)
- List of offerings with prices
- Primary offer
- Price positioning (Budget/Mid-market/Premium/Luxury)

---

## API Reference

### POST /api/brands/analyze

Start analysis for a new brand.

**Request:**
```json
{
  "url": "https://example.com",
  "isOwnBrand": false
}
```

**Response:**
```json
{
  "success": true,
  "brandId": "uuid",
  "message": "Analysis started!"
}
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key (server only) | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `NEXT_PUBLIC_APP_URL` | App URL for callbacks | No |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel automatically detects Next.js and configures the build.

---

## Development Tips

### Adding a New Analyzer

1. Create folder: `lib/analyzers/{name}/`
2. Add files: `config.ts`, `prompt.ts`, `parser.ts`, `types.ts`, `index.ts`
3. Register in `lib/analyzers/index.ts`
4. Add to database enum (run SQL):
   ```sql
   ALTER TYPE analyzer_type ADD VALUE 'your_analyzer';
   ```
5. Create UI card in `components/analysis/cards/`

### File Size Guidelines

| File Type | Target | Max |
|-----------|--------|-----|
| Components | 50-150 | 200 |
| Analyzers | 30-80 | 120 |
| API routes | 50-100 | 150 |

If a file grows too large, split it!

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (Postgres + Auth + Realtime)
- **AI:** OpenAI GPT-4o-mini
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

---

## License

Private - All Rights Reserved

---

Built with care by a scrappy indie hacker.

---

## Known Gotchas (For AI Devs)

Quick reference for common issues. See `AI_DEV_DOCS/00-SESSION_NOTES.md` for full details.

### 1. Supabase Type Errors
If you get `never` type errors with Supabase queries:
```typescript
// Always cast results from Supabase queries:
const { data } = await supabase.from('brands').select('*').single();
return data as Brand; // Cast to proper type
```

### 2. OpenAI Function Schema
Cast the schema to avoid TypeScript errors:
```typescript
parameters: schema as unknown as Record<string, unknown>
```

### 3. OpenAI tool_calls Access
Add type guard before accessing function:
```typescript
if (!toolCall || toolCall.type !== 'function') throw new Error('...');
const args = toolCall.function.arguments; // Now safe
```

### 4. Adding New Analyzers
1. Create `lib/analyzers/{name}/` with 5 files
2. Register in `lib/analyzers/index.ts`
3. Add to DB enum: `ALTER TYPE analyzer_type ADD VALUE 'name';`
4. Create UI card in `components/analysis/cards/`

---

## AI Developer Documentation

Full documentation for AI developers working on this codebase:

| Document | Purpose |
|----------|---------|
| `AI_DEV_DOCS/00-SESSION_NOTES.md` | **Start here** - Implementation status, gotchas, fixes |
| `AI_DEV_DOCS/01-PROJECT_OVERVIEW.md` | What the app does, who it's for |
| `AI_DEV_DOCS/02-ARCHITECTURE.md` | System design, data flow |
| `AI_DEV_DOCS/05-ANALYZERS.md` | Deep dive on analyzer architecture |
| `AI_DEV_DOCS/09-FILE_STRUCTURE.md` | Where things go, naming conventions |
| `AI_DEV_DOCS/11-IMPLEMENTATION_ROADMAP.md` | Checklist with completion status |
