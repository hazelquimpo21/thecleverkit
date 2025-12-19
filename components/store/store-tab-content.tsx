/**
 * STORE TAB CONTENT
 * ==================
 * Main content for the Store tab on brand profile pages.
 * Unified view that combines template gallery with generated docs.
 *
 * Features:
 * - Header with title and description
 * - Templates grouped by category (Strategy, Audience, etc.)
 * - Readiness status for each template
 * - Intelligent buttons based on doc state (fresh/stale, exported/not)
 * - Inline doc viewer (no separate Documents tab needed)
 * - Quick access bar for previously generated docs
 * - Coming soon templates displayed separately
 *
 * @created 2025-12-19 - Template Store feature
 * @updated 2025-12-19 - Added intelligent buttons and inline doc viewer
 */

'use client';

import { useMemo, useState } from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import { TemplateGalleryCard } from './template-gallery-card';
import { DocViewer } from '@/components/docs/doc-viewer';
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
import type { AnalysisRun, Brand, GeneratedDoc, DocTemplateId } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface StoreTabContentProps {
  /** Brand ID for checking readiness and generating docs */
  brandId: string;

  /** The full brand object (for freshness checking) */
  brand: Brand;

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
  docs: GeneratedDoc[];
  brand: Brand;
  generatingTemplateId: string | null;
  onGenerate: (templateId: string) => void;
  onViewDoc: (doc: GeneratedDoc) => void;
}

function CategorySection({
  category,
  templates,
  readiness,
  docs,
  brand,
  generatingTemplateId,
  onGenerate,
  onViewDoc,
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
            docs={docs}
            brand={brand}
            isGenerating={generatingTemplateId === config.id}
            onGenerate={() => onGenerate(config.id)}
            onViewDoc={onViewDoc}
            onRegenerate={() => onGenerate(config.id)}
          />
        ))}
      </div>
    </section>
  );
}

// ============================================================================
// GENERATED DOCS QUICK ACCESS
// ============================================================================

interface GeneratedDocsQuickAccessProps {
  docs: GeneratedDoc[];
  onViewDoc: (doc: GeneratedDoc) => void;
}

/**
 * Shows a compact bar of all generated docs for quick access.
 * Appears at the top of the store when docs exist.
 */
function GeneratedDocsQuickAccess({ docs, onViewDoc }: GeneratedDocsQuickAccessProps) {
  const completeDocs = docs.filter(d => d.status === 'complete');

  if (completeDocs.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
        Your Documents ({completeDocs.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {completeDocs.map((doc) => (
          <button
            key={doc.id}
            onClick={() => onViewDoc(doc)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm
                       bg-surface hover:bg-surface-muted rounded-lg border border-border
                       transition-colors group"
          >
            <FileText className="h-3.5 w-3.5 text-[var(--color-docs)] group-hover:text-primary transition-colors" />
            <span className="text-foreground">{doc.title}</span>
            <span className="text-xs text-foreground-subtle">
              {new Date(doc.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </button>
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
 * Shows available templates organized by category with intelligent buttons.
 * Includes inline doc viewer for seamless experience.
 *
 * @example
 * <StoreTabContent
 *   brandId={brand.id}
 *   brand={brand}
 *   runs={analysisRuns}
 * />
 */
export function StoreTabContent({ brandId, brand, runs }: StoreTabContentProps) {
  // State for viewing a doc
  const [selectedDoc, setSelectedDoc] = useState<GeneratedDoc | null>(null);

  // Get docs for this brand
  const { data: docs, isLoading: docsLoading } = useBrandDocs(brandId);

  // Get readiness for all templates
  const readiness = useDocTemplatesReadiness(runs);

  // Generate doc mutation
  const generateDoc = useGenerateDoc();

  // Templates grouped by category
  const templatesByCategory = useMemo(() => getTemplatesByCategory(), []);

  // Track which template is currently generating
  const generatingTemplateId = generateDoc.isPending
    ? (generateDoc.variables?.templateId ?? null)
    : null;

  // Handle generate action
  const handleGenerate = async (templateId: string) => {
    log.info('Store: generating document', { brandId, templateId });
    try {
      await generateDoc.mutateAsync({ brandId, templateId: templateId as DocTemplateId });
      log.success('Store: document generated', { brandId, templateId });
    } catch (error) {
      log.error('Store: generation failed', { error });
    }
  };

  // Handle view doc action
  const handleViewDoc = (doc: GeneratedDoc) => {
    log.info('Store: viewing document', { docId: doc.id, templateId: doc.template_id });
    setSelectedDoc(doc);
  };

  // Handle regenerate from viewer (generates then shows new doc)
  const handleRegenerateFromViewer = async () => {
    if (!selectedDoc) return;

    const templateId = selectedDoc.template_id;
    log.info('Store: regenerating from viewer', { brandId, templateId });

    // Close viewer first
    setSelectedDoc(null);

    // Generate new doc
    await handleGenerate(templateId);
  };

  // Get categories in order
  const orderedCategories = Object.values(TEMPLATE_CATEGORIES)
    .sort((a, b) => a.order - b.order)
    .map((c) => c.id);

  if (docsLoading) {
    return <StoreLoadingSkeleton />;
  }

  // If viewing a doc, show the viewer
  if (selectedDoc) {
    return (
      <DocViewer
        doc={selectedDoc}
        brand={brand}
        onClose={() => setSelectedDoc(null)}
        onRegenerate={handleRegenerateFromViewer}
      />
    );
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

      {/* Quick access to generated docs */}
      {docs && docs.length > 0 && (
        <GeneratedDocsQuickAccess
          docs={docs}
          onViewDoc={handleViewDoc}
        />
      )}

      {/* Categories */}
      {orderedCategories.map((category) => (
        <CategorySection
          key={category}
          category={category}
          templates={templatesByCategory[category]}
          readiness={readiness}
          docs={docs ?? []}
          brand={brand}
          generatingTemplateId={generatingTemplateId}
          onGenerate={handleGenerate}
          onViewDoc={handleViewDoc}
        />
      ))}
    </div>
  );
}
