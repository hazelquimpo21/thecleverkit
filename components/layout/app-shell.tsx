/**
 * APP SHELL COMPONENT
 * ====================
 * Main layout wrapper that conditionally renders the sidebar.
 * Authenticated users see sidebar + main content.
 * Guests see centered content without sidebar.
 *
 * @created 2025-12-19 - Part of sidebar navigation redesign
 */

'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export interface AppShellProps {
  children: React.ReactNode;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Routes that should NOT show the sidebar even for authenticated users.
 * These are typically marketing or auth pages.
 */
const ROUTES_WITHOUT_SIDEBAR = ['/login'];

/**
 * Check if a path should show the sidebar.
 */
function shouldShowSidebar(pathname: string, isAuthenticated: boolean): boolean {
  // Never show sidebar for guests
  if (!isAuthenticated) {
    return false;
  }

  // Check if current path is in the exclude list
  const isExcludedRoute = ROUTES_WITHOUT_SIDEBAR.some((route) =>
    pathname.startsWith(route)
  );

  return !isExcludedRoute;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Application shell that provides consistent layout.
 * Shows sidebar for authenticated users on appropriate pages.
 *
 * @example
 * <AppShell>{children}</AppShell>
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  // During initial auth loading, render children without sidebar to avoid flash
  // The sidebar component handles its own loading state for brand list
  const showSidebar = !isLoading && shouldShowSidebar(pathname, !!user);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - fixed position, shown for authenticated users */}
      {showSidebar && <Sidebar />}

      {/* Main Content Area */}
      <main
        className={cn(
          'min-h-screen transition-all duration-200',
          showSidebar && 'ml-[var(--sidebar-width)]'
        )}
      >
        {children}
      </main>
    </div>
  );
}
