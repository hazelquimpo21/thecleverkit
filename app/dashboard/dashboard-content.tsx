/**
 * DASHBOARD CONTENT COMPONENT
 * =============================
 * Client component that renders the dashboard UI.
 * Handles data fetching, state, and user interactions.
 *
 * Features:
 * - Fetches brands with React Query
 * - Shows loading skeleton
 * - Shows empty state for new users
 * - Organizes brands into "Your Brand" and "Brands You Manage"
 * - Handles delete with confirmation dialog
 *
 * @update 2025-12-19 - Updated for sidebar layout redesign
 */

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageContainer, PageHeader } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BrandCard } from '@/components/brands/brand-card';
import { BrandEmptyState } from '@/components/brands/brand-empty-state';
import { DeleteBrandDialog } from '@/components/brands/delete-brand-dialog';
import { useBrands, useDeleteBrand } from '@/hooks/use-brands';
import { log } from '@/lib/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

interface DeleteState {
  brandId: string;
  brandName: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Dashboard content - client component with all the interactivity.
 */
export function DashboardContent() {
  // Data fetching
  const { data: brands, isLoading, error } = useBrands();
  const deleteBrand = useDeleteBrand();

  // Delete dialog state
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null);

  // Organize brands into categories
  const { ownBrand, managedBrands } = useMemo(() => {
    if (!brands) return { ownBrand: null, managedBrands: [] };

    const own = brands.find(b => b.is_own_brand) || null;
    const managed = brands.filter(b => !b.is_own_brand);

    return { ownBrand: own, managedBrands: managed };
  }, [brands]);

  // Handlers
  const handleDeleteClick = (brandId: string, brandName: string) => {
    log.info('Delete clicked', { brandId, brandName });
    setDeleteState({ brandId, brandName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState) return;

    try {
      await deleteBrand.mutateAsync(deleteState.brandId);
      setDeleteState(null);
    } catch (err) {
      // Error is handled in the mutation hook
      log.error('Delete failed', { error: err });
    }
  };

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Your Brands" />
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Failed to load brands. Please try refreshing the page.
          </p>
        </div>
      </PageContainer>
    );
  }

  // Empty state
  if (!brands || brands.length === 0) {
    return (
      <PageContainer>
        <BrandEmptyState />
      </PageContainer>
    );
  }

  // Build subtitle with brand count
  const subtitle = `${brands.length} ${brands.length === 1 ? 'brand' : 'brands'} analyzed`;

  // Main dashboard with brands
  return (
    <PageContainer>
      {/* Page Header */}
      <PageHeader
        title="Your Brands"
        subtitle={subtitle}
        actions={
          <Link href="/">
            <Button>
              <Plus className="h-4 w-4" />
              Add Brand
            </Button>
          </Link>
        }
      />

      {/* Your Brand section */}
      {ownBrand && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Your Brand
          </h2>
          <div className="grid gap-4">
            <BrandCard brand={ownBrand} onDelete={handleDeleteClick} />
          </div>
        </section>
      )}

      {/* Brands You Manage section */}
      {managedBrands.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-foreground mb-4">
            Brands You Manage
            <span className="text-muted-foreground font-normal ml-2">
              ({managedBrands.length})
            </span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {managedBrands.map(brand => (
              <BrandCard
                key={brand.id}
                brand={brand}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Delete confirmation dialog */}
      <DeleteBrandDialog
        open={deleteState !== null}
        onOpenChange={(open) => !open && setDeleteState(null)}
        brandName={deleteState?.brandName || ''}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteBrand.isPending}
      />
    </PageContainer>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

/**
 * Loading skeleton for dashboard.
 */
function DashboardSkeleton() {
  return (
    <PageContainer>
      {/* Header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-40 mb-2" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Section header skeleton */}
      <Skeleton className="h-5 w-32 mb-4" />

      {/* Cards skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-36 rounded-[var(--radius-lg)]" />
        ))}
      </div>
    </PageContainer>
  );
}
