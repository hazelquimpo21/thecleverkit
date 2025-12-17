# Analyzers

## What Is an Analyzer?

An analyzer extracts specific structured information from scraped brand content using a two-step AI process:

1. **Analysis**: A GPT prompt that reads scraped content and writes natural-language observations
2. **Parsing**: A GPT function call that extracts structured fields from those observations

This separation produces better results than asking for JSON directly.

## MVP Analyzers

| ID | Name | Purpose |
|----|------|---------|
| `basics` | Basics | Business name, founder, industry, what they do |
| `customer` | Customer Profile | Who they serve, problems, subcultures |
| `products` | Products & Pricing | What they sell, prices, positioning |

## File Structure

Each analyzer is a folder with small, focused files:

```
/lib/analyzers/
  basics/
    config.ts      ← metadata (id, name, icon, dependencies)
    prompt.ts      ← the analysis prompt builder
    parser.ts      ← the function schema + post-processing
    types.ts       ← TypeScript types for parsed output
    
  customer/
    config.ts
    prompt.ts
    parser.ts
    types.ts
    
  products/
    config.ts
    prompt.ts
    parser.ts
    types.ts
    
  index.ts         ← registry: exports all analyzers as a map
  types.ts         ← shared types (AnalyzerConfig, etc.)
  runner.ts        ← orchestration logic
```

## Analyzer Config

Every analyzer exports a config object:

```typescript
// lib/analyzers/basics/config.ts

import { Building2 } from 'lucide-react';
import type { AnalyzerConfig } from '../types';

export const config: AnalyzerConfig = {
  id: 'basics',
  name: 'Basics',
  description: 'Core business information',
  icon: Building2,
  dependsOn: [],  // No dependencies, runs immediately
};
```

**Config Fields:**

| Field | Type | Purpose |
|-------|------|---------|
| `id` | string | Unique identifier, matches DB enum |
| `name` | string | Display name in UI |
| `description` | string | Short explanation for users |
| `icon` | LucideIcon | Icon component for cards |
| `dependsOn` | string[] | IDs of analyzers that must complete first |

## Analyzer Prompt

The prompt builder creates a natural-language analysis request:

```typescript
// lib/analyzers/basics/prompt.ts

import type { PromptBuilder } from '../types';

export const buildPrompt: PromptBuilder = (scrapedContent, _priorResults) => {
  return `You are a sharp brand strategist doing intake research on a new client. 
You've just reviewed their website content (provided below).

Write a brief, natural summary covering:
- What the business is called and who founded it (if apparent)
- Roughly when they seem to have started (if mentioned or inferable)
- What industry or space they operate in
- What this business actually does—explain it like you're telling a colleague

Be conversational and observant. Note if anything is unclear or missing 
from the website. Don't use bullet points or structured formatting—just 
write naturally as if you're jotting notes after reviewing their site.

---
WEBSITE CONTENT:
${scrapedContent}`;
};
```

**Prompt Guidelines:**
- Write as if talking to a human strategist
- Never ask for JSON or structured output
- Encourage noting uncertainty ("if mentioned", "seems like")
- Keep it focused—one analyzer = one topic area
- Reference prior results if this analyzer has dependencies

## Analyzer Parser

The parser defines the function schema and any post-processing:

```typescript
// lib/analyzers/basics/parser.ts

import type { ParserDefinition } from '../types';
import type { ParsedBasics } from './types';

export const parser: ParserDefinition<ParsedBasics> = {
  // Prompt sent with the function call
  systemPrompt: `You are a precise data extraction assistant. 
Read the brand analysis below and extract the requested fields. 
If something wasn't mentioned or is genuinely unclear, use null.`,

  // The function schema for GPT
  functionName: 'extract_basics',
  functionDescription: 'Extract basic business information from analysis',
  
  schema: {
    type: 'object',
    properties: {
      business_name: {
        type: 'string',
        description: 'The name of the business',
      },
      founder_name: {
        type: ['string', 'null'],
        description: 'Name of founder if mentioned',
      },
      founded_year: {
        type: ['string', 'null'],
        description: 'Year founded, or approximate like "circa 2021"',
      },
      industry: {
        type: 'string',
        description: 'The industry or space they operate in',
      },
      business_description: {
        type: 'string',
        description: '1-2 sentence description of what the business does',
      },
      business_model: {
        type: 'string',
        enum: [
          'B2B Services',
          'B2C Services', 
          'B2B Products',
          'B2C Products',
          'B2B SaaS',
          'B2C SaaS',
          'Marketplace',
          'Agency',
          'Consultancy',
          'Other',
        ],
        description: 'The primary business model',
      },
    },
    required: ['business_name', 'industry', 'business_description', 'business_model'],
  },

  // Optional post-processing
  postProcess: (raw: ParsedBasics): ParsedBasics => {
    return {
      ...raw,
      // Normalize business name capitalization
      business_name: raw.business_name?.trim() || 'Unknown Business',
    };
  },
};
```

**Parser Guidelines:**
- System prompt is minimal—just "extract from the analysis"
- Schema describes each field clearly for GPT
- Use `['string', 'null']` for optional fields
- Use enums where there are known categories
- `postProcess` handles cleanup, defaults, normalization

## Analyzer Types

Each analyzer defines its parsed output shape:

```typescript
// lib/analyzers/basics/types.ts

export type ParsedBasics = {
  business_name: string;
  founder_name: string | null;
  founded_year: string | null;
  industry: string;
  business_description: string;
  business_model: string;
};
```

## Registry

The registry combines all analyzers for easy access:

```typescript
// lib/analyzers/index.ts

import { config as basicsConfig } from './basics/config';
import { buildPrompt as basicsPrompt } from './basics/prompt';
import { parser as basicsParser } from './basics/parser';

import { config as customerConfig } from './customer/config';
import { buildPrompt as customerPrompt } from './customer/prompt';
import { parser as customerParser } from './customer/parser';

import { config as productsConfig } from './products/config';
import { buildPrompt as productsPrompt } from './products/prompt';
import { parser as productsParser } from './products/parser';

import type { AnalyzerDefinition } from './types';

export const analyzers: Record<string, AnalyzerDefinition> = {
  basics: {
    config: basicsConfig,
    buildPrompt: basicsPrompt,
    parser: basicsParser,
  },
  customer: {
    config: customerConfig,
    buildPrompt: customerPrompt,
    parser: customerParser,
  },
  products: {
    config: productsConfig,
    buildPrompt: productsPrompt,
    parser: productsParser,
  },
};

export const analyzerIds = Object.keys(analyzers);
export const analyzerConfigs = Object.values(analyzers).map(a => a.config);
```

## Execution Flow

See `05-RUNNER.md` for full orchestration details. Summary:

1. Runner receives brand ID and list of analyzer IDs to run
2. Builds execution plan (groups into waves by dependencies)
3. For each wave, runs analyzers concurrently
4. Each analyzer: update status → run prompt → update status → run parser → save results

## Adding a New Analyzer

### Step 1: Create the folder

```
/lib/analyzers/competitors/
  config.ts
  prompt.ts
  parser.ts
  types.ts
```

### Step 2: Define the config

```typescript
// competitors/config.ts
export const config: AnalyzerConfig = {
  id: 'competitors',
  name: 'Competitors',
  description: 'Competitive landscape analysis',
  icon: Users,
  dependsOn: ['basics'],  // Needs industry from basics
};
```

### Step 3: Write the prompt

```typescript
// competitors/prompt.ts
export const buildPrompt: PromptBuilder = (scrapedContent, priorResults) => {
  const basics = priorResults?.basics as ParsedBasics;
  
  return `You are a brand strategist analyzing the competitive landscape...
  
This business is in the ${basics?.industry || 'unknown'} industry.

Based on the website content, identify:
- Who their main competitors likely are
- How they position themselves differently
...

WEBSITE CONTENT:
${scrapedContent}`;
};
```

### Step 4: Define the parser

```typescript
// competitors/parser.ts
export const parser: ParserDefinition<ParsedCompetitors> = {
  systemPrompt: '...',
  functionName: 'extract_competitors',
  schema: { ... },
};
```

### Step 5: Define types

```typescript
// competitors/types.ts
export type ParsedCompetitors = {
  likely_competitors: string[];
  positioning_differentiator: string;
  // ...
};
```

### Step 6: Add to registry

```typescript
// lib/analyzers/index.ts
import { config as competitorsConfig } from './competitors/config';
// ...

export const analyzers = {
  // ...existing
  competitors: { config: competitorsConfig, buildPrompt: competitorsPrompt, parser: competitorsParser },
};
```

### Step 7: Add to database enum

```sql
ALTER TYPE analyzer_type ADD VALUE 'competitors';
```

### Step 8: Create UI card component

```
/components/analysis/competitors-card.tsx
```

That's it. The runner picks it up automatically.

## MVP Analyzer Specs

### Basics

**Prompt focus:** Business identity and fundamentals  
**Parsed fields:**
- `business_name` (string)
- `founder_name` (string | null)
- `founded_year` (string | null)
- `industry` (string)
- `business_description` (string)
- `business_model` (enum)

### Customer Profile

**Prompt focus:** Who they serve and why  
**Parsed fields:**
- `subcultures` (string[])
- `primary_problem` (string)
- `secondary_problems` (string[])
- `customer_sophistication` (enum: Beginner/Informed/Expert)
- `buying_motivation` (enum: Pain relief/Aspiration/Necessity/Curiosity/Status)

### Products & Pricing

**Prompt focus:** What they sell and at what price point  
**Parsed fields:**
- `offering_type` (enum: Products/Services/Both/Unclear)
- `offerings` (array of objects with name, description, price, pricing_model)
- `primary_offer` (string)
- `price_positioning` (enum: Budget/Mid-market/Premium/Luxury/Unclear)
