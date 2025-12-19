# File Structure

> **Updated December 19, 2025**: UI Redesign complete. Template Store implemented. Sidebar navigation + store components added.

## Overview

The project uses Next.js 16 App Router with a modular structure. No file should exceed ~400 lines.

```
clever-kit/
├── app/                    ← Next.js App Router pages
├── components/             ← React components
├── lib/                    ← Business logic, utilities
├── types/                  ← TypeScript type definitions
├── hooks/                  ← Custom React hooks
├── public/                 ← Static assets
└── config files
```

## Complete Structure

```
clever-kit/
│
├── app/
│   ├── layout.tsx                    ← Root layout with Providers + Header ✅
│   ├── page.tsx                      ← Home page (add brand form) ✅
│   ├── globals.css                   ← OKLCH CSS variables + Tailwind v4 ✅
│   │
│   ├── login/
│   │   ├── page.tsx                  ← Login page (magic link auth) ✅
│   │   └── login-page-content.tsx    ← Client component for intent-aware UI ✅
│   │
│   ├── analyze/
│   │   ├── page.tsx                  ← Post-login analysis continuation ✅
│   │   └── analyze-continuation.tsx  ← Client component for continuation flow ✅
│   │
│   ├── brands/
│   │   └── [brandId]/
│   │       └── page.tsx              ← Brand profile page ✅
│   │
│   ├── dashboard/
│   │   └── page.tsx                  ← Brand list view ✅
│   │
│   ├── settings/                     ← ✅ IMPLEMENTED
│   │   ├── page.tsx                  ← User settings page ✅
│   │   └── connected-apps-section.tsx ← Google integration management ✅
│   │
│   ├── integrations/                 ← ✅ IMPLEMENTED (OAuth flows)
│   │   └── google/
│   │       ├── success/page.tsx      ← OAuth success (closes popup) ✅
│   │       └── error/page.tsx        ← OAuth error page ✅
│   │
│   └── api/
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts          ← Supabase auth callback ✅
│       ├── brands/
│       │   └── analyze/
│       │       └── route.ts          ← Main analysis endpoint ✅
│       │
│       ├── integrations/             ← ✅ IMPLEMENTED (Google OAuth)
│       │   └── google/
│       │       ├── auth/route.ts     ← POST: Initiate OAuth flow ✅
│       │       ├── callback/route.ts ← GET: Handle OAuth callback ✅
│       │       ├── disconnect/route.ts ← POST: Revoke & delete tokens ✅
│       │       └── status/route.ts   ← GET: Check connection status ✅
│       │
│       ├── export/                   ← ✅ IMPLEMENTED
│       │   └── google-docs/route.ts  ← POST: Export doc to Google Docs ✅
│       │
│       └── docs/                     ← (planned)
│           └── generate/
│               └── route.ts          ← Doc generation endpoint
│
├── components/
│   ├── ui/                           ← shadcn/ui primitives (Radix-based)
│   │   ├── button.tsx                ← Primary buttons (+ success, icon-sm) ✅
│   │   ├── card.tsx                  ← Warm shadows (+ interactive prop) ✅
│   │   ├── input.tsx                 ← Label/hint/error support ✅
│   │   ├── badge.tsx                 ← Semantic variants (basics/customer/etc) ✅
│   │   ├── skeleton.tsx              ← Warm shimmer animation ✅
│   │   ├── empty-state.tsx           ← Reusable empty state ✅ NEW
│   │   ├── error-state.tsx           ← Reusable error with retry ✅ NEW
│   │   ├── label.tsx                 ← Form field labels (Radix) ✅
│   │   ├── checkbox.tsx              ← Toggle with indeterminate (Radix) ✅
│   │   ├── dialog.tsx                ← Modal overlay (Radix) ✅
│   │   ├── dropdown-menu.tsx         ← Context menus (Radix) ✅
│   │   ├── tooltip.tsx               ← Hover hints (Radix) ✅
│   │   ├── separator.tsx             ← Visual divider (Radix) ✅
│   │   ├── sonner.tsx                ← Toast notifications ✅
│   │   └── index.ts                  ← Exports ✅
│   │
│   ├── layout/                       ← ✅ REDESIGNED
│   │   ├── sidebar/                  ← Left navigation ✅ NEW
│   │   │   ├── sidebar.tsx           ← 260px fixed sidebar
│   │   │   ├── sidebar-nav-item.tsx  ← Navigation links
│   │   │   ├── sidebar-brand-item.tsx ← Brand items with status
│   │   │   ├── sidebar-section.tsx   ← Section grouping
│   │   │   ├── sidebar-user-menu.tsx ← User dropdown
│   │   │   └── index.ts              ← Exports
│   │   ├── app-shell.tsx             ← Layout with conditional sidebar ✅ NEW
│   │   ├── page-container.tsx        ← Sidebar-aware padding ✅
│   │   ├── page-header.tsx           ← Title + tabs + actions ✅ NEW
│   │   └── index.ts                  ← Layout exports ✅
│   │
│   ├── auth/
│   │   ├── login-form.tsx            ← Magic link login form ✅
│   │   └── index.ts                  ← Auth component exports ✅
│   │
│   ├── brands/
│   │   ├── brand-card.tsx            ← Interactive card ✅
│   │   ├── brand-analysis-content.tsx ← 3 tabs (Overview/Store/Docs) ✅
│   │   ├── brand-list.tsx            ← Grid of brand cards ✅
│   │   ├── brand-empty-state.tsx     ← Empty state ✅
│   │   ├── add-brand-form.tsx        ← URL input form ✅
│   │   ├── status-badge.tsx          ← Analysis status indicator ✅
│   │   ├── completion-celebration.tsx ← Success toast ✅
│   │   └── connection-status.tsx     ← Realtime connection status ✅
│   │
│   ├── analysis/
│   │   ├── progress-list.tsx         ← Full progress view ✅
│   │   ├── progress-item.tsx         ← Single analyzer row ✅
│   │   ├── analyzer-card.tsx         ← Base results card ✅
│   │   └── field.tsx                 ← Label/value display ✅
│   │
│   ├── analysis/cards/               ← Analyzer-specific displays
│   │   ├── basics-card.tsx           ← Badge variant="basics" ✅
│   │   ├── customer-card.tsx         ← Badge variant="customer" ✅
│   │   └── products-card.tsx         ← Badge variant="products" ✅
│   │
│   ├── store/                        ← Template Store ✅ NEW
│   │   ├── store-tab-content.tsx     ← Main store with categories
│   │   ├── template-gallery-card.tsx ← Card with illustration
│   │   ├── template-illustration.tsx ← CSS geometric illustrations
│   │   └── index.ts                  ← Exports
│   │
│   ├── integrations/                 ← ✅ IMPLEMENTED
│   │   ├── google-connect-modal.tsx  ← Google OAuth connect modal ✅
│   │   └── index.ts                  ← Exports ✅
│   │
│   └── docs/                         ← Document generation ✅
│       ├── docs-tab-content.tsx      ← Docs tab container ✅
│       ├── doc-template-card.tsx     ← Single template in grid ✅
│       ├── doc-template-grid.tsx     ← Grid of templates ✅
│       ├── doc-list.tsx              ← User's generated docs ✅
│       ├── doc-list-item.tsx         ← Single doc (+ Google Docs link) ✅
│       ├── doc-viewer-dialog.tsx     ← Modal doc viewer ✅
│       ├── doc-export-menu.tsx       ← Export dropdown ✅
│       ├── missing-data-dialog.tsx   ← Shows needed data ✅
│       └── index.ts                  ← Exports ✅
│
├── lib/
│   ├── providers/                    ← React context providers ✅ NEW
│   │   ├── index.tsx                 ← Provider composition (Query + Tooltip + Toaster)
│   │   └── query-provider.tsx        ← TanStack Query client setup
│   │
│   ├── analyzers/
│   │   ├── types.ts                  ← Shared analyzer types
│   │   ├── index.ts                  ← Analyzer registry
│   │   ├── runner.ts                 ← Orchestration (<100 lines)
│   │   ├── execution-plan.ts         ← Dependency resolution
│   │   ├── run-single.ts             ← Single analyzer execution
│   │   │
│   │   ├── basics/
│   │   │   ├── config.ts
│   │   │   ├── prompt.ts
│   │   │   ├── parser.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── customer/
│   │   │   ├── config.ts
│   │   │   ├── prompt.ts
│   │   │   ├── parser.ts
│   │   │   └── types.ts
│   │   │
│   │   └── products/
│   │       ├── config.ts
│   │       ├── prompt.ts
│   │       ├── parser.ts
│   │       └── types.ts
│   │
│   ├── scrapers/
│   │   ├── types.ts                  ← Shared scraper types
│   │   ├── index.ts                  ← Scraper registry
│   │   │
│   │   └── web-homepage/
│   │       ├── config.ts
│   │       ├── index.ts              ← Main scrape function
│   │       └── parser.ts             ← HTML cleaning
│   │
│   ├── docs/                         ← Document generation (planned)
│   │   ├── types.ts                  ← DocTemplate, GeneratedDoc types
│   │   ├── registry.ts               ← All available doc templates
│   │   ├── generator.ts              ← Orchestrates doc generation
│   │   ├── readiness.ts              ← Data sufficiency checks
│   │   │
│   │   └── templates/                ← One folder per doc type
│   │       ├── golden-circle/
│   │       │   ├── config.ts         ← Metadata, required analyzers
│   │       │   ├── prompt.ts         ← Analysis prompt builder
│   │       │   ├── parser.ts         ← Function schema
│   │       │   ├── types.ts          ← TypeScript types
│   │       │   └── index.ts          ← Exports
│   │       │
│   │       ├── brand-brief/          ← (future)
│   │       └── customer-persona/     ← (future)
│   │
│   ├── integrations/                 ← ✅ IMPLEMENTED (Google OAuth)
│   │   ├── types.ts                  ← Shared IntegrationStatus type ✅
│   │   ├── index.ts                  ← Exports ✅
│   │   └── google/
│   │       ├── config.ts             ← OAuth config, scopes, URLs ✅
│   │       ├── client.ts             ← Token management (exchange, refresh) ✅
│   │       ├── docs.ts               ← Google Docs API (create doc) ✅
│   │       └── index.ts              ← Exports ✅
│   │
│   ├── supabase/
│   │   ├── client.ts                 ← Browser client
│   │   ├── server.ts                 ← Server client
│   │   ├── middleware.ts             ← Auth middleware helper
│   │   ├── brands.ts                 ← Brand CRUD
│   │   ├── analysis-runs.ts          ← Analysis run CRUD
│   │   ├── generated-docs.ts         ← Generated docs CRUD (planned)
│   │   └── profiles.ts               ← Profile CRUD
│   │
│   ├── api/
│   │   └── openai.ts                 ← GPT call wrappers
│   │
│   └── utils/
│       ├── cn.ts                     ← clsx/tailwind-merge helper
│       ├── format.ts                 ← Date, URL formatters
│       ├── logger.ts                 ← Emoji-rich logging utility ✅
│       ├── auth-intent.ts            ← Save/load analysis intent across login ✅
│       └── index.ts                  ← Utils exports
│
├── hooks/
│   ├── use-auth.ts                   ← Auth hook (user, isLoading, signOut) ✅
│   ├── use-auth-gate.ts              ← Auth gating hook (redirects to login) ✅
│   ├── use-brands.ts                 ← TanStack Query: brands + mutations ✅
│   ├── use-google-integration.ts     ← Google OAuth status + connect/disconnect ✅
│   ├── use-docs.ts                   ← TanStack Query: docs + mutations (planned)
│   ├── use-doc-readiness.ts          ← Check template data requirements (planned)
│   └── index.ts                      ← Hook exports ✅
│
├── types/
│   ├── database.ts                   ← Supabase table types
│   ├── analyzers.ts                  ← Analyzer output types
│   ├── docs.ts                       ← Doc template + generated doc types (planned)
│   └── index.ts                      ← Re-exports
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
├── components.json                   ← shadcn/ui configuration ✅ NEW
├── middleware.ts                     ← Auth protection
│
├── .env.local                        ← Environment variables (gitignored)
├── .env.example                      ← Template for env vars
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## File Size Guidelines

| File Type | Target Lines | Max Lines |
|-----------|--------------|-----------|
| Page components | 50-100 | 150 |
| UI components | 30-80 | 150 |
| Hooks | 30-60 | 100 |
| Analyzer prompt | 20-40 | 60 |
| Analyzer parser | 40-80 | 120 |
| Lib utilities | 30-80 | 150 |
| API routes | 40-80 | 120 |

If a file grows beyond limits, split it:
- Extract sub-components
- Move logic to hooks
- Create utility files

## Naming Conventions

### Files
- Components: `kebab-case.tsx` (e.g., `brand-card.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-brands.ts`)
- Types: `kebab-case.ts` (e.g., `database.ts`)
- Utilities: `kebab-case.ts` (e.g., `format.ts`)

### Components
- PascalCase exports (e.g., `export function BrandCard`)
- One primary component per file
- Small helper components can live in same file

### Types
- PascalCase for types/interfaces
- Suffix with purpose when helpful: `ParsedBasics`, `BrandWithAnalyses`

## Import Order

```typescript
// 1. React/Next
import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import { useQuery } from '@tanstack/react-query';

// 3. Internal absolute imports
import { Button } from '@/components/ui/button';
import { useBrands } from '@/hooks/use-brands';
import { cn } from '@/lib/utils/cn';

// 4. Relative imports
import { BrandCard } from './brand-card';

// 5. Types (if separate)
import type { Brand } from '@/types';
```

## Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

Usage:
```typescript
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
```

## Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx   # Server-side only

# OpenAI
OPENAI_API_KEY=sk-xxx           # Server-side only

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth (for Google Docs export) ✅ IMPLEMENTED
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
```

## Adding New Features

### New Analyzer
1. Create folder: `lib/analyzers/{name}/`
2. Add 4 files: `config.ts`, `prompt.ts`, `parser.ts`, `types.ts`
3. Register in `lib/analyzers/index.ts`
4. Add DB enum value
5. Create card: `components/analysis/cards/{name}-card.tsx`
6. Create form: `components/analysis/forms/{name}-form.tsx`

### New Scraper
1. Create folder: `lib/scrapers/{name}/`
2. Add files: `config.ts`, `index.ts`, (optional) `parser.ts`
3. Register in `lib/scrapers/index.ts`
4. Update `ScraperType` in `lib/scrapers/types.ts`

### New Page
1. Create folder in `app/(dashboard)/{route}/`
2. Add `page.tsx`
3. Create page-specific components in `components/{feature}/`

### New Hook
1. Create `hooks/use-{name}.ts`
2. Export from `hooks/index.ts` if creating barrel file

### New Doc Template
1. Create folder: `lib/docs/templates/{name}/`
2. Add 5 files: `config.ts`, `prompt.ts`, `parser.ts`, `types.ts`, `index.ts`
3. Register in `lib/docs/registry.ts`
4. Config specifies: name, description, icon, requiredAnalyzers, requiredFields

**Example config:**
```typescript
// lib/docs/templates/golden-circle/config.ts
export const config: DocTemplateConfig = {
  id: 'golden-circle',
  name: 'Golden Circle',
  description: "Simon Sinek's Why/How/What framework",
  icon: CircleDot,
  requiredAnalyzers: ['basics', 'customer'],
  requiredFields: {
    basics: ['business_description', 'business_model'],
    customer: ['primary_problem', 'buying_motivation'],
  },
};
```

### New Integration (e.g., Notion)

Follow the Google OAuth pattern:

1. Create folder: `lib/integrations/{name}/`
2. Add files: `config.ts`, `client.ts`, `{api}.ts`, `index.ts`
3. Add API routes: `app/api/integrations/{name}/auth`, `callback`, `disconnect`, `status`
4. Add export route: `app/api/export/{name}/route.ts`
5. Create hook: `hooks/use-{name}-integration.ts`
6. Add UI components: `components/integrations/{name}-connect-modal.tsx`
7. Add to settings page: Update `connected-apps-section.tsx`
