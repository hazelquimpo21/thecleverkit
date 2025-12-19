# UI Components & Design System

> **Updated December 18, 2025**: shadcn/ui v2 integrated with OKLCH color system. All components now use semantic color tokens.

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

| Variant | Use Case | Example |
|---------|----------|---------|
| `default` | Primary actions | Active filters |
| `secondary` | Neutral/default | Tags, labels |
| `destructive` | Errors, danger | Delete confirmation |
| `outline` | Subtle emphasis | Low-priority tags |
| `success` | Positive states | "Complete", "Active" |
| `warning` | Caution states | "Pending", "Review" |
| `muted` | Disabled/inactive | Inactive items |
| `error` | Error states | Status badges |
| `info` | Informational | "New", "Beta" |
| `orange` | Brand accent | Primary category |

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
    button.tsx            ← Primary action buttons
    card.tsx              ← Container with header/content/footer
    input.tsx             ← Text input with focus ring
    badge.tsx             ← Status/category labels (10 variants!)
    skeleton.tsx          ← Loading placeholder animation
    label.tsx             ← Form field labels (Radix)
    checkbox.tsx          ← Toggle with indeterminate state (Radix)
    dialog.tsx            ← Modal overlay (Radix)
    dropdown-menu.tsx     ← Context menus (Radix)
    tooltip.tsx           ← Hover hints (Radix)
    separator.tsx         ← Visual divider (Radix)
    sonner.tsx            ← Toast notifications

  layout/                 ← App shell components
    header.tsx            ← Top nav with logo, user menu
    page-container.tsx    ← Consistent page padding/max-width
    page-header.tsx       ← Page title + actions pattern

  brands/                 ← Brand-related components
    brand-card.tsx        ← Brand in list view
    brand-list.tsx        ← List of brand cards
    brand-empty.tsx       ← Empty state for dashboard
    add-brand-form.tsx    ← URL input form
    status-badge.tsx      ← Analysis status indicator

  analysis/               ← Analysis-related components
    progress-list.tsx     ← List of analyzers with status
    progress-item.tsx     ← Single analyzer status row
    analyzer-card.tsx     ← Base card for displaying results

  analysis/cards/         ← Specific display for each analyzer
    basics-card.tsx
    customer-card.tsx
    products-card.tsx

  analysis/forms/         ← Edit forms for each analyzer (planned)
    basics-form.tsx
    customer-form.tsx
    products-form.tsx

  brand-profile/          ← Brand profile page components
    profile-header.tsx    ← Brand name, URL, actions
    coming-soon.tsx       ← Future docs teaser
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
