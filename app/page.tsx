/**
 * HOME PAGE (LANDING)
 * ====================
 * The main landing page showing the add brand form.
 * Showcases the 1960s science textbook aesthetic.
 *
 * @update 2025-12-19 - Updated for redesign with warm colors and semantic badges
 */

import { Building2, Users, Package } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { AddBrandForm } from '@/components/brands/add-brand-form';

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="text-center mb-10 max-w-2xl">
        <h1 className="text-4xl font-bold text-foreground mb-4 tracking-tight">
          Brand Intelligence in{' '}
          <span className="text-primary">60 Seconds</span>
        </h1>
        <p className="text-lg text-foreground-muted leading-relaxed">
          Paste a website URL and get instant insights about any brand.
          Perfect for agencies, freelancers, and strategists.
        </p>
      </div>

      {/* Add Brand Form */}
      <AddBrandForm />

      {/* Features Preview */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl w-full">
        <FeatureCard
          icon={<Building2 className="w-5 h-5" />}
          title="Business Basics"
          description="Name, industry, business model, and founding story"
          variant="basics"
        />
        <FeatureCard
          icon={<Users className="w-5 h-5" />}
          title="Customer Profile"
          description="Target audience, pain points, and buying motivations"
          variant="customer"
        />
        <FeatureCard
          icon={<Package className="w-5 h-5" />}
          title="Products & Pricing"
          description="What they sell, pricing models, and market positioning"
          variant="products"
        />
      </div>
    </PageContainer>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

type AnalyzerVariant = 'basics' | 'customer' | 'products';

const variantColors: Record<AnalyzerVariant, string> = {
  basics: 'var(--color-basics)',
  customer: 'var(--color-customer)',
  products: 'var(--color-products)',
};

function FeatureCard({
  icon,
  title,
  description,
  variant,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: AnalyzerVariant;
}) {
  return (
    <div className="text-center p-4 group">
      {/* Icon with semantic color */}
      <div
        className="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
        style={{
          backgroundColor: `color-mix(in oklch, ${variantColors[variant]} 15%, transparent)`,
          color: variantColors[variant],
        }}
      >
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-foreground-muted">{description}</p>
    </div>
  );
}
