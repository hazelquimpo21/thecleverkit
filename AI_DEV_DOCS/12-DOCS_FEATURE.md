# Docs Feature — Implementation Plan

> **Status**: ✅ Implementation complete (Golden Circle template)
> **Created**: December 19, 2025
> **Completed**: December 19, 2025

## Overview

The docs feature allows users to generate useful documents from their brand's analyzed data. Documents like the "Golden Circle" (Simon Sinek's Why/How/What framework) help users articulate brand strategy based on the intelligence we've already gathered.

**Key principle**: Docs follow the same two-step AI pattern as analyzers (analyze → parse).

---

## Table of Contents

1. [Product Decisions](#product-decisions)
2. [User Flow](#user-flow)
3. [Data Model](#data-model)
4. [Architecture](#architecture)
5. [UI Design](#ui-design)
6. [Golden Circle Template](#golden-circle-template)
7. [Implementation Checklist](#implementation-checklist)
8. [Future Considerations](#future-considerations)

---

## Product Decisions

### Where do docs live?

**Decision**: Docs tab on the brand profile page.

```
/brands/[brandId]
├── Overview (current view - the three analyzer cards)
└── Docs (new tab)
```

**Why**: Simple mental model — "everything about this brand is here." We can add a global `/docs` view later when users have enough docs to need cross-brand browsing.

### How do users find available docs?

**Decision**: Show doc templates as cards with readiness status.

Users see:
- Available templates (Golden Circle, Brand Brief, etc.)
- Whether they have enough data to generate each one
- Their previously generated docs

### How do we check data sufficiency?

**Decision**: Each template declares its required analyzers and fields.

```typescript
{
  requiredAnalyzers: ['basics', 'customer'],
  requiredFields: {
    basics: ['business_description', 'business_model'],
    customer: ['primary_problem', 'buying_motivation'],
  },
}
```

We check the brand's analysis runs against these requirements and show "Ready" or "Needs data" status.

### What export options?

**MVP**:
- Copy as Markdown (clipboard)
- Download as PDF

**Future**:
- Google Docs
- Google Slides
- Canva (if API available)

### Do docs auto-update when brand data changes?

**Decision**: No. Docs are snapshots.

- Each doc stores a `source_data` snapshot of what data was used
- Users can manually regenerate to get an updated version
- We can show a "data has changed" indicator in the future

---

## User Flow

### Happy Path: Generate a Doc

```
Brand Profile
    │
    ▼
Click "Docs" tab
    │
    ▼
See available templates with readiness status
    │
    ▼
Click "Generate" on Golden Circle (marked "Ready")
    │
    ▼
Brief loading state (2-5 seconds)
    │
    ▼
Doc appears in "Your Docs" list
    │
    ▼
Click to view → see formatted doc
    │
    ▼
Export: Copy Markdown or Download PDF
```

### Unhappy Path: Insufficient Data

```
Brand Profile → Docs tab
    │
    ▼
Golden Circle shows "Needs more data"
    │
    ▼
Click to see what's missing
    │
    ▼
Modal shows: "This template needs [X] from Customer analyzer"
    │
    ▼
Options: "Edit Brand Data" or "Close"
```

---

## Data Model

### generated_docs Table

```sql
CREATE TABLE generated_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,

  -- Template identification
  template_id TEXT NOT NULL,          -- 'golden-circle', 'brand-brief', etc.
  title TEXT NOT NULL,                 -- Display title for the doc

  -- Content
  content JSONB NOT NULL,              -- Structured content from parser
  content_markdown TEXT,               -- Rendered markdown (for export)

  -- Snapshot of data used for generation
  source_data JSONB NOT NULL,          -- Copy of brand/analyzer data at generation time

  -- Status tracking
  status TEXT DEFAULT 'complete',      -- 'generating', 'complete', 'error'
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_generated_docs_brand_id ON generated_docs(brand_id);
CREATE INDEX idx_generated_docs_template ON generated_docs(template_id);
```

### TypeScript Type

```typescript
export type GeneratedDoc = {
  id: string;
  brand_id: string;
  template_id: string;
  title: string;
  content: Record<string, unknown>;
  content_markdown: string | null;
  source_data: Record<string, unknown>;
  status: 'generating' | 'complete' | 'error';
  error_message: string | null;
  created_at: string;
  updated_at: string;
};
```

---

## Architecture

### Two-Step AI Pattern for Docs

Same pattern as analyzers:

```
STEP 1: ANALYSIS (Natural Language Generation)
┌─────────────────────────────────────────────────────────────┐
│ Input: Brand's parsed analyzer data (basics, customer, etc) │
│ Prompt: "Write a Golden Circle for this brand..."           │
│ Output: Natural language doc content                        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
STEP 2: PARSING (Structured Extraction)
┌─────────────────────────────────────────────────────────────┐
│ Input: Natural language doc content from Step 1             │
│ Tool: Function calling with JSON schema                     │
│ Output: { why: "...", how: "...", what: "..." }            │
└─────────────────────────────────────────────────────────────┘
```

### Doc Template Module Structure

Each doc template is a self-contained folder:

```
lib/docs/templates/golden-circle/
├── config.ts      # Metadata, required analyzers, icon
├── prompt.ts      # Builds the analysis prompt
├── parser.ts      # Function schema for structured output
├── types.ts       # TypeScript types for parsed content
├── renderer.ts    # Converts parsed content to markdown
└── index.ts       # Exports DocTemplateDefinition
```

### Doc Template Interface

```typescript
// lib/docs/types.ts

export type DocTemplateConfig = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  requiredAnalyzers: AnalyzerType[];
  requiredFields?: {
    basics?: (keyof ParsedBasics)[];
    customer?: (keyof ParsedCustomer)[];
    products?: (keyof ParsedProducts)[];
  };
};

export type DocTemplateDefinition = {
  config: DocTemplateConfig;
  buildPrompt: (brandData: BrandData) => string;
  parseSystemPrompt: string;
  parseFunctionName: string;
  parseFunctionDescription: string;
  parseSchema: Record<string, unknown>;
  renderMarkdown: (content: ParsedDocContent) => string;
  generateTitle: (brandData: BrandData) => string;
};
```

### File Structure

```
lib/docs/
├── types.ts                    # DocTemplate, GeneratedDoc types
├── registry.ts                 # All available doc templates
├── generator.ts                # Orchestrates doc generation
├── readiness.ts                # Data sufficiency checks
│
└── templates/
    ├── golden-circle/
    │   ├── config.ts
    │   ├── prompt.ts
    │   ├── parser.ts
    │   ├── types.ts
    │   ├── renderer.ts
    │   └── index.ts
    │
    ├── brand-brief/            # Future
    └── customer-persona/       # Future
```

---

## UI Design

### Docs Tab Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Brand: Acme Co                                                  │
│  [Overview]   [Docs]                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GENERATE A DOC                                                  │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ 🎯              │  │ 📋              │  │ 👥              │  │
│  │ Golden Circle   │  │ Brand Brief     │  │ Customer        │  │
│  │                 │  │                 │  │ Persona         │  │
│  │ Define your     │  │ Complete brand  │  │ Detailed ideal  │  │
│  │ Why, How, What  │  │ overview        │  │ customer        │  │
│  │                 │  │                 │  │                 │  │
│  │ ✓ Ready         │  │ ✓ Ready         │  │ ⚠ Needs data   │  │
│  │ [Generate]      │  │ [Generate]      │  │ [See what's    │  │
│  │                 │  │                 │  │  needed]        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  YOUR DOCS (1)                                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📄 Golden Circle  •  Dec 19, 2025  •  [View] [Export ▾]  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Components Needed

| Component | Purpose |
|-----------|---------|
| `ProfileTabs` | Tab navigation (Overview / Docs) |
| `DocTemplateCard` | Single template with readiness status |
| `DocTemplateGrid` | Grid of available templates |
| `ReadinessBadge` | "Ready" or "Needs data" indicator |
| `MissingDataDialog` | Shows what data is needed |
| `DocList` | List of generated docs |
| `DocListItem` | Single doc with actions |
| `DocViewer` | Renders doc content |
| `DocExportMenu` | Export dropdown |

---

## Golden Circle Template

### What is the Golden Circle?

Simon Sinek's framework:
- **Why**: Your purpose, cause, or belief
- **How**: Your differentiating value proposition
- **What**: Your products or services

### Data Requirements

**Required analyzers**: `basics`, `customer`

**Required fields**:
- `basics.business_description` - What they do
- `basics.business_model` - How they operate
- `customer.primary_problem` - Why customers care
- `customer.buying_motivation` - What drives purchases

### Prompt Strategy

The analyzer step will:
1. Infer the "Why" from primary_problem + buying_motivation
2. Extract the "How" from business_model + approach
3. State the "What" from business_description + offerings

### Parsed Output Schema

```typescript
type GoldenCircleContent = {
  why: {
    headline: string;      // One sentence purpose statement
    explanation: string;   // 2-3 sentence expansion
  };
  how: {
    headline: string;      // How they deliver value
    explanation: string;   // Their approach/method
  };
  what: {
    headline: string;      // What they offer
    explanation: string;   // Products/services detail
  };
  summary: string;         // One paragraph tying it together
};
```

### Rendered Markdown

```markdown
# Golden Circle: [Brand Name]

## Why
**[headline]**

[explanation]

## How
**[headline]**

[explanation]

## What
**[headline]**

[explanation]

---

*[summary]*
```

---

## Implementation Checklist

### Phase 1: Foundation ✅

- [x] Create `generated_docs` table in Supabase (SQL provided, types ready)
- [x] Create `lib/docs/types.ts`
- [x] Create `lib/docs/registry.ts`
- [x] Create `lib/docs/generator.ts`
- [x] Create `lib/docs/readiness.ts`
- [x] Create `types/docs.ts`

### Phase 2: Golden Circle Template ✅

- [x] Create `lib/docs/templates/golden-circle/config.ts`
- [x] Create `lib/docs/templates/golden-circle/prompt.ts`
- [x] Create `lib/docs/templates/golden-circle/parser.ts`
- [x] Create `lib/docs/templates/golden-circle/types.ts`
- [x] Create `lib/docs/templates/golden-circle/renderer.ts`
- [x] Create `lib/docs/templates/golden-circle/index.ts`
- [ ] Test generation end-to-end (pending deployment)

### Phase 3: API & Hooks ✅

- [x] Create `POST /api/docs/generate` route
- [x] Create `lib/supabase/generated-docs.ts`
- [x] Create `hooks/use-docs.ts` (React Query - includes all doc hooks)
- [x] Readiness hooks integrated into `use-docs.ts`

### Phase 4: UI Components ✅

- [x] Create `components/brands/profile-tabs.tsx`
- [x] Create `components/docs/doc-template-card.tsx`
- [x] Create `components/docs/doc-template-grid.tsx`
- [x] Create `components/docs/readiness-badge.tsx`
- [x] Create `components/docs/missing-data-dialog.tsx`
- [x] Create `components/docs/doc-list.tsx`
- [x] Create `components/docs/doc-list-item.tsx`
- [x] Create `components/docs/doc-viewer.tsx`
- [x] Create `components/docs/doc-export-menu.tsx`

### Phase 5: Brand Profile Integration ✅

- [x] Add tabs to brand profile page
- [x] Create docs tab content component (`components/docs/docs-tab-content.tsx`)
- [x] Wire up generation flow
- [x] Wire up doc viewing
- [ ] Test full user flow (pending deployment)

### Phase 6: Export ✅

- [x] Implement copy to clipboard (markdown)
- [x] Implement PDF download (via html2pdf.js)
- [ ] Test exports (pending deployment)

---

## Future Considerations

### Additional Templates

1. **Brand Brief** - Comprehensive brand overview
2. **Customer Persona** - Detailed ideal customer profile
3. **Content Pillars** - Content strategy framework
4. **Messaging Guide** - Brand voice and messaging
5. **Content Calendar** - Monthly content suggestions

### Export Integrations

1. **Google Docs** - OAuth flow + Docs API — **See `13-GOOGLE_DOCS_EXPORT.md`** 📋 In Planning
2. **Google Slides** - Structured slide generation (future)
3. **Notion** - OAuth flow + Pages API (future)
4. **Canva** - May require manual approach (no official API)

### Doc Packs

Bundle multiple docs together:
> "Generate Starter Pack" → Golden Circle + Brand Brief + Customer Persona

### Freshness Indicators

Show when brand data has changed since doc was generated:
> "Brand data has changed since this doc was generated. [Regenerate]"

### Quality Scoring

Based on data completeness:
> "This doc will be ⭐⭐⭐ (3/5) based on available data. Add more product info for a stronger result."

### Versioning

Keep history of doc versions for comparison.

---

## Questions & Decisions Log

| Question | Decision | Date |
|----------|----------|------|
| Where do docs live? | Tab on brand profile | Dec 19 |
| First template? | Golden Circle | Dec 19 |
| Auto-update docs? | No, snapshots only | Dec 19 |
| Export options v1? | Copy markdown + PDF | Dec 19 |
| Two-step AI pattern? | Yes, same as analyzers | Dec 19 |
| Template ID type? | TEXT (not enum) for flexibility | Dec 19 |

---

## Implementation Notes (Dec 19, 2025)

### Files Created

**Types:**
- `types/docs.ts` - GeneratedDoc type, DocStatus, DocTemplateId
- `types/index.ts` - Updated to export docs types
- `types/database.ts` - Added generated_docs table type

**Library:**
- `lib/docs/types.ts` - DocTemplateConfig, DocTemplateDefinition, BrandData
- `lib/docs/registry.ts` - Template registration and lookup
- `lib/docs/readiness.ts` - Data sufficiency checking
- `lib/docs/generator.ts` - Two-step AI generation orchestration
- `lib/docs/index.ts` - Central exports

**Golden Circle Template:**
- `lib/docs/templates/golden-circle/config.ts` - Template metadata
- `lib/docs/templates/golden-circle/types.ts` - GoldenCircleContent type
- `lib/docs/templates/golden-circle/prompt.ts` - Brand strategist prompt
- `lib/docs/templates/golden-circle/parser.ts` - Function schema for parsing
- `lib/docs/templates/golden-circle/renderer.ts` - Markdown generation
- `lib/docs/templates/golden-circle/index.ts` - Template definition export

**Database:**
- `lib/supabase/generated-docs.ts` - CRUD operations

**API:**
- `app/api/docs/generate/route.ts` - POST endpoint for generation

**Hooks:**
- `hooks/use-docs.ts` - React Query hooks (useBrandDocs, useDoc, useGenerateDoc, etc.)
- `hooks/index.ts` - Updated to export docs hooks

**Components:**
- `components/docs/index.ts` - Central exports
- `components/docs/readiness-badge.tsx` - Ready/needs data indicator
- `components/docs/missing-data-dialog.tsx` - Shows missing requirements
- `components/docs/doc-template-card.tsx` - Template card with generate button
- `components/docs/doc-template-grid.tsx` - Grid of template cards
- `components/docs/doc-list.tsx` - List of generated docs
- `components/docs/doc-list-item.tsx` - Single doc with actions
- `components/docs/doc-viewer.tsx` - Dialog to view doc content
- `components/docs/doc-export-menu.tsx` - Export dropdown menu
- `components/docs/docs-tab-content.tsx` - Main docs tab content
- `components/brands/profile-tabs.tsx` - Overview/Docs tab navigation

**Modified:**
- `components/brands/brand-analysis-content.tsx` - Added tab integration

### Database Setup Required

Run this SQL in Supabase to create the `generated_docs` table:

```sql
-- Create generated_docs table
CREATE TABLE generated_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  content_markdown TEXT,
  source_data JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'complete',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_generated_docs_brand_id ON generated_docs(brand_id);
CREATE INDEX idx_generated_docs_template ON generated_docs(template_id);

-- RLS policies
ALTER TABLE generated_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own docs"
  ON generated_docs FOR SELECT
  USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert docs for their brands"
  ON generated_docs FOR INSERT
  WITH CHECK (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own docs"
  ON generated_docs FOR UPDATE
  USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own docs"
  ON generated_docs FOR DELETE
  USING (
    brand_id IN (SELECT id FROM brands WHERE user_id = auth.uid())
  );
```

### Adding New Templates

To add a new doc template:

1. Create folder: `lib/docs/templates/[template-name]/`
2. Create files: `config.ts`, `types.ts`, `prompt.ts`, `parser.ts`, `renderer.ts`, `index.ts`
3. Export template from `lib/docs/templates/[template-name]/index.ts`
4. Register in `lib/docs/registry.ts`
5. Add template ID to `types/docs.ts` DocTemplateId union
6. Export from `lib/docs/index.ts`

---

## Related Documentation

- `02-ARCHITECTURE.md` - Overall system design
- `03-DATA_MODEL.md` - Database schema
- `04-USER_STORIES.md` - User stories for docs
- `08-UI_COMPONENTS.md` - UI patterns for docs
- `09-FILE_STRUCTURE.md` - Where doc files go
- `10-API_PATTERNS.md` - API and hook patterns
- `11-IMPLEMENTATION_ROADMAP.md` - Phase 12 checklist
- `13-GOOGLE_DOCS_EXPORT.md` - Google Docs export implementation plan
- `14-GOOGLE_CLOUD_SETUP.md` - Step-by-step Google Cloud setup guide
