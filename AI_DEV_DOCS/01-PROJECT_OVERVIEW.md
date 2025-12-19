# The Clever Kit — Project Overview

> **Implementation Status (December 19, 2025)**: Core MVP complete with Dashboard + Google Docs Export. Build passes. See `00-SESSION_NOTES.md` for details.

## What Is This?

The Clever Kit is a web app that helps marketing agencies and freelancers quickly understand any brand by analyzing their website. Users paste a URL, and the app scrapes the site, runs it through multiple AI "analyzers," and produces structured brand intelligence.

Think of it as an instant brand research assistant — and soon, a document generator that turns brand intelligence into deliverables.

## Who Is It For?

**Primary users:**
- Marketing agencies (using it for their own agency brand + every client they take on)
- Freelance marketers, strategists, brand consultants
- Eventually: solopreneurs who want to understand their own brand better

**User mental model:**
- "My Brand" = their own business
- "Brands" = brands they manage/work with (what most apps call "clients")

We avoid the word "client" because it's overloaded in tech contexts.

## Core Value Proposition

> "Paste a URL. Get brand intelligence in 60 seconds."

Instead of manually combing through a website taking notes, The Clever Kit does it automatically and structures the information for immediate use.

## MVP Scope

### What's Implemented ✅
- [x] Add brands via URL
- [x] Web scraping (homepage with Cheerio)
- [x] Three concurrent AI analyzers:
  - **Basics**: Business name, founder, industry, what they do, business model
  - **Customer Profile**: Subcultures, problems, sophistication, buying motivation
  - **Products & Pricing**: What they sell, prices, positioning
- [x] Brand profile view with all analyzed data
- [x] Supabase database schema with RLS
- [x] Two-step AI pattern (analysis → parsing)
- [x] User auth UI (magic link login)
- [x] Dashboard with brand list
- [x] Realtime UI updates (Supabase subscriptions + polling fallback)
- [x] Delete brands with confirmation
- [x] Auth-gated analysis flow (URL preserved across login)
- [x] **Google Docs Export** — OAuth integration + export to user's Drive
- [x] **Settings page** — Connected Apps management

### In Progress 🔶
- [ ] **Docs Feature Templates** — Generate documents from brand intelligence (see `12-DOCS_FEATURE.md`)
  - Golden Circle (Simon Sinek's Why/How/What)
  - Brand Brief
  - Customer Persona

### Still Needed ⚠️
- [ ] Manual editing of AI-extracted fields
- [ ] Re-analyze capability
- [ ] Retry failed analyzers

### What's Out (Future)
- Additional scrapers (LinkedIn, social profiles, Google search)
- Additional analyzers (competitors, tone of voice, visual identity)
- Additional export integrations (Google Slides, Notion, Canva)
- Chat/voice input for brand information
- Team collaboration features
- White-label / client portals

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | Server components, API routes, Vercel-native |
| Database | Supabase (Postgres) | Auth + DB + Realtime in one, generous free tier |
| AI | OpenAI GPT-4o-mini | Cost-effective, fast, good enough for extraction |
| Styling | Tailwind CSS + shadcn/ui | Rapid, consistent, customizable |
| State | TanStack Query + Supabase Realtime | Server state + live updates |
| Hosting | Vercel | Zero-config Next.js deploys |

## Design Principles

### 1. Breathable & Soothing
- Warm neutral backgrounds (soft cream/warm gray, not stark white)
- Generous whitespace
- Nothing feels cramped or overwhelming

### 2. Clean & Elegant
- Minimal UI chrome
- Cards with soft shadows and rounded corners
- Typography does the heavy lifting

### 3. Delightful Moments
- Smooth progress indicators during analysis
- Satisfying state transitions
- Celebration when analysis completes

### 4. Agency-Ready
- Looks professional enough to show clients
- Data is exportable/usable
- Scales visually from 1 brand to 50

## Success Metrics (MVP)

- User can go from signup → first brand analyzed in under 3 minutes
- Analysis completes in under 90 seconds
- 80%+ of extracted fields are accurate enough to use without editing
- Users return to add a second brand

## Naming Conventions

| Concept | Term We Use | Avoid |
|---------|-------------|-------|
| Brands the user works with | "Brands" | "Clients", "Projects", "Accounts" |
| User's own brand | "Your Brand" | "My Brand", "Self" |
| AI extraction modules | "Analyzers" | "Processors", "Extractors" |
| URL-to-text modules | "Scrapers" | "Crawlers", "Fetchers" |
| Structured AI output | "Parsed data" | "Extracted data", "Results" |
| Generated documents | "Docs" | "Outputs", "Deliverables" |

## Future Vision

The Clever Kit becomes the "brand OS" for agencies:
1. **Ingest** — Pull brand info from any source (URLs, social, docs, conversation)
2. **Analyze** — Run multiple AI analyzers to build comprehensive brand intelligence
3. **Generate** — Create documents, strategies, content from that intelligence
4. **Iterate** — Refine through chat, update as brands evolve

**Current Focus:**
- MVP (complete): Steps 1 and 2 for website URLs
- Next: Step 3 with modular doc templates (Golden Circle, Brand Brief, etc.)

### Docs Feature Vision

The docs feature transforms analyzed brand data into useful deliverables:

```
Brand Intelligence          Doc Templates              Exports
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Basics          │──────▶│ Golden Circle   │──────▶│ Copy Markdown   │
│ Customer        │──────▶│ Brand Brief     │──────▶│ Download PDF    │
│ Products        │──────▶│ Customer Persona│──────▶│ Google Docs ✅  │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

**Key principles:**
- Modular templates (easy to add new doc types)
- Same two-step AI pattern (analyze → parse)
- Data sufficiency checks before generation
- Snapshots (docs don't auto-update when brand changes)

See `12-DOCS_FEATURE.md` for full implementation plan.
