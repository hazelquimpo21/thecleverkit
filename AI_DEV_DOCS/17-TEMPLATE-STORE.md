# Template Store — Feature Specification

> **Status**: Planning
> **Created**: December 19, 2025
> **Prerequisite**: Read `15-REDESIGN-VISION.md` for design context

---

## Overview

The Template Store is where users discover, browse, and generate documents from their brand intelligence. It transforms the utilitarian "doc templates" concept into a delightful gallery experience.

**Core Metaphor**: A curated gallery of brand intelligence tools, not a sterile dropdown menu.

---

## Table of Contents

1. [User Stories](#user-stories)
2. [Information Architecture](#information-architecture)
3. [Template Store Tab (Per-Brand)](#template-store-tab-per-brand)
4. [Global Template Store (Future)](#global-template-store-future)
5. [Template Card Design](#template-card-design)
6. [Template Categories](#template-categories)
7. [Generation History](#generation-history)
8. [Empty & Edge States](#empty--edge-states)
9. [Implementation Details](#implementation-details)

---

## User Stories

### US-STORE-01: Browse Available Templates

**As a** user viewing a brand profile
**I want to** see all document templates available for this brand
**So that** I can discover what deliverables I can create

**Acceptance Criteria**:
- [ ] Store tab is visible on brand profile
- [ ] Shows all registered templates
- [ ] Each template shows name, description, visual preview
- [ ] Readiness status is clear (Ready vs. Needs data)
- [ ] Templates are organized by category

---

### US-STORE-02: Understand Template Purpose

**As a** user browsing templates
**I want to** understand what each template produces before generating
**So that** I can choose the right deliverable for my needs

**Acceptance Criteria**:
- [ ] Each template has a clear description
- [ ] Visual representation of what the output looks like
- [ ] Example or preview available (future enhancement)

---

### US-STORE-03: See Data Readiness

**As a** user considering a template
**I want to** know if I have enough data to generate it
**So that** I don't waste time on templates I can't use

**Acceptance Criteria**:
- [ ] "Ready" badge for templates with sufficient data
- [ ] "Needs data" badge for templates missing requirements
- [ ] Clicking "Needs data" shows exactly what's missing
- [ ] Clear path to fix missing data (edit brand)

---

### US-STORE-04: See Generation History

**As a** user who has generated documents before
**I want to** see which templates I've already used
**So that** I know what I've created and can regenerate if needed

**Acceptance Criteria**:
- [ ] Templates show "Generated" indicator if used
- [ ] Shows count of times generated (e.g., "Generated 2x")
- [ ] Can navigate to existing docs from template card
- [ ] Can regenerate new version from template

---

### US-STORE-05: Generate Document

**As a** user ready to create a deliverable
**I want to** generate a document from a template
**So that** I can use the brand intelligence in my work

**Acceptance Criteria**:
- [ ] One-click generation for ready templates
- [ ] Shows brief generating state
- [ ] Success navigates to view the doc (or opens viewer)
- [ ] Error shows helpful message with retry option

---

### US-STORE-06: Discover New Templates

**As a** user
**I want to** discover templates I haven't used yet
**So that** I can get more value from the platform

**Acceptance Criteria**:
- [ ] "Coming Soon" section for planned templates
- [ ] Visual preview of future templates
- [ ] Optional: email signup for template launch notifications

---

## Information Architecture

### Where Does the Store Live?

**Decision**: The store is a **tab on the brand profile page**.

```
/brands/[brandId]
├── Overview (analyzer cards)
├── Documents (generated docs list)
└── Store (template gallery) ← NEW
```

**Rationale**:
- Users think brand-first ("What can I create for Acme?")
- Templates require brand data, so brand context is needed
- Keeps the mental model simple: everything about a brand is in one place

### URL Structure

```
/brands/[brandId]?tab=store
```

Use query parameter for tab state, allowing direct linking.

### Navigation Flow

```
Dashboard
    │
    ▼
Brand Profile
    │
    ├── Overview tab (default)
    │
    ├── Documents tab
    │       └── List of generated docs
    │       └── Click doc → viewer opens
    │
    └── Store tab
            └── Template gallery
            └── Click "Generate" → doc created → viewer opens
            └── Click "See what's needed" → modal with missing data
```

---

## Template Store Tab (Per-Brand)

### Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  GENERATE A DOCUMENT                                            │
│                                                                 │
│  Choose a template to transform your brand intelligence         │
│  into a polished deliverable.                                   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  STRATEGY                                            View all → │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   [Illustration] │  │   [Illustration] │  │ [Illustration]│  │
│  │                  │  │                  │  │              │  │
│  │  Golden Circle   │  │  Brand Brief     │  │ Brand Story  │  │
│  │                  │  │                  │  │              │  │
│  │  Define your     │  │  Complete brand  │  │ Narrative    │  │
│  │  Why, How, What  │  │  overview doc    │  │ arc          │  │
│  │                  │  │                  │  │              │  │
│  │  ✓ Ready         │  │  ✓ Ready         │  │ Coming Soon  │  │
│  │  Generated 1x    │  │                  │  │              │  │
│  │                  │  │                  │  │              │  │
│  │  [Generate]      │  │  [Generate]      │  │ [Notify Me]  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AUDIENCE                                            View all → │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   [Illustration] │  │   [Illustration] │                    │
│  │                  │  │                  │                    │
│  │  Customer        │  │  Buyer Journey   │                    │
│  │  Persona         │  │  Map             │                    │
│  │                  │  │                  │                    │
│  │  ⚠ Needs data   │  │  Coming Soon     │                    │
│  │                  │  │                  │                    │
│  │  [See needed]    │  │  [Notify Me]     │                    │
│  └──────────────────┘  └──────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Specifications

**Header Section**:
- Title: "Generate a Document" (text-2xl, font-semibold)
- Subtitle: Warm, helpful description (text-foreground-muted)
- Top padding: 24px, bottom padding: 16px

**Category Sections**:
- Category label: text-sm, font-semibold, text-foreground-muted, uppercase, tracking-wide
- "View all →" link (if more than 3 templates in category)
- Grid: 3 columns, gap-6

**Template Cards**:
- Width: Flexible within grid (roughly 280-320px each)
- Height: Auto, but consistent within row
- Border-radius: var(--radius-xl) - 20px
- Background: var(--surface)
- Shadow: var(--shadow-warm-sm)
- Hover: var(--shadow-warm-md), translateY(-2px)

---

## Global Template Store (Future)

For v2, consider a global store page:

```
/store

Purpose:
- Browse ALL templates without brand context
- Discover what's possible
- Marketing/educational value
- Each template shows "X of your brands are ready for this"
```

**Not implementing now** — keep scope focused on per-brand store.

---

## Template Card Design

### Card Structure

```
┌─────────────────────────────────────────┐
│                                         │
│         [Illustration Area]             │  ← 120px height
│         Geometric shapes or             │     Background: category color light
│         simple diagram                  │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  Template Name                          │  ← text-lg, font-medium
│                                         │
│  Short description that explains        │  ← text-sm, text-foreground-muted
│  what this template produces.           │     2 lines max, truncate
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ✓ Ready              Generated 2x      │  ← Status row
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [────────── Generate ──────────]       │  ← Full-width button
│                                         │
└─────────────────────────────────────────┘
```

### Card States

#### Ready State
- Badge: "Ready" with success styling (sage green)
- Button: Primary "Generate" button
- If previously generated: "Generated Nx" indicator

#### Needs Data State
- Badge: "Needs data" with warning styling (mustard)
- Button: Secondary "See what's needed" button
- Opens modal showing missing requirements

#### Coming Soon State
- Badge: "Coming Soon" with muted styling
- Illustration: Greyed out or placeholder
- Button: "Notify Me" (optional, for email capture)
- Card has reduced opacity (0.7)

#### Generating State (while creating doc)
- Button becomes loading state
- Shows "Generating..." with spinner
- Card is non-interactive during generation

### Illustration Area

Each template should have a simple geometric illustration representing its output. These should be:
- CSS-based or inline SVG (no image files needed)
- Use template's category color
- Simple geometric shapes
- Educational/diagram feel (1960s textbook aesthetic)

**Golden Circle Example**:
```
    ╭─────────╮
   ╱   WHY     ╲
  │  ╭─────╮    │
  │ ╱  HOW  ╲   │
  │ │ WHAT  │   │
  │  ╲     ╱    │
  │   ╰───╯     │
   ╲           ╱
    ╰─────────╯

Three concentric circles with labels
Colors: Gradient from sage green to teal
```

**Brand Brief Example**:
```
  ┌─────────────┐
  │ ═══════════ │
  │ ─────────── │
  │ ─────────── │
  │             │
  │ • ───────── │
  │ • ───────── │
  │ • ───────── │
  └─────────────┘

Document with header and bullet points
Color: Dusty teal
```

**Customer Persona Example**:
```
     ╭───╮
     │ 👤 │
     ╰───╯
    ╱     ╲
   ╱───────╲
  │ ─────── │
  │ ─────── │
  └─────────┘

Simplified person silhouette with profile card
Color: Dusty rose
```

---

## Template Categories

### Strategy
Templates for brand strategy and positioning.

| Template | Status | Description |
|----------|--------|-------------|
| Golden Circle | Implemented | Simon Sinek's Why/How/What framework |
| Brand Brief | Planned | Comprehensive brand overview document |
| Brand Story | Future | Narrative arc of the brand |
| Positioning Statement | Future | Clear market positioning |

### Audience
Templates about customers and audience.

| Template | Status | Description |
|----------|--------|-------------|
| Customer Persona | Planned | Detailed ideal customer profile |
| Buyer Journey Map | Future | Customer decision-making path |
| Problem/Solution Fit | Future | Pain points and solutions mapping |

### Content
Templates for content strategy.

| Template | Status | Description |
|----------|--------|-------------|
| Content Pillars | Future | Key themes for content creation |
| Messaging Guide | Future | Brand voice and key messages |
| Tagline Options | Future | Generated tagline variations |

### Sales
Templates for sales enablement.

| Template | Status | Description |
|----------|--------|-------------|
| Elevator Pitch | Future | 30-second brand pitch |
| Objection Handling | Future | Common objections and responses |
| Value Proposition | Future | Clear value statement |

---

## Generation History

### On Template Card

When a template has been used before:

```
┌─────────────────────────────────────────┐
│         [Illustration]                  │
├─────────────────────────────────────────┤
│  Golden Circle                          │
│  Define your Why, How, What             │
├─────────────────────────────────────────┤
│  ✓ Ready              Generated 2x      │  ← History indicator
│                       ↳ View latest     │  ← Link to most recent doc
├─────────────────────────────────────────┤
│  [Generate New]                         │  ← Creates new doc
└─────────────────────────────────────────┘
```

### Generation Count Logic

```typescript
// Query count of docs for this brand + template
const generationCount = docs.filter(
  d => d.template_id === template.id && d.brand_id === brandId
).length;
```

### "View Latest" Action

- Links to the most recently generated doc of this type
- Opens the doc viewer dialog
- Or navigates to Documents tab with that doc expanded

---

## Empty & Edge States

### No Templates Ready

When brand has no data (e.g., analysis failed or incomplete):

```
┌─────────────────────────────────────────┐
│                                         │
│     [Geometric illustration]            │
│                                         │
│  Complete your brand analysis first     │
│                                         │
│  Templates need brand intelligence to   │
│  generate documents. Once your analysis │
│  is complete, you'll see which          │
│  templates are ready.                   │
│                                         │
│  [View Analysis Status]                 │
│                                         │
└─────────────────────────────────────────┘
```

### All Templates Generated

Celebrate completeness:

```
┌─────────────────────────────────────────┐
│                                         │
│  You've generated all available         │
│  templates for this brand!              │
│                                         │
│  [View Your Documents]                  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  COMING SOON                            │
│  [Coming soon templates grid...]        │
│                                         │
└─────────────────────────────────────────┘
```

### Missing Data Dialog

When user clicks "See what's needed":

```
┌─────────────────────────────────────────┐
│                                         │
│  Customer Persona needs more data       │  ← Title
│                                    [X]  │  ← Close button
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  This template requires information     │
│  from the following analyzers:          │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │ ✓ Business Basics        Complete │  │
│  │ ✗ Customer Profile       Missing  │  │  ← List of requirements
│  │   └ primary_problem               │  │
│  │   └ buying_motivation             │  │
│  │ ✓ Products & Pricing     Complete │  │
│  └───────────────────────────────────┘  │
│                                         │
│  Run the Customer analyzer or edit      │
│  your brand data to add this info.      │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [Cancel]              [Edit Brand Data]│
│                                         │
└─────────────────────────────────────────┘
```

---

## Implementation Details

### Component Structure

```
components/store/
├── store-tab-content.tsx      # Main container for store tab
├── template-category.tsx      # Category section with grid
├── template-gallery-card.tsx  # Individual template card
├── template-illustration.tsx  # Geometric illustrations
├── generation-indicator.tsx   # "Generated 2x" badge
└── coming-soon-badge.tsx      # Coming soon state
```

### Data Requirements

#### Template Registry Extension

Add to existing template registry (`lib/docs/registry.ts`):

```typescript
export type DocTemplateConfig = {
  id: string;
  name: string;
  description: string;
  shortDescription: string;  // For card (2 lines max)
  category: 'strategy' | 'audience' | 'content' | 'sales';
  icon: LucideIcon;
  status: 'available' | 'coming_soon';
  requiredAnalyzers: AnalyzerType[];
  requiredFields?: {...};
  illustrationComponent?: React.ComponentType;  // Custom illustration
};
```

#### Template Categories

```typescript
// lib/docs/categories.ts

export const TEMPLATE_CATEGORIES = {
  strategy: {
    id: 'strategy',
    label: 'Strategy',
    description: 'Brand strategy and positioning',
    order: 1,
  },
  audience: {
    id: 'audience',
    label: 'Audience',
    description: 'Customer and audience insights',
    order: 2,
  },
  content: {
    id: 'content',
    label: 'Content',
    description: 'Content strategy and messaging',
    order: 3,
  },
  sales: {
    id: 'sales',
    label: 'Sales',
    description: 'Sales enablement materials',
    order: 4,
  },
} as const;
```

### Hooks Needed

```typescript
// hooks/use-store.ts

// Get templates grouped by category with readiness status
export function useTemplateStore(brandId: string) {
  const templates = useTemplates();  // All registered templates
  const readiness = useTemplateReadiness(brandId);  // Readiness for this brand
  const docs = useBrandDocs(brandId);  // Existing docs

  return {
    categories: groupByCategory(templates, readiness, docs),
    isLoading: ...,
  };
}

// Get generation count for a specific template
export function useTemplateGenerationCount(brandId: string, templateId: string) {
  const { data: docs } = useBrandDocs(brandId);
  return docs?.filter(d => d.template_id === templateId).length ?? 0;
}
```

### API Considerations

No new API routes needed — uses existing:
- `GET /api/brands/[brandId]` — Brand data
- `POST /api/docs/generate` — Generate doc
- Existing React Query hooks for docs

---

## Success Metrics

- [ ] Users can find and understand all available templates
- [ ] Time to generate first doc < 10 seconds from store view
- [ ] Users discover templates they didn't know existed
- [ ] Clear understanding of what data is needed for locked templates
- [ ] Users return to generate multiple documents

---

## Future Enhancements

### Template Preview
- Click to see example output before generating
- Sample data for preview

### Template Recommendations
- "Recommended for you" based on brand data completeness
- "Popular with similar brands" (requires usage analytics)

### Batch Generation
- "Generate Starter Pack" — Multiple templates at once
- Discount pricing for bundles (if monetized)

### Template Customization
- User preferences for doc style
- Custom sections or emphasis

---

## Related Documentation

- `15-REDESIGN-VISION.md` — Overall design direction
- `16-REDESIGN-TASKS.md` — Implementation task breakdown
- `12-DOCS_FEATURE.md` — Existing docs feature spec
- `08-UI_COMPONENTS.md` — Component patterns
