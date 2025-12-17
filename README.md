# The Clever Kit — Documentation

> AI-powered brand intelligence for agencies and freelancers.

## Quick Start

Read the docs in order for full context, or jump to specific areas:

| Doc | Purpose | Read When... |
|-----|---------|--------------|
| [01-PROJECT_OVERVIEW](./01-PROJECT_OVERVIEW.md) | What this is, who it's for | Starting the project |
| [02-ARCHITECTURE](./02-ARCHITECTURE.md) | System design, data flow | Planning implementation |
| [03-DATA_MODEL](./03-DATA_MODEL.md) | Database schema, types | Setting up Supabase |
| [04-USER_STORIES](./04-USER_STORIES.md) | Features, acceptance criteria | Building any feature |
| [05-ANALYZERS](./05-ANALYZERS.md) | How AI extraction works | Building/adding analyzers |
| [06-RUNNER](./06-RUNNER.md) | Analyzer orchestration | Understanding execution flow |
| [07-SCRAPERS](./07-SCRAPERS.md) | Content fetching | Building/adding scrapers |
| [08-UI_COMPONENTS](./08-UI_COMPONENTS.md) | Design system, components | Building UI |
| [09-FILE_STRUCTURE](./09-FILE_STRUCTURE.md) | Where files go | Creating new files |
| [10-API_PATTERNS](./10-API_PATTERNS.md) | OpenAI, Supabase, queries | Writing API code |
| [11-IMPLEMENTATION_ROADMAP](./11-IMPLEMENTATION_ROADMAP.md) | Build order, checklist | Planning sprints |

## Key Decisions

1. **Naming**: "Brands" not "Clients" — users have "Your Brand" + "Brands You Manage"
2. **Two-step AI**: Analysis (natural language) → Parsing (function calling)
3. **Modular analyzers**: Each in its own folder, easy to add more
4. **Modular scrapers**: Same pattern, ready for LinkedIn/social later
5. **Realtime updates**: Supabase Realtime for live progress
6. **Small files**: Target <200 lines, max 400 lines per file

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (Postgres + Auth + Realtime)
- **AI**: OpenAI GPT-4o-mini
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query + Supabase Realtime
- **Hosting**: Vercel

## MVP Scope

**In**: Auth, add brands via URL, scrape homepage, 3 analyzers (basics, customer, products), real-time progress, brand profile, edit fields, retry/re-analyze

**Out**: Additional scrapers, additional analyzers, doc generation, chat input, teams

## Design Vibe

Warm, breathable, clean. Soft cream backgrounds, orange accent, generous whitespace, soft shadows. Professional enough for agencies, delightful enough to enjoy using.

---

*Built by a savvy indie hacker with an eye for clean, elegant design.*
