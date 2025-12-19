# UI Redesign — Implementation Tasks

> **Status**: Planning
> **Created**: December 19, 2025
> **Prerequisite**: Read `15-REDESIGN-VISION.md` first for design context

---

## Overview

This document breaks down the UI redesign into implementable phases. Each phase builds on the previous, allowing for incremental progress while maintaining a working application.

---

## Phase 1: Design System Foundation

**Goal**: Update CSS variables and base styling without changing component structure.

### Task 1.1: Update Global CSS Variables

**File**: `app/globals.css`

Replace the existing color system with the new 1960s science textbook palette:

```css
@layer base {
  :root {
    /* === BACKGROUNDS === */
    --background: oklch(0.96 0.015 85);
    --surface: oklch(0.99 0.008 85);
    --surface-elevated: oklch(1 0 0);
    --surface-muted: oklch(0.94 0.012 85);

    /* === TEXT === */
    --foreground: oklch(0.28 0.01 60);
    --foreground-muted: oklch(0.58 0.015 60);
    --foreground-subtle: oklch(0.72 0.012 60);

    /* === BRAND & ACTIONS === */
    --primary: oklch(0.55 0.14 35);
    --primary-hover: oklch(0.50 0.14 35);
    --primary-foreground: oklch(0.99 0.008 85);

    /* === SEMANTIC COLORS (Analyzer Categories) === */
    --color-basics: oklch(0.62 0.08 155);
    --color-basics-light: oklch(0.92 0.03 155);
    --color-customer: oklch(0.65 0.08 15);
    --color-customer-light: oklch(0.94 0.025 15);
    --color-products: oklch(0.72 0.12 85);
    --color-products-light: oklch(0.95 0.04 85);
    --color-docs: oklch(0.60 0.06 220);
    --color-docs-light: oklch(0.94 0.02 220);

    /* === STATUS COLORS === */
    --success: oklch(0.62 0.10 155);
    --success-light: oklch(0.94 0.03 155);
    --warning: oklch(0.75 0.12 70);
    --warning-light: oklch(0.95 0.04 70);
    --error: oklch(0.55 0.12 25);
    --error-light: oklch(0.94 0.03 25);
    --info: oklch(0.60 0.06 240);
    --info-light: oklch(0.94 0.02 240);

    /* === UI ELEMENTS === */
    --border: oklch(0.88 0.01 70);
    --border-strong: oklch(0.80 0.015 70);
    --ring: oklch(0.55 0.14 35);
    --ring-offset: oklch(0.96 0.015 85);

    /* === SHADOWS === */
    --shadow-color: 40 30% 20%;

    /* === RADIUS === */
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 14px;
    --radius-xl: 20px;
    --radius-2xl: 28px;

    /* Compatibility with existing shadcn components */
    --card: var(--surface);
    --card-foreground: var(--foreground);
    --popover: var(--surface);
    --popover-foreground: var(--foreground);
    --secondary: var(--surface-muted);
    --secondary-foreground: var(--foreground);
    --muted: var(--surface-muted);
    --muted-foreground: var(--foreground-muted);
    --accent: var(--surface-muted);
    --accent-foreground: var(--foreground);
    --destructive: var(--error);
    --destructive-foreground: var(--surface);
    --input: var(--border);
    --radius: var(--radius-lg);
  }
}
```

**Acceptance Criteria**:
- [ ] All existing pages render without errors
- [ ] Background is warm cream (#F5F1E8 equivalent)
- [ ] Primary buttons are burnt sienna
- [ ] Text is warm charcoal, not pure black
- [ ] Borders are warm-tinted, not gray

---

### Task 1.2: Add Shadow Utilities

**File**: `app/globals.css`

Add shadow utilities:

```css
@layer utilities {
  .shadow-warm-sm {
    box-shadow: 0 1px 2px hsl(var(--shadow-color) / 0.04),
                0 1px 3px hsl(var(--shadow-color) / 0.06);
  }

  .shadow-warm-md {
    box-shadow: 0 2px 4px hsl(var(--shadow-color) / 0.04),
                0 4px 8px hsl(var(--shadow-color) / 0.08);
  }

  .shadow-warm-lg {
    box-shadow: 0 4px 8px hsl(var(--shadow-color) / 0.04),
                0 8px 24px hsl(var(--shadow-color) / 0.10);
  }

  .shadow-warm-xl {
    box-shadow: 0 8px 16px hsl(var(--shadow-color) / 0.06),
                0 16px 48px hsl(var(--shadow-color) / 0.12);
  }
}
```

**Acceptance Criteria**:
- [ ] Shadows have warm tint, not neutral gray
- [ ] Shadow classes work with Tailwind

---

### Task 1.3: Update Tailwind Config (if needed)

**File**: `tailwind.config.js` or `tailwind.config.ts`

Extend theme with new semantic colors:

```js
theme: {
  extend: {
    colors: {
      basics: {
        DEFAULT: 'var(--color-basics)',
        light: 'var(--color-basics-light)',
      },
      customer: {
        DEFAULT: 'var(--color-customer)',
        light: 'var(--color-customer-light)',
      },
      products: {
        DEFAULT: 'var(--color-products)',
        light: 'var(--color-products-light)',
      },
      docs: {
        DEFAULT: 'var(--color-docs)',
        light: 'var(--color-docs-light)',
      },
    },
    borderRadius: {
      'sm': 'var(--radius-sm)',
      'md': 'var(--radius-md)',
      'lg': 'var(--radius-lg)',
      'xl': 'var(--radius-xl)',
      '2xl': 'var(--radius-2xl)',
    },
  },
}
```

**Acceptance Criteria**:
- [ ] Can use `bg-basics`, `text-basics`, `bg-basics-light` etc. in components
- [ ] Border radius values are consistent with design spec

---

## Phase 2: Navigation Restructure

**Goal**: Move from top header to left sidebar navigation.

### Task 2.1: Create Sidebar Component

**File**: `components/layout/sidebar.tsx`

Create a new sidebar navigation component:

```tsx
// Structure:
// - Logo at top
// - Brands section (list of user's brands with active state)
// - Library section (Template Store link, All Documents link)
// - Settings/Help at bottom
// - User profile with dropdown

type SidebarProps = {
  brands: Brand[];
  activeBrandId?: string;
  user: User | null;
};

export function Sidebar({ brands, activeBrandId, user }: SidebarProps) {
  // Implementation details in component
}
```

**Visual Structure**:
```
Width: 260px
Background: var(--surface)
Border-right: 1px solid var(--border)

Sections:
1. Logo (top, 20px padding)
2. Brand list (scrollable if many)
3. Library section
4. Spacer (flex-grow)
5. Settings/Help
6. User profile (bottom)
```

**Acceptance Criteria**:
- [ ] Sidebar is 260px wide
- [ ] Logo displays at top
- [ ] Brand list shows all user brands
- [ ] Active brand is highlighted with primary color
- [ ] "Add brand" action is visible
- [ ] User profile shows at bottom with logout option
- [ ] Sidebar scrolls internally if content overflows

---

### Task 2.2: Create Sidebar Navigation Items

**File**: `components/layout/sidebar-nav-item.tsx`

Reusable navigation item component:

```tsx
type SidebarNavItemProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: number | string;
};

// Styling:
// - Padding: 10px 12px
// - Border-radius: var(--radius-md)
// - Hover: background var(--surface-muted)
// - Active: background var(--primary), text var(--primary-foreground)
```

**Acceptance Criteria**:
- [ ] Consistent hover and active states
- [ ] Optional badge support (for counts)
- [ ] Icon + label layout

---

### Task 2.3: Create Brand List Item

**File**: `components/layout/sidebar-brand-item.tsx`

Brand-specific nav item with status indicator:

```tsx
type SidebarBrandItemProps = {
  brand: Brand;
  active?: boolean;
  status: 'complete' | 'analyzing' | 'error';
};

// Shows:
// - Brand name (or "Untitled")
// - Small status dot (colored by status)
// - Active state highlighting
```

**Acceptance Criteria**:
- [ ] Shows brand name or fallback
- [ ] Status indicator visible
- [ ] Clickable, navigates to brand profile

---

### Task 2.4: Update Root Layout

**File**: `app/layout.tsx`

Restructure to use sidebar layout:

```tsx
// Before:
// <Header />
// <main>{children}</main>

// After:
// <div className="flex min-h-screen">
//   <Sidebar />
//   <main className="flex-1 bg-background">{children}</main>
// </div>
```

**Acceptance Criteria**:
- [ ] Sidebar appears on all authenticated pages
- [ ] Main content area fills remaining width
- [ ] Background is warm cream
- [ ] No horizontal scroll at 1280px width

---

### Task 2.5: Remove/Refactor Header

**File**: `components/layout/header.tsx`

Either remove or repurpose as a page-level header (not global nav):

- Remove global navigation links (moved to sidebar)
- Keep user menu if needed for page-level actions
- Or repurpose as a breadcrumb/page title component

**Acceptance Criteria**:
- [ ] No duplicate navigation
- [ ] User can still log out
- [ ] Clean transition from old to new layout

---

### Task 2.6: Create Page Header Component

**File**: `components/layout/page-header.tsx`

For page titles, breadcrumbs, and page-level actions:

```tsx
type PageHeaderProps = {
  title: string;
  subtitle?: string;
  backLink?: { href: string; label: string };
  actions?: React.ReactNode;
  tabs?: { label: string; value: string; href: string }[];
  activeTab?: string;
};

// Layout:
// [Back link]
// Title                    [Actions]
// Subtitle
// [Tab] [Tab] [Tab]
```

**Acceptance Criteria**:
- [ ] Consistent page header across all pages
- [ ] Optional back navigation
- [ ] Optional tabs with active indicator
- [ ] Actions slot for buttons

---

## Phase 3: Card & Component Styling

**Goal**: Update all cards and components to match new design language.

### Task 3.1: Update Card Component

**File**: `components/ui/card.tsx`

Update default card styling:

```tsx
// Changes:
// - Remove border, use shadow instead
// - Update border-radius to var(--radius-lg)
// - Add hover state with shadow-warm-md
// - Ensure background is var(--surface)

const Card = React.forwardRef<...>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg bg-surface shadow-warm-sm transition-shadow hover:shadow-warm-md",
      className
    )}
    {...props}
  />
))
```

**Acceptance Criteria**:
- [ ] Cards have warm shadow, no border
- [ ] Hover lifts shadow
- [ ] Background is cream/white surface color

---

### Task 3.2: Create Analyzer Card Variants

**File**: `components/analysis/analyzer-card.tsx`

Add color-coding to analyzer cards:

```tsx
type AnalyzerType = 'basics' | 'customer' | 'products';

// Each analyzer type gets:
// - Colored icon background
// - Colored accent line under title
// - Consistent layout

const colorClasses = {
  basics: {
    iconBg: 'bg-basics-light',
    iconText: 'text-basics',
    accent: 'bg-basics',
  },
  customer: {
    iconBg: 'bg-customer-light',
    iconText: 'text-customer',
    accent: 'bg-customer',
  },
  products: {
    iconBg: 'bg-products-light',
    iconText: 'text-products',
    accent: 'bg-products',
  },
};
```

**Visual Structure**:
```
┌─────────────────────────────────────────┐
│  ┌────┐                                 │
│  │Icon│  Title                          │
│  └────┘  ════════════════ (color bar)   │
│                                         │
│  Field Label         Value              │
│  Field Label         Value              │
│                                         │
└─────────────────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Basics card has sage green accent
- [ ] Customer card has dusty rose accent
- [ ] Products card has mustard accent
- [ ] Icons are in colored circular backgrounds

---

### Task 3.3: Update Button Component

**File**: `components/ui/button.tsx`

Update button variants:

```tsx
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-warm-sm hover:bg-primary-hover hover:shadow-warm-md",
        secondary: "bg-surface border border-border text-foreground hover:bg-surface-muted",
        ghost: "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
        destructive: "bg-error text-surface hover:bg-error/90",
        outline: "border border-border bg-transparent hover:bg-surface-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**Acceptance Criteria**:
- [ ] Primary button is burnt sienna
- [ ] Buttons have subtle active scale
- [ ] Shadow on primary buttons
- [ ] Consistent sizing

---

### Task 3.4: Update Badge Component

**File**: `components/ui/badge.tsx`

Add semantic variants:

```tsx
const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-muted text-foreground-muted",
        success: "bg-success-light text-success",
        warning: "bg-warning-light text-warning",
        error: "bg-error-light text-error",
        info: "bg-info-light text-info",
        basics: "bg-basics-light text-basics",
        customer: "bg-customer-light text-customer",
        products: "bg-products-light text-products",
        docs: "bg-docs-light text-docs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

**Acceptance Criteria**:
- [ ] All semantic variants work
- [ ] Colors match design spec
- [ ] Border radius is 6px (--radius-sm)

---

### Task 3.5: Update Input Component

**File**: `components/ui/input.tsx`

Update input styling:

```tsx
// Changes:
// - Border radius: var(--radius-md) - 10px
// - Border: 1px solid var(--border)
// - Background: var(--surface)
// - Focus: primary ring
// - Padding: 12px 16px
```

**Acceptance Criteria**:
- [ ] Inputs have warm border color
- [ ] Focus ring is primary color
- [ ] Consistent with overall warm aesthetic

---

## Phase 4: Page Updates

**Goal**: Update each page to use new layout and components.

### Task 4.1: Update Dashboard Page

**File**: `app/dashboard/page.tsx`

Restructure dashboard to work with sidebar:

```tsx
// Remove: standalone brand list layout
// Keep: brand cards in grid

// Page structure:
// <PageHeader title="Your Brands" actions={<AddBrandButton />} />
// <BrandGrid brands={brands} />
// OR
// <EmptyState /> if no brands
```

**Empty State Design**:
```
Center aligned:
- Geometric illustration (optional, can be CSS shapes)
- "Welcome to your brand library"
- "Paste any website URL and we'll build a complete brand profile in under a minute."
- [Add Your First Brand] button
```

**Acceptance Criteria**:
- [ ] Works with sidebar layout
- [ ] Empty state is warm and inviting
- [ ] Brand cards display in grid
- [ ] "Add brand" is prominent

---

### Task 4.2: Update Brand Profile Page

**File**: `app/brands/[brandId]/page.tsx`

Update brand profile with page header and tabs:

```tsx
// Structure:
// <PageHeader
//   backLink={{ href: '/dashboard', label: 'Back to Dashboard' }}
//   title={brand.name}
//   subtitle={brand.source_url}
//   tabs={[
//     { label: 'Overview', value: 'overview' },
//     { label: 'Documents', value: 'docs' },
//     { label: 'Store', value: 'store' },
//   ]}
//   activeTab={activeTab}
//   actions={<BrandActionsMenu />}
// />
//
// {activeTab === 'overview' && <OverviewContent />}
// {activeTab === 'docs' && <DocsContent />}
// {activeTab === 'store' && <StoreContent />}
```

**Acceptance Criteria**:
- [ ] Uses new PageHeader component
- [ ] Three tabs: Overview, Documents, Store
- [ ] Tab state persists (URL param or state)
- [ ] Analyzer cards use color-coding

---

### Task 4.3: Update Analysis Progress View

**File**: `components/analysis/progress-list.tsx` and related

Create the "building understanding" visualization:

```tsx
// Visual: Three overlapping circles that fill as analysis completes
// Each circle represents an analyzer
// Uses analyzer semantic colors

// States:
// - Queued: Empty circle, muted border
// - Analyzing: Circle with pulsing animation
// - Complete: Filled circle with checkmark
// - Error: Circle with X, error color
```

**Acceptance Criteria**:
- [ ] Visual indicates three analyzers
- [ ] Color-coded by analyzer type
- [ ] Smooth animations
- [ ] Clear completion state

---

### Task 4.4: Update Home Page

**File**: `app/page.tsx`

Update the landing/home page:

```tsx
// For unauthenticated users:
// - Centered hero section
// - "Paste a URL. Get brand intelligence in 60 seconds."
// - URL input form
// - Warm, inviting design

// For authenticated users:
// - Redirect to dashboard
// OR
// - Show quick "Add Brand" form
```

**Acceptance Criteria**:
- [ ] Warm, inviting design
- [ ] Clear value proposition
- [ ] Form works for both auth states
- [ ] Consistent with overall aesthetic

---

### Task 4.5: Update Login Page

**File**: `app/login/page.tsx`

Update login page styling:

```tsx
// Centered card design
// Warm background
// Clear form
// Intent-aware messaging (preserved from current)
```

**Acceptance Criteria**:
- [ ] Matches new design system
- [ ] Maintains auth-intent functionality
- [ ] Warm and welcoming

---

## Phase 5: Template Store

**Goal**: Implement the template store feature as a tab on brand profile.

> See `17-TEMPLATE-STORE.md` for detailed specification.

### Task 5.1: Create Store Tab Content

**File**: `components/store/store-tab-content.tsx`

Main container for the store tab:

```tsx
// Structure:
// - Section: "Generate a Document"
// - Template grid
// - Section: "Coming Soon" (future templates)
```

---

### Task 5.2: Create Template Gallery Card

**File**: `components/store/template-gallery-card.tsx`

Enhanced template card for gallery view:

```tsx
// Visual structure:
// - Large preview area with illustrative representation
// - Template name
// - Description
// - Readiness indicator
// - Generate button or "See what's needed"
// - If generated before: "Generated X times" indicator
```

---

### Task 5.3: Update Existing Doc Components

Update `doc-template-card.tsx` and related to match new styling.

---

## Phase 6: Polish & Micro-interactions

**Goal**: Add finishing touches that make the experience delightful.

### Task 6.1: Add Hover Transitions

All interactive elements should have smooth transitions:

```css
/* Add to globals.css */
@layer base {
  * {
    @apply transition-colors duration-150;
  }
}

/* Component-specific */
.card-interactive {
  @apply transition-all duration-150 ease-out;
}

.card-interactive:hover {
  @apply shadow-warm-md -translate-y-0.5;
}
```

---

### Task 6.2: Add Skeleton Loading States

Create consistent skeleton components:

```tsx
// File: components/ui/skeleton.tsx

// Update skeleton color to match warm palette
// Add shimmer animation
```

---

### Task 6.3: Toast Styling

Update toast styling for warm palette:

```tsx
// File: components/ui/sonner.tsx or wherever Toaster is configured

// Update colors to match design system
// Success toast: sage green
// Error toast: coral/error
// Default: warm neutral
```

---

### Task 6.4: Focus States

Ensure all focus states use primary ring:

```css
@layer base {
  :focus-visible {
    @apply outline-none ring-2 ring-primary ring-offset-2 ring-offset-background;
  }
}
```

---

## Phase 7: Empty & Error States

**Goal**: Ensure all empty and error states are warm and helpful.

### Task 7.1: Create Empty State Component

**File**: `components/ui/empty-state.tsx`

Reusable empty state:

```tsx
type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

// Layout:
// - Icon in muted circle
// - Title (text-xl, font-medium)
// - Description (text-muted-foreground, max-w-sm, centered)
// - Optional action button
```

---

### Task 7.2: Create Error State Component

**File**: `components/ui/error-state.tsx`

Reusable error state:

```tsx
type ErrorStateProps = {
  title?: string;
  description: string;
  retry?: () => void;
};

// Uses error color palette
// Offers retry when applicable
```

---

### Task 7.3: Update All Empty States

Review and update empty states in:
- Dashboard (no brands)
- Brand profile docs tab (no docs)
- Store tab (all templates generated?)

---

## Testing Checklist

After completing all phases, verify:

### Visual
- [ ] Background is warm cream throughout
- [ ] No pure black text (should be warm charcoal)
- [ ] No pure gray elements (should have warm tint)
- [ ] Primary color (burnt sienna) used sparingly for CTAs
- [ ] Analyzer cards are color-coded correctly
- [ ] Shadows have warm tint

### Functional
- [ ] Sidebar navigation works on all pages
- [ ] Active states are correct
- [ ] All links navigate correctly
- [ ] Forms submit correctly
- [ ] Analysis flow still works
- [ ] Doc generation still works

### Responsive
- [ ] Works at 1280px width
- [ ] Works at 1440px width
- [ ] No horizontal scroll
- [ ] Sidebar doesn't collapse (MVP is desktop-first)

### Accessibility
- [ ] All focus states visible
- [ ] Color contrast meets WCAG AA
- [ ] Interactive elements have hover/focus states
- [ ] Labels associated with inputs

---

## File Change Summary

### New Files
- `components/layout/sidebar.tsx`
- `components/layout/sidebar-nav-item.tsx`
- `components/layout/sidebar-brand-item.tsx`
- `components/layout/page-header.tsx`
- `components/store/store-tab-content.tsx`
- `components/store/template-gallery-card.tsx`
- `components/ui/empty-state.tsx`
- `components/ui/error-state.tsx`

### Modified Files
- `app/globals.css` — New color system
- `tailwind.config.js/ts` — Extended theme
- `app/layout.tsx` — Sidebar layout
- `components/layout/header.tsx` — Removed or repurposed
- `components/ui/card.tsx` — New styling
- `components/ui/button.tsx` — New variants
- `components/ui/badge.tsx` — New variants
- `components/ui/input.tsx` — New styling
- `components/analysis/analyzer-card.tsx` — Color coding
- `components/analysis/progress-list.tsx` — New visualization
- `app/dashboard/page.tsx` — New layout
- `app/brands/[brandId]/page.tsx` — New layout + store tab
- `app/page.tsx` — New styling
- `app/login/page.tsx` — New styling

---

## Related Documentation

- `15-REDESIGN-VISION.md` — Design philosophy and specs
- `17-TEMPLATE-STORE.md` — Store feature specification
- `08-UI_COMPONENTS.md` — Updated component reference
