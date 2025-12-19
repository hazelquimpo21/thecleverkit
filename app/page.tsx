/**
 * HOME PAGE (DASHBOARD)
 * ======================
 * The main landing page showing the add brand form.
 * In MVP, this is the primary entry point.
 */

import { PageContainer } from '@/components/layout/page-container';
import { AddBrandForm } from '@/components/brands/add-brand-form';

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <div className="text-center mb-8 max-w-2xl">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Brand Intelligence in{' '}
          <span className="text-primary">60 Seconds</span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Paste a website URL and get instant insights about any brand.
          Perfect for agencies, freelancers, and strategists.
        </p>
      </div>

      {/* Add Brand Form */}
      <AddBrandForm />

      {/* Features Preview */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
        <FeatureCard
          title="Business Basics"
          description="Name, industry, business model, and founding story"
        />
        <FeatureCard
          title="Customer Profile"
          description="Target audience, pain points, and buying motivations"
        />
        <FeatureCard
          title="Products & Pricing"
          description="What they sell, pricing models, and market positioning"
        />
      </div>
    </PageContainer>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-4">
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
