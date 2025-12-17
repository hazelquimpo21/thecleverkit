# File Structure

## Overview

The project uses Next.js 14 App Router with a modular structure. No file should exceed ~400 lines.

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
│   ├── layout.tsx                    ← Root layout with Header
│   ├── page.tsx                      ← Home page (add brand form)
│   ├── globals.css                   ← Global styles, CSS variables
│   │
│   ├── login/
│   │   └── page.tsx                  ← Login page (magic link auth) ✅
│   │
│   ├── brands/
│   │   └── [brandId]/
│   │       └── page.tsx              ← Brand profile page ✅
│   │
│   ├── dashboard/                    ← (planned)
│   │   └── page.tsx                  ← Brand list view
│   │
│   ├── settings/                     ← (planned)
│   │   └── page.tsx                  ← User settings
│   │
│   └── api/
│       ├── auth/
│       │   └── callback/
│       │       └── route.ts          ← Supabase auth callback ✅
│       └── brands/
│           └── analyze/
│               └── route.ts          ← Main analysis endpoint ✅
│
├── components/
│   ├── ui/                           ← shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── skeleton.tsx
│   │   ├── checkbox.tsx
│   │   └── form.tsx                  ← react-hook-form integration
│   │
│   ├── layout/
│   │   ├── header.tsx                ← App header with auth-aware nav
│   │   ├── page-container.tsx        ← Page width wrapper
│   │   └── page-header.tsx           ← Title + actions pattern
│   │
│   ├── auth/
│   │   ├── login-form.tsx            ← Magic link login form
│   │   └── index.ts                  ← Auth component exports
│   │
│   ├── brands/
│   │   ├── brand-card.tsx            ← Single brand in list
│   │   ├── brand-list.tsx            ← Grid of brand cards
│   │   ├── brand-empty.tsx           ← Empty state
│   │   ├── add-brand-form.tsx        ← URL input form
│   │   └── status-badge.tsx          ← Analysis status indicator
│   │
│   ├── analysis/
│   │   ├── progress-list.tsx         ← Full progress view
│   │   ├── progress-item.tsx         ← Single analyzer row
│   │   ├── analyzer-card.tsx         ← Base results card
│   │   ├── field.tsx                 ← Label/value display
│   │   ├── error-state.tsx           ← Error with retry
│   │   └── loading-state.tsx         ← Skeleton loader
│   │
│   ├── analysis/cards/               ← Analyzer-specific result displays
│   │   ├── basics-card.tsx
│   │   ├── customer-card.tsx
│   │   └── products-card.tsx
│   │
│   ├── analysis/forms/               ← Analyzer-specific edit forms
│   │   ├── basics-form.tsx
│   │   ├── customer-form.tsx
│   │   └── products-form.tsx
│   │
│   └── brand-profile/
│       ├── profile-header.tsx        ← Brand name, URL, actions
│       └── coming-soon.tsx           ← Future docs teaser
│
├── lib/
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
│   ├── supabase/
│   │   ├── client.ts                 ← Browser client
│   │   ├── server.ts                 ← Server client
│   │   ├── middleware.ts             ← Auth middleware helper
│   │   ├── brands.ts                 ← Brand CRUD
│   │   ├── analysis-runs.ts          ← Analysis run CRUD
│   │   └── profiles.ts               ← Profile CRUD
│   │
│   ├── api/
│   │   └── openai.ts                 ← GPT call wrappers
│   │
│   └── utils/
│       ├── cn.ts                     ← clsx/tailwind-merge helper
│       └── format.ts                 ← Date, URL formatters
│
├── hooks/
│   ├── use-auth.ts                   ← Auth hook (user, isLoading, signOut)
│   ├── use-brands.ts                 ← TanStack Query: brands (planned)
│   ├── use-brand.ts                  ← TanStack Query: single brand (planned)
│   ├── use-analysis-runs.ts          ← TanStack Query: analysis runs (planned)
│   ├── use-realtime-analysis.ts      ← Supabase realtime subscription (planned)
│   └── index.ts                      ← Hook exports
│
├── types/
│   ├── database.ts                   ← Supabase table types
│   └── index.ts                      ← Re-exports
│
├── public/
│   ├── logo.svg
│   └── favicon.ico
│
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
