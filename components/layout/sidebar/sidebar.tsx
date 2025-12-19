/**
 * SIDEBAR COMPONENT
 * ==================
 * Main sidebar navigation for the app.
 * Contains logo, brand list, library section, and user menu.
 *
 * Design: 260px fixed width, cream surface background.
 *
 * @created 2025-12-19 - New navigation structure
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  BookOpen,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/use-auth';
import { useBrands, usePrefetchBrand } from '@/hooks/use-brands';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarNavItem } from './sidebar-nav-item';
import { SidebarBrandItem } from './sidebar-brand-item';
import { SidebarSection } from './sidebar-section';
import { SidebarUserMenu } from './sidebar-user-menu';
import { log } from '@/lib/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarProps {
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Main sidebar navigation component.
 * Displays logo, brand list, library links, and user menu.
 *
 * @example
 * <Sidebar />
 */
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { data: brands, isLoading: brandsLoading } = useBrands();
  const prefetchBrand = usePrefetchBrand();

  // Extract active brand ID from pathname
  const activeBrandId = pathname.startsWith('/brands/')
    ? pathname.split('/')[2]
    : undefined;

  log.debug('Sidebar render', {
    pathname,
    activeBrandId,
    brandsCount: brands?.length,
    isAuth: !!user,
  });

  return (
    <aside
      className={cn(
        // Sizing
        'w-[var(--sidebar-width)] h-screen',
        // Layout
        'fixed left-0 top-0 flex flex-col',
        // Styling
        'bg-surface border-r border-sidebar-border',
        // Transitions
        'sidebar-transition',
        className
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">The Clever Kit</span>
        </Link>
      </div>

      {/* Main Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {/* Brands Section */}
        <SidebarSection label="Brands">
          {brandsLoading ? (
            // Loading skeletons
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 w-full rounded-[var(--radius-md)]" />
              ))}
            </div>
          ) : brands && brands.length > 0 ? (
            // Brand list
            <>
              {brands.map((brand) => (
                <SidebarBrandItem
                  key={brand.id}
                  brand={brand}
                  active={activeBrandId === brand.id}
                  onHover={() => prefetchBrand(brand.id)}
                />
              ))}
            </>
          ) : (
            // Empty state hint
            <p className="px-3 py-2 text-xs text-foreground-subtle">
              No brands yet
            </p>
          )}

          {/* Add Brand Action */}
          <SidebarNavItem
            href="/"
            icon={Plus}
            label="Add brand"
            active={pathname === '/'}
            className="mt-1"
          />
        </SidebarSection>

        {/* Library Section */}
        <SidebarSection label="Library" className="mt-4">
          <SidebarNavItem
            href="/templates"
            icon={BookOpen}
            label="Template Store"
            active={pathname === '/templates'}
          />
          <SidebarNavItem
            href="/documents"
            icon={FileText}
            label="All Documents"
            active={pathname === '/documents'}
          />
        </SidebarSection>
      </nav>

      {/* Bottom Section - Fixed */}
      <div className="mt-auto border-t border-sidebar-border">
        {/* Settings & Help */}
        <div className="px-2 py-2">
          <SidebarNavItem
            href="/settings"
            icon={Settings}
            label="Settings"
            active={pathname === '/settings'}
          />
          <SidebarNavItem
            href="/help"
            icon={HelpCircle}
            label="Help"
            active={pathname === '/help'}
          />
        </div>

        {/* User Menu */}
        {authLoading ? (
          <div className="p-3 border-t border-sidebar-border">
            <Skeleton className="h-8 w-full rounded-[var(--radius-md)]" />
          </div>
        ) : user ? (
          <div className="border-t border-sidebar-border">
            <SidebarUserMenu user={user} onSignOut={signOut} />
          </div>
        ) : null}
      </div>
    </aside>
  );
}
