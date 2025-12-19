/**
 * STORE TAB CONTENT
 * ==================
 * Main content for the Store tab on brand profile pages.
 * Displays templates organized by category with readiness status.
 *
 * Features:
 * - Header with title and description
 * - Templates grouped by category (Strategy, Audience, etc.)
 * - Readiness status for each template
 * - Generation counts from previous uses
 * - Coming soon templates displayed separately
 *
 * @created 2025-12-19 - Template Store feature
 */

'use client';

import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import { TemplateGalleryCard } from './template-gallery-card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getTemplatesByCategory,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type DocTemplateConfig,
  type ReadinessCheckResult,
} from '@/lib/docs';
import { useDocTemplatesReadiness, useBrandDocs, useGenerateDoc } from '@/hooks';
import { log } from '@/lib/utils/logger';
import type { AnalysisRun, DocTemplateId } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface StoreTabContentProps {
  /** Brand ID for checking readiness and generating docs */
  brandId: string;

  /** Analysis runs for readiness checking */
  runs: AnalysisRun[];
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function StoreLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Category skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CATEGORY SECTION
// ============================================================================

interface CategorySectionProps {
  category: TemplateCategory;
  templates: DocTemplateConfig[];
  readiness: Record<DocTemplateId, ReadinessCheckResult>;
  generationCounts: Record<string, number>;
  generatingTemplateId: string | null;
  onGenerate: (templateId: string) => void;
}

function CategorySection({
  category,
  templates,
  readiness,
  generationCounts,
  generatingTemplateId,
  onGenerate,
}: CategorySectionProps) {
  if (templates.length === 0) return null;

  const categoryConfig = TEMPLATE_CATEGORIES[category];

  return (
    <section className="space-y-4">
      {/* Category header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
          {categoryConfig.label}
        </h3>
        {templates.length > 3 && (
          <button className="text-xs text-primary flex items-center gap-0.5 hover:underline">
            View all
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((config) => (
          <TemplateGalleryCard
            key={config.id}
            config={config}
            readiness={readiness[config.id]}
            generationCount={generationCounts[config.id] || 0}
            isGenerating={generatingTemplateId === config.id}
            onGenerate={() => onGenerate(config.id)}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Complete store tab content for brand profile.
 * Shows available templates organized by category.
 *
 * @example
 * <StoreTabContent brandId={brand.id} runs={analysisRuns} />
 */
export function StoreTabContent({ brandId, runs }: StoreTabContentProps) {
  // Get docs for generation count
  const { data: docs, isLoading: docsLoading } = useBrandDocs(brandId);

  // Get readiness for all templates
  const readiness = useDocTemplatesReadiness(runs);

  // Generate doc mutation
  const generateDoc = useGenerateDoc();

  // Templates grouped by category
  const templatesByCategory = useMemo(() => getTemplatesByCategory(), []);

  // Calculate generation counts per template
  const generationCounts = useMemo(() => {
    if (!docs) return {};

    const counts: Record<string, number> = {};
    for (const doc of docs) {
      if (doc.status === 'complete') {
        counts[doc.template_id] = (counts[doc.template_id] || 0) + 1;
      }
    }
    return counts;
  }, [docs]);

  // Track which template is currently generating
  const generatingTemplateId = generateDoc.isPending
    ? (generateDoc.variables?.templateId ?? null)
    : null;

  // Handle generate action
  const handleGenerate = async (templateId: string) => {
    log.info('Store: generating document', { brandId, templateId });
    try {
      await generateDoc.mutateAsync({ brandId, templateId: templateId as DocTemplateId });
    } catch (error) {
      log.error('Store: generation failed', { error });
    }
  };

  // Get categories in order
  const orderedCategories = Object.values(TEMPLATE_CATEGORIES)
    .sort((a, b) => a.order - b.order)
    .map((c) => c.id);

  if (docsLoading) {
    return <StoreLoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          Generate a Document
        </h2>
        <p className="text-foreground-muted mt-1">
          Transform your brand intelligence into polished deliverables.
        </p>
      </div>

      {/* Categories */}
      {orderedCategories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          templates={templatesByCategory[category]}
          readiness={readiness}
          generationCounts={generationCounts}
          generatingTemplateId={generatingTemplateId}
          onGenerate={handleGenerate}
        />
      ))}
    </div>
  );
}
