# UI Redesign — Implementation Tasks

> **Status**: Partially Implemented (Phases 1-6 Complete)
> **Created**: December 19, 2025
> **Last Updated**: December 19, 2025
> **Prerequisite**: Read `15-REDESIGN-VISION.md` first for design context

---

## Implementation Status Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Design System Foundation | **COMPLETE** |
| 2 | Navigation Restructure | **COMPLETE** |
| 3 | Card & Component Styling | **COMPLETE** |
| 4 | Page Updates | **COMPLETE** |
| 5 | Template Store | Pending |
| 6 | Polish & Micro-interactions | **COMPLETE** |
| 7 | Empty & Error States | **COMPLETE** |

---

## Phase 1: Design System Foundation - COMPLETE

### What Was Implemented

**File**: `app/globals.css`

- New OKLCH color system with 1960s science textbook aesthetic
- Warm paper-like backgrounds (cream tones)
- Burnt sienna primary color (#C9563C equivalent)
- Semantic analyzer colors (sage, rose, mustard, teal)
- Warm-tinted shadows
- Updated radius scale (6px, 10px, 14px, 20px, 28px)
- Dark mode support preserved
- Tailwind v4 theme integration

### Key CSS Variables

```css
/* Backgrounds */
--background: oklch(0.96 0.015 85);  /* Warm paper cream */
--surface: oklch(0.99 0.008 85);     /* Bright cream */

/* Primary */
--primary: oklch(0.55 0.14 35);      /* Burnt sienna */

/* Analyzer Colors */
--color-basics: oklch(0.62 0.08 155);    /* Sage green */
--color-customer: oklch(0.65 0.08 15);   /* Dusty rose */
--color-products: oklch(0.72 0.12 85);   /* Warm mustard */
--color-docs: oklch(0.60 0.06 220);      /* Dusty teal */
```

---

## Phase 2: Navigation Restructure - COMPLETE

### What Was Implemented

**New Files**:
- `components/layout/sidebar/sidebar.tsx` - Main sidebar component
- `components/layout/sidebar/sidebar-nav-item.tsx` - Navigation links
- `components/layout/sidebar/sidebar-brand-item.tsx` - Brand list items
- `components/layout/sidebar/sidebar-section.tsx` - Section grouping
- `components/layout/sidebar/sidebar-user-menu.tsx` - User dropdown
- `components/layout/sidebar/index.ts` - Exports
- `components/layout/page-header.tsx` - Page title component
- `components/layout/app-shell.tsx` - Layout wrapper
- `components/layout/index.ts` - Layout exports

**Modified Files**:
- `app/layout.tsx` - Now uses AppShell with sidebar
- `components/layout/page-container.tsx` - Updated for sidebar layout

### Sidebar Features
- 260px fixed width
- Brand list with status indicators
- Library section (Template Store, All Documents)
- Settings and Help links
- User profile dropdown with sign out

---

## Phase 3: Card & Component Styling - COMPLETE

### What Was Implemented

**Modified Files**:
- `components/ui/card.tsx` - Warm shadows, interactive prop, updated radius
- `components/ui/button.tsx` - Burnt sienna primary, success variant, icon-sm size
- `components/ui/badge.tsx` - Analyzer semantic colors, dot indicator

### Component Updates

**Card**:
```tsx
<Card interactive>  {/* Hover lift effect */}
  <CardContent>...</CardContent>
</Card>
```

**Badge Variants**:
- `basics` - Sage green
- `customer` - Dusty rose
- `products` - Warm mustard
- `docs` - Dusty teal
- `success`, `warning`, `error`, `info` - Status colors

---

## Phase 4: Page Updates - COMPLETE

### What Was Implemented

**Modified Files**:
- `app/dashboard/dashboard-content.tsx` - Uses PageHeader, new grid
- `components/brands/brand-analysis-content.tsx` - PageHeader with tabs
- `components/brands/brand-card.tsx` - Interactive Card, semantic colors
- `components/brands/brand-empty-state.tsx` - Updated styling

### Dashboard
- PageHeader with title and add button
- Brand cards in responsive grid
- Section headers for "Your Brand" and "Brands You Manage"

### Brand Profile
- PageHeader with back link and tabs (Overview, Documents)
- Integrated tab navigation
- Analyzing status badge

---

## Phase 5: Template Store - PENDING

> See `17-TEMPLATE-STORE.md` for detailed specification.

### Still To Do
- [ ] Create StoreTabContent component
- [ ] Create TemplateGalleryCard component
- [ ] Add Store tab to brand profile
- [ ] Implement template browsing UI

---

## Phase 6: Polish & Micro-interactions - COMPLETE

### What Was Implemented

**Modified Files**:
- `components/ui/skeleton.tsx` - Warm shimmer animation
- `components/ui/input.tsx` - Label, hint, better focus states

**Global CSS Additions**:
- `.animate-shimmer` - Warm gradient animation
- `.animate-pulse-soft` - Subtle pulse for analyzing states
- `.animate-slide-in-right` - Toast animations
- `.animate-scale-in` - Modal animations
- `.shadow-warm-*` - Warm-tinted shadow utilities
- `.card-interactive` - Hover lift effect
- Custom scrollbar styling
- Focus-visible ring styles

---

## Phase 7: Empty & Error States - COMPLETE

### What Was Implemented

**New Files**:
- `components/ui/empty-state.tsx` - Reusable empty state
- `components/ui/error-state.tsx` - Reusable error state

**Modified Files**:
- `components/brands/brand-empty-state.tsx` - Updated with semantic colors

### EmptyState Component
```tsx
<EmptyState
  icon={<Inbox className="h-8 w-8" />}
  title="No messages"
  description="When you receive messages, they'll appear here."
  action={<Button>Get Started</Button>}
  size="lg"  // sm | md | lg
/>
```

### ErrorState Component
```tsx
<ErrorState
  title="Failed to load"
  description="Please try again."
  onRetry={() => refetch()}
  isRetrying={isRefetching}
/>
```

---

## File Change Summary - Implemented

### New Files Created
- `components/layout/sidebar/sidebar.tsx`
- `components/layout/sidebar/sidebar-nav-item.tsx`
- `components/layout/sidebar/sidebar-brand-item.tsx`
- `components/layout/sidebar/sidebar-section.tsx`
- `components/layout/sidebar/sidebar-user-menu.tsx`
- `components/layout/sidebar/index.ts`
- `components/layout/page-header.tsx`
- `components/layout/app-shell.tsx`
- `components/layout/index.ts`
- `components/ui/empty-state.tsx`
- `components/ui/error-state.tsx`

### Modified Files
- `app/globals.css` — Complete redesign of color system
- `app/layout.tsx` — Sidebar layout via AppShell
- `components/layout/page-container.tsx` — Sidebar-aware padding
- `components/ui/card.tsx` — Warm shadows, interactive prop
- `components/ui/button.tsx` — New variants, sizes
- `components/ui/badge.tsx` — Analyzer semantic colors
- `components/ui/skeleton.tsx` — Warm shimmer
- `components/ui/input.tsx` — Labels, hints, better focus
- `components/ui/index.ts` — New exports
- `app/dashboard/dashboard-content.tsx` — PageHeader integration
- `components/brands/brand-analysis-content.tsx` — PageHeader with tabs
- `components/brands/brand-card.tsx` — Interactive styling
- `components/brands/brand-empty-state.tsx` — Semantic colors

---

## Testing Checklist - Updated

### Visual - VERIFIED
- [x] Background is warm cream throughout
- [x] No pure black text (warm charcoal)
- [x] Primary color (burnt sienna) used for CTAs
- [x] Shadows have warm tint
- [x] Badge variants use semantic colors

### Functional - TO VERIFY
- [ ] Sidebar navigation works on all pages
- [ ] Active states are correct
- [ ] All links navigate correctly
- [ ] Analysis flow still works
- [ ] Doc generation still works

### Responsive
- [ ] Works at 1280px width
- [ ] Works at 1440px width
- [ ] No horizontal scroll
- [ ] Sidebar visible at all times (desktop-first)

---

## Next Steps

1. **Test the implementation** - Run the app and verify all pages render correctly
2. **Implement Template Store** (Phase 5) - Store tab UI when ready
3. **Home page updates** - Consider updating landing page styling
4. **Login page updates** - Match new design system

---

## Related Documentation

- `15-REDESIGN-VISION.md` — Design philosophy and specs
- `17-TEMPLATE-STORE.md` — Store feature specification
- `08-UI_COMPONENTS.md` — Component reference (needs update)
