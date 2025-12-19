/**
 * TEMPLATE ILLUSTRATION
 * ======================
 * CSS-based illustrations for doc templates.
 * 1960s science textbook aesthetic with geometric shapes.
 *
 * @created 2025-12-19 - Template store feature
 */

import { cn } from '@/lib/utils/cn';
import type { DocTemplateId } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface TemplateIllustrationProps {
  /** Which template this illustration is for */
  templateId: DocTemplateId | 'coming-soon';
  /** Additional CSS classes */
  className?: string;
  /** Whether template is available (dims if coming soon) */
  available?: boolean;
}

// ============================================================================
// ILLUSTRATIONS
// ============================================================================

/**
 * Golden Circle - Three concentric circles (Why, How, What)
 */
function GoldenCircleIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Outer ring - Why */}
      <div className="absolute w-24 h-24 rounded-full border-2 border-[var(--color-docs)] opacity-30" />
      {/* Middle ring - How */}
      <div className="absolute w-16 h-16 rounded-full border-2 border-[var(--color-docs)] opacity-50" />
      {/* Inner ring - What */}
      <div className="absolute w-8 h-8 rounded-full bg-[var(--color-docs)] opacity-70" />
      {/* Labels */}
      <span className="absolute top-2 text-[8px] font-medium text-[var(--color-docs)] uppercase tracking-wider">
        Why
      </span>
      <span className="absolute text-[8px] font-medium text-[var(--color-docs)] opacity-70">
        What
      </span>
    </div>
  );
}

/**
 * Brand Brief - Document with lines
 */
function BrandBriefIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-16 h-20 bg-surface rounded border border-[var(--color-docs)]/30 p-2 shadow-warm-sm">
        {/* Header bar */}
        <div className="w-full h-2 bg-[var(--color-docs)] rounded-sm mb-2" />
        {/* Lines */}
        <div className="space-y-1.5">
          <div className="w-full h-1 bg-[var(--color-docs)]/20 rounded-sm" />
          <div className="w-3/4 h-1 bg-[var(--color-docs)]/20 rounded-sm" />
          <div className="w-full h-1 bg-[var(--color-docs)]/20 rounded-sm" />
          <div className="w-2/3 h-1 bg-[var(--color-docs)]/20 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

/**
 * Customer Persona - Person silhouette with profile
 */
function CustomerPersonaIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        {/* Head */}
        <div className="w-8 h-8 rounded-full bg-[var(--color-customer)]/30 border-2 border-[var(--color-customer)]" />
        {/* Body */}
        <div className="w-12 h-10 bg-[var(--color-customer)]/20 rounded-t-full mt-1 border-t-2 border-x-2 border-[var(--color-customer)]/50" />
      </div>
    </div>
  );
}

/**
 * Coming Soon - Placeholder with dotted outline
 */
function ComingSoonIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
        <span className="text-2xl text-border">?</span>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Template illustration based on template ID.
 * Uses CSS shapes for a geometric, educational aesthetic.
 *
 * @example
 * <TemplateIllustration templateId="golden-circle" />
 */
export function TemplateIllustration({
  templateId,
  className,
  available = true,
}: TemplateIllustrationProps) {
  const illustrations: Record<string, React.ReactNode> = {
    'golden-circle': <GoldenCircleIllustration />,
    'brand-brief': <BrandBriefIllustration />,
    'customer-persona': <CustomerPersonaIllustration />,
    'coming-soon': <ComingSoonIllustration />,
  };

  return (
    <div
      className={cn(
        'h-24 bg-surface-muted rounded-t-[var(--radius-lg)]',
        !available && 'opacity-50',
        className
      )}
    >
      {illustrations[templateId] || <ComingSoonIllustration />}
    </div>
  );
}
