/**
 * HEADER COMPONENT
 * =================
 * App header with logo, navigation, and user authentication UI.
 * Shows login button for guests and user menu for authenticated users.
 */

'use client';

import Link from 'next/link';
import { Sparkles, LogIn, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * App header with logo and auth-aware navigation.
 * Displays login button or user menu based on auth state.
 *
 * @example
 * <Header />
 */
export function Header() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-2 text-lg font-semibold text-foreground transition-colors hover:text-primary"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <span>The Clever Kit</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {isLoading ? (
            // Loading skeleton
            <Skeleton className="h-10 w-24" />
          ) : user ? (
            // Authenticated: show user menu
            <UserMenu email={user.email} onSignOut={signOut} />
          ) : (
            // Guest: show login button
            <Link href="/login">
              <Button variant="default" size="default">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

// ============================================================================
// USER MENU COMPONENT
// ============================================================================

interface UserMenuProps {
  email: string | undefined;
  onSignOut: () => Promise<void>;
}

/**
 * User menu dropdown showing email and sign out option.
 * Simple inline design that matches the app aesthetic.
 */
function UserMenu({ email, onSignOut }: UserMenuProps) {
  return (
    <div className="flex items-center gap-3">
      {/* User info */}
      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <User className="h-4 w-4 text-primary" />
        </div>
        <span className="max-w-[150px] truncate">{email}</span>
      </div>

      {/* Mobile: just show avatar */}
      <div className="sm:hidden flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
        <User className="h-4 w-4 text-primary" />
      </div>

      {/* Sign out button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSignOut}
        className="text-muted-foreground hover:text-foreground"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </Button>
    </div>
  );
}
