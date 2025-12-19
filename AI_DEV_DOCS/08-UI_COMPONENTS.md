# UI Components & Design System

> **Updated December 19, 2025**: Redesign COMPLETE. All phases implemented.

---

## ✅ REDESIGN COMPLETE

The 1960s science textbook aesthetic has been fully implemented:

- **New aesthetic**: Warm paper-like backgrounds with geometric illustrations
- **New color palette**: Burnt sienna primary (`oklch(0.55 0.14 35)`), sage/rose/mustard/teal semantic colors
- **New layout**: 260px left sidebar navigation, PageHeader with integrated tabs
- **New feature**: Template Store tab on brand profiles with category organization

**Related documentation:**
- `15-REDESIGN-VISION.md` — Complete design philosophy and specs
- `16-REDESIGN-TASKS.md` — Implementation task breakdown (ALL COMPLETE)
- `17-TEMPLATE-STORE.md` — Template store feature spec (IMPLEMENTED)

---

## Design Principles

### 1. Breathable & Soothing
- Warm neutral backgrounds, not stark white
- Generous padding and margins
- Nothing feels cramped

### 2. Clean & Elegant  
- Minimal UI chrome
- Cards with soft shadows
- Typography does heavy lifting

### 3. Delightful Moments
- Smooth transitions (150-300ms)
- Subtle animations on progress states
- Satisfying completion feedback

### 4. Agency-Ready
- Professional enough to show clients
- Readable data presentation
- Works on laptop screens (1280px+)

## Color System (OKLCH)

We use **OKLCH color space** for perceptually uniform colors. This is the modern standard that makes colors look consistent across the spectrum.

### Why OKLCH?
- **Perceptually uniform**: Equal steps in lightness look equal to humans
- **Better for theming**: Easy to create consistent light/dark variants
- **Modern standard**: Supported in all major browsers

### CSS Variables

```css
/* Light Mode - Warm stone palette with orange primary */
:root {
  /* Base surfaces */
  --background: oklch(0.985 0.002 75);      /* Soft cream (#faf9f7) */
  --foreground: oklch(0.216 0.006 56.04);   /* Warm charcoal (#1c1917) */

  /* Card surfaces (slightly elevated) */
  --card: oklch(1 0 0);                      /* Pure white */
  --card-foreground: oklch(0.216 0.006 56.04);

  /* Muted/secondary text */
  --muted: oklch(0.97 0.001 75);             /* Light stone (#f5f5f4) */
  --muted-foreground: oklch(0.553 0.013 58.07); /* Mid gray (#78716c) */

  /* Primary brand color - Warm orange */
  --primary: oklch(0.646 0.222 41.116);      /* Orange (#ea580c) */
  --primary-foreground: oklch(1 0 0);        /* White text on orange */

  /* Secondary - Subtle stone */
  --secondary: oklch(0.97 0.001 75);
  --secondary-foreground: oklch(0.216 0.006 56.04);

  /* Accent - Light orange tint */
  --accent: oklch(0.97 0.001 75);
  --accent-foreground: oklch(0.216 0.006 56.04);

  /* Destructive - Red for errors/danger */
  --destructive: oklch(0.577 0.245 27.325);  /* Red (#dc2626) */
  --destructive-foreground: oklch(0.985 0.002 75);

  /* Status colors */
  --success: oklch(0.627 0.194 149.214);     /* Green (#16a34a) */
  --success-foreground: oklch(1 0 0);
  --warning: oklch(0.769 0.188 70.08);       /* Amber (#eab308) */
  --warning-foreground: oklch(0.216 0.006 56.04);

  /* UI elements */
  --border: oklch(0.869 0.005 56.37);        /* Light border (#e7e5e4) */
  --input: oklch(0.869 0.005 56.37);
  --ring: oklch(0.646 0.222 41.116);         /* Focus ring = primary */

  /* Radius */
  --radius: 0.625rem;                        /* 10px - soft but not round */
}
```

### Semantic Color Usage

Always use semantic classes, never hardcoded colors:

```tsx
// ✅ GOOD - Semantic colors
<div className="bg-primary text-primary-foreground" />
<p className="text-muted-foreground" />
<div className="border-border" />

// ❌ BAD - Hardcoded colors
<div className="bg-orange-600 text-white" />
<p className="text-stone-500" />
<div className="border-stone-200" />
```

### Badge Color Variants

The Badge component has semantic variants for different use cases:

| Variant | Use Case | Color | Example |
|---------|----------|-------|---------|
| `default` | Primary actions | Primary | Active filters |
| `secondary` | Neutral/default | Stone | Tags, labels |
| `outline` | Subtle emphasis | Border | Low-priority tags |
| `success` | Positive states | Green | "Complete", "Active" |
| `warning` | Caution states | Amber | "Pending", "Review" |
| `error` | Error states | Red | Error badges |
| `info` | Informational | Blue | "New", "Beta" |
| `basics` | Business Basics analyzer | Sage | Analyzer badge |
| `customer` | Customer analyzer | Rose | Analyzer badge |
| `products` | Products analyzer | Mustard | Analyzer badge |
| `docs` | Docs analyzer | Teal | Docs badge |
| `accent` | Accent highlight | Primary light | Accent badge |

**Usage with dot indicator:**
```tsx
<Badge variant="success" dot>Ready</Badge>
<Badge variant="warning" dot>Needs Data</Badge>
```

## Typography

```css
/* Font stack: Inter for clean readability */
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Scale */
--text-xs: 0.75rem;      /* 12px - labels, captions */
--text-sm: 0.875rem;     /* 14px - secondary text */
--text-base: 1rem;       /* 16px - body */
--text-lg: 1.125rem;     /* 18px - emphasis */
--text-xl: 1.25rem;      /* 20px - card titles */
--text-2xl: 1.5rem;      /* 24px - page sections */
--text-3xl: 1.875rem;    /* 30px - page titles */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
```

## Spacing Scale

```css
/* Tailwind default scale, used consistently */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-5: 1.25rem;    /* 20px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

## Component Structure

```
/components/
  ui/                     ← shadcn/ui primitives (Radix-based)
    button.tsx            ← Primary action buttons (+ success variant, icon-sm size)
    card.tsx              ← Container with warm shadows (+ interactive prop)
    input.tsx             ← Text input with label/hint support
    badge.tsx             ← Semantic variants (basics, customer, products, docs)
    skeleton.tsx          ← Warm shimmer animation
    empty-state.tsx       ← Reusable empty state pattern ✅ NEW
    error-state.tsx       ← Reusable error state with retry ✅ NEW
    label.tsx             ← Form field labels (Radix)
    checkbox.tsx          ← Toggle with indeterminate state (Radix)
    dialog.tsx            ← Modal overlay (Radix)
    dropdown-menu.tsx     ← Context menus (Radix)
    tooltip.tsx           ← Hover hints (Radix)
    separator.tsx         ← Visual divider (Radix)
    sonner.tsx            ← Toast notifications

  layout/                 ← App shell components ✅ REDESIGNED
    sidebar/              ← Left navigation sidebar
      sidebar.tsx         ← Main sidebar component (260px fixed)
      sidebar-nav-item.tsx ← Navigation links
      sidebar-brand-item.tsx ← Brand list items with status
      sidebar-section.tsx ← Section grouping
      sidebar-user-menu.tsx ← User dropdown with sign out
      index.ts            ← Exports
    app-shell.tsx         ← Layout wrapper with conditional sidebar
    page-container.tsx    ← Sidebar-aware page padding
    page-header.tsx       ← Title + tabs + actions pattern ✅ NEW
    index.ts              ← Layout exports

  brands/                 ← Brand-related components
    brand-card.tsx        ← Interactive Card with semantic colors
    brand-analysis-content.tsx ← Realtime analysis with 3 tabs
    brand-list.tsx        ← List of brand cards
    brand-empty-state.tsx ← Empty state for dashboard
    add-brand-form.tsx    ← URL input form
    status-badge.tsx      ← Analysis status indicator

  analysis/               ← Analysis-related components
    progress-list.tsx     ← List of analyzers with status
    progress-item.tsx     ← Single analyzer status row
    analyzer-card.tsx     ← Base card for displaying results

  analysis/cards/         ← Specific display for each analyzer
    basics-card.tsx       ← Uses Badge variant="basics"
    customer-card.tsx     ← Uses Badge variant="customer"
    products-card.tsx     ← Uses Badge variant="products"

  store/                  ← Template Store components ✅ NEW
    store-tab-content.tsx ← Main store with category sections
    template-gallery-card.tsx ← Card with illustration + readiness
    template-illustration.tsx ← CSS-based geometric illustrations
    index.ts              ← Exports

  docs/                   ← Document generation components
    docs-tab-content.tsx  ← Docs tab with template grid + doc list
    doc-template-card.tsx ← Single template in grid (shows readiness)
    doc-template-grid.tsx ← Grid of available templates
    doc-list.tsx          ← User's generated docs
    doc-list-item.tsx     ← Single doc in list (+ Google Docs link)
    doc-viewer-dialog.tsx ← Modal doc viewer with markdown
    doc-export-menu.tsx   ← Export dropdown (+ Google Docs option)
    missing-data-dialog.tsx ← Shows what's needed for template
    index.ts              ← Exports
```

### UI Components Deep Dive

#### Installed Radix Primitives

| Component | Package | Purpose |
|-----------|---------|---------|
| Label | `@radix-ui/react-label` | Accessible form labels |
| Checkbox | `@radix-ui/react-checkbox` | Toggle with states |
| Dialog | `@radix-ui/react-dialog` | Modal overlays |
| DropdownMenu | `@radix-ui/react-dropdown-menu` | Context menus |
| Tooltip | `@radix-ui/react-tooltip` | Hover information |
| Separator | `@radix-ui/react-separator` | Visual dividers |
| Slot | `@radix-ui/react-slot` | Component composition |

#### Toast Notifications (Sonner)

We use Sonner for toast notifications - it's lightweight and beautiful:

```tsx
import { toast } from 'sonner';

// Success
toast.success('Brand added successfully!');

// Error
toast.error('Failed to analyze brand');

// With action
toast('Analysis complete', {
  action: {
    label: 'View',
    onClick: () => router.push(`/brands/${id}`),
  },
});
```

The Toaster is configured in `lib/providers/index.tsx`:
- Position: bottom-right
- Rich colors enabled
- Close button on all toasts

## Key Components

### PageContainer

Consistent page layout wrapper.

```tsx
// components/layout/page-container.tsx

export function PageContainer({ 
  children,
  size = 'default' 
}: { 
  children: React.ReactNode;
  size?: 'default' | 'narrow' | 'wide';
}) {
  const maxWidths = {
    narrow: 'max-w-2xl',
    default: 'max-w-5xl',
    wide: 'max-w-7xl',
  };

  return (
    <main className={cn(
      'mx-auto px-4 py-8 sm:px-6 lg:px-8',
      maxWidths[size]
    )}>
      {children}
    </main>
  );
}
```

### BrandCard

Single brand in the list.

```tsx
// components/brands/brand-card.tsx

type BrandCardProps = {
  brand: Brand;
  analysisStatus: 'complete' | 'analyzing' | 'partial' | 'failed' | 'pending';
};

export function BrandCard({ brand, analysisStatus }: BrandCardProps) {
  return (
    <Link href={`/brands/${brand.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {brand.is_own_brand && (
              <Star className="h-4 w-4 text-primary fill-primary" />
            )}
            <div>
              <p className="font-medium">
                {brand.name || 'Untitled Brand'}
              </p>
              <p className="text-sm text-muted-foreground">
                {brand.source_url}
              </p>
            </div>
          </div>
          <StatusBadge status={analysisStatus} />
        </CardContent>
      </Card>
    </Link>
  );
}
```

### ProgressItem

Single analyzer in progress view.

```tsx
// components/analysis/progress-item.tsx

type ProgressItemProps = {
  name: string;
  status: 'queued' | 'analyzing' | 'parsing' | 'complete' | 'error';
  onRetry?: () => void;
};

export function ProgressItem({ name, status, onRetry }: ProgressItemProps) {
  return (
    <div className="flex items-center justify-between py-3 px-4">
      <div className="flex items-center gap-3">
        <StatusIcon status={status} />
        <span className="font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusLabel status={status} />
        {status === 'error' && onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'queued':
      return <Circle className="h-4 w-4 text-muted-foreground" />;
    case 'analyzing':
    case 'parsing':
      return <Loader2 className="h-4 w-4 text-primary animate-spin" />;
    case 'complete':
      return <CheckCircle className="h-4 w-4 text-success" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-error" />;
  }
}
```

### AnalyzerCard

Base component for displaying analyzer results.

```tsx
// components/analysis/analyzer-card.tsx

type AnalyzerCardProps = {
  title: string;
  icon: LucideIcon;
  status: AnalysisStatus;
  onEdit?: () => void;
  onRetry?: () => void;
  children: React.ReactNode;
};

export function AnalyzerCard({ 
  title, 
  icon: Icon, 
  status,
  onEdit,
  onRetry,
  children 
}: AnalyzerCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
        {status === 'complete' && onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {status === 'complete' && children}
        {status === 'error' && (
          <ErrorState onRetry={onRetry} />
        )}
        {(status === 'analyzing' || status === 'parsing') && (
          <LoadingState />
        )}
      </CardContent>
    </Card>
  );
}
```

### Field Display

Consistent field rendering in cards.

```tsx
// components/analysis/field.tsx

export function Field({ 
  label, 
  value,
  type = 'text' 
}: { 
  label: string;
  value: string | string[] | null;
  type?: 'text' | 'tags' | 'paragraph';
}) {
  if (!value) {
    return (
      <div className="py-2">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="text-sm italic text-muted-foreground/70">Not available</dd>
      </div>
    );
  }

  return (
    <div className="py-2">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1">
        {type === 'tags' && Array.isArray(value) && (
          <div className="flex flex-wrap gap-1.5">
            {value.map(v => (
              <Badge key={v} variant="secondary">{v}</Badge>
            ))}
          </div>
        )}
        {type === 'paragraph' && (
          <p className="text-sm leading-relaxed">{value}</p>
        )}
        {type === 'text' && (
          <p className="font-medium">{value}</p>
        )}
      </dd>
    </div>
  );
}
```

## Animation Guidelines

### Transitions
```css
/* Default transition for interactive elements */
transition: all 150ms ease;

/* Slightly slower for larger movements */
transition: all 200ms ease;

/* Card hovers */
transition: box-shadow 150ms ease;
```

### Loading States
- Use `animate-spin` for spinners (Loader2 icon)
- Use `animate-pulse` for skeleton loaders
- Progress items get a subtle pulse when "in progress"

### Micro-interactions
- Buttons: slight scale on active (`active:scale-95`)
- Cards: shadow lift on hover
- Status changes: no jarring jumps—fade between states

## Empty States

All empty states should feel welcoming, not broken:

```tsx
// Pattern for empty states

<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="rounded-full bg-muted p-4 mb-4">
    <Icon className="h-8 w-8 text-muted-foreground" />
  </div>
  <h3 className="text-lg font-medium mb-2">{title}</h3>
  <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
  <Button>{ctaText}</Button>
</div>
```

## Responsive Approach

MVP targets laptop/desktop (1280px+). Mobile is future.

```css
/* Breakpoints (Tailwind defaults) */
sm: 640px
md: 768px
lg: 1024px
xl: 1280px    /* Primary target */
2xl: 1536px
```

For MVP:
- Test at 1280px and 1440px widths
- Cards stack on narrow screens (under 1024px)
- No mobile-specific layouts yet

## Accessibility Checklist

- [ ] All interactive elements have visible focus states
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Icons paired with text labels (not icon-only buttons)
- [ ] Form inputs have associated labels
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Loading states announced to screen readers
- [ ] Skip link to main content

---

## Docs Feature UI Patterns

### Doc Template Card

Shows a single doc template with its readiness status.

```tsx
// components/docs/doc-template-card.tsx

type DocTemplateCardProps = {
  template: DocTemplate;
  readiness: {
    ready: boolean;
    missing: string[];
  };
  onGenerate: () => void;
  onShowMissing: () => void;
};

export function DocTemplateCard({
  template,
  readiness,
  onGenerate,
  onShowMissing
}: DocTemplateCardProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="rounded-lg bg-muted p-2">
            <template.icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <ReadinessBadge ready={readiness.ready} />
        </div>
        <CardTitle className="text-base mt-3">{template.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {template.description}
        </p>
      </CardHeader>
      <CardFooter className="mt-auto pt-0">
        {readiness.ready ? (
          <Button
            onClick={onGenerate}
            className="w-full"
            size="sm"
          >
            Generate
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={onShowMissing}
            className="w-full"
            size="sm"
          >
            See what's needed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
```

### Readiness Badge

Visual indicator for template data sufficiency.

```tsx
// components/docs/readiness-badge.tsx

export function ReadinessBadge({ ready }: { ready: boolean }) {
  if (ready) {
    return (
      <Badge variant="success" className="gap-1">
        <Check className="h-3 w-3" />
        Ready
      </Badge>
    );
  }

  return (
    <Badge variant="warning" className="gap-1">
      <AlertCircle className="h-3 w-3" />
      Needs data
    </Badge>
  );
}
```

### Doc List Item

Single generated doc in the user's doc list.

```tsx
// components/docs/doc-list-item.tsx

type DocListItemProps = {
  doc: GeneratedDoc;
  templateName: string;
  onView: () => void;
  onExport: (format: 'markdown' | 'pdf') => void;
  onDelete: () => void;
};

export function DocListItem({
  doc,
  templateName,
  onView,
  onExport,
  onDelete
}: DocListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="font-medium">{doc.title}</p>
          <p className="text-sm text-muted-foreground">
            {templateName} · Generated {formatRelativeTime(doc.created_at)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onView}>
          View
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              Export
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onExport('markdown')}>
              <Copy className="h-4 w-4 mr-2" />
              Copy as Markdown
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onExport('pdf')}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

### Brand Profile Tabs

Tab navigation between Overview and Docs.

```tsx
// components/brand-profile/profile-tabs.tsx

type ProfileTabsProps = {
  activeTab: 'overview' | 'docs';
  onTabChange: (tab: 'overview' | 'docs') => void;
  docCount?: number;
};

export function ProfileTabs({
  activeTab,
  onTabChange,
  docCount = 0
}: ProfileTabsProps) {
  return (
    <div className="border-b">
      <nav className="flex gap-6">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => onTabChange('overview')}
        >
          Overview
        </TabButton>
        <TabButton
          active={activeTab === 'docs'}
          onClick={() => onTabChange('docs')}
        >
          Docs
          {docCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {docCount}
            </Badge>
          )}
        </TabButton>
      </nav>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors',
        active
          ? 'border-primary text-foreground'
          : 'border-transparent text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
```

### Docs Tab Layout

The full layout for the Docs tab content.

```
┌─────────────────────────────────────────────────────────────────┐
│  GENERATE A DOC                                                  │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ 🎯              │  │ 📋              │  │ 👥              │  │
│  │ Golden Circle   │  │ Brand Brief     │  │ Customer        │  │
│  │                 │  │                 │  │ Persona         │  │
│  │ Define your     │  │ Complete brand  │  │ Detailed ideal  │  │
│  │ Why, How, What  │  │ overview        │  │ customer        │  │
│  │                 │  │                 │  │                 │  │
│  │ ✓ Ready         │  │ ✓ Ready         │  │ ✓ Ready         │  │
│  │ [Generate]      │  │ [Generate]      │  │ [Generate]      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  YOUR DOCS (2)                                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📄 Golden Circle  •  Dec 19, 2025  •  [View] [Export ▾]  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 📄 Brand Brief  •  Dec 18, 2025  •  [View] [Export ▾]    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
