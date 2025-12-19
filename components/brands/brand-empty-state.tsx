/**
 * BRAND EMPTY STATE COMPONENT
 * =============================
 * Welcoming empty state shown when user has no brands yet.
 * Guides them to add their first brand with a friendly message.
 *
 * Design principles:
 * - Feels warm and inviting, not broken or empty
 * - Single clear CTA
 * - Brief value prop reminder
 */

'use client';

import Link from 'next/link';
import { Sparkles, Globe, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Empty state for dashboard when user has no brands.
 * Shows welcome message and CTA to add first brand.
 *
 * @example
 * <BrandEmptyState />
 */
export function BrandEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon */}
      <div className="rounded-full bg-primary/10 p-5 mb-6">
        <Sparkles className="h-10 w-10 text-primary" />
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
        Welcome to The Clever Kit
      </h2>

      {/* Description */}
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Get instant brand intelligence by analyzing any website.
        Add your first brand to get started.
      </p>

      {/* CTA Button */}
      <Link href="/">
        <Button size="lg" className="mb-12">
          <Globe className="h-5 w-5" />
          Add Your First Brand
        </Button>
      </Link>

      {/* Features reminder */}
      <div className="w-full max-w-2xl">
        <h3 className="text-sm font-medium text-muted-foreground text-center mb-4">
          What you&apos;ll get
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Globe className="h-5 w-5 text-primary" />}
            title="Business Basics"
            description="Name, industry, business model"
          />
          <FeatureCard
            icon={<Target className="h-5 w-5 text-primary" />}
            title="Customer Profile"
            description="Audience, pain points, motivations"
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5 text-primary" />}
            title="Products & Pricing"
            description="Offerings, positioning, prices"
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="bg-muted/30 border-muted">
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-2">
          {icon}
        </div>
        <h4 className="font-medium text-sm text-foreground mb-1">
          {title}
        </h4>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
