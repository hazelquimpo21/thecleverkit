# UI Components & Design System

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

## Color System

```css
:root {
  /* Base - Warm neutrals */
  --background: 30 20% 98%;        /* Soft cream, not pure white */
  --foreground: 30 10% 15%;        /* Warm dark gray */
  
  /* Card surfaces */
  --card: 30 15% 99%;
  --card-foreground: 30 10% 15%;
  
  /* Muted elements */
  --muted: 30 10% 94%;
  --muted-foreground: 30 5% 45%;
  
  /* Primary - Warm orange (from inspo) */
  --primary: 28 90% 55%;           /* Action buttons, links */
  --primary-foreground: 0 0% 100%;
  
  /* Secondary - Soft warm gray */
  --secondary: 30 10% 92%;
  --secondary-foreground: 30 10% 25%;
  
  /* Accent - For highlights */
  --accent: 28 85% 95%;            /* Light orange tint */
  --accent-foreground: 28 90% 35%;
  
  /* Status colors */
  --success: 142 70% 45%;          /* Green */
  --success-foreground: 0 0% 100%;
  --warning: 38 95% 50%;           /* Amber */
  --warning-foreground: 38 95% 15%;
  --error: 0 85% 55%;              /* Red */
  --error-foreground: 0 0% 100%;
  
  /* Border */
  --border: 30 10% 88%;
  --input: 30 10% 88%;
  --ring: 28 90% 55%;
  
  /* Radius - Soft, not sharp */
  --radius: 0.75rem;               /* 12px - friendly, not clinical */
}
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
  ui/                     ← shadcn/ui primitives (don't edit much)
    button.tsx
    card.tsx
    input.tsx
    badge.tsx
    avatar.tsx
    dropdown-menu.tsx
    dialog.tsx
    skeleton.tsx
    progress.tsx
    
  layout/                 ← App shell components
    header.tsx            ← Top nav with logo, user menu
    page-container.tsx    ← Consistent page padding/max-width
    page-header.tsx       ← Page title + actions pattern
    
  brands/                 ← Brand-related components
    brand-card.tsx        ← Brand in list view
    brand-list.tsx        ← List of brand cards
    brand-empty.tsx       ← Empty state for dashboard
    add-brand-form.tsx    ← URL input form
    
  analysis/               ← Analysis-related components
    progress-list.tsx     ← List of analyzers with status
    progress-item.tsx     ← Single analyzer status row
    analyzer-card.tsx     ← Base card for displaying results
    
  analysis/cards/         ← Specific display for each analyzer
    basics-card.tsx
    customer-card.tsx
    products-card.tsx
    
  analysis/forms/         ← Edit forms for each analyzer
    basics-form.tsx
    customer-form.tsx
    products-form.tsx
    
  brand-profile/          ← Brand profile page components
    profile-header.tsx    ← Brand name, URL, actions
    coming-soon.tsx       ← Future docs teaser
```

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
