/**
 * SIDEBAR USER MENU COMPONENT
 * =============================
 * User profile section at the bottom of the sidebar.
 * Shows avatar, email, and logout action.
 *
 * @created 2025-12-19 - Part of sidebar navigation redesign
 */

'use client';

import { LogOut, User, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils/cn';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarUserMenuProps {
  /** Current authenticated user */
  user: SupabaseUser | null;
  /** Sign out callback */
  onSignOut: () => Promise<void>;
  /** Whether sign out is in progress */
  isSigningOut?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get user initials for avatar display.
 */
function getUserInitials(email: string | undefined): string {
  if (!email) return '?';

  // Try to extract name parts from email
  const namePart = email.split('@')[0];
  const parts = namePart.split(/[._-]/);

  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return namePart.slice(0, 2).toUpperCase();
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * User profile dropdown menu for the sidebar.
 *
 * @example
 * <SidebarUserMenu
 *   user={user}
 *   onSignOut={signOut}
 * />
 */
export function SidebarUserMenu({
  user,
  onSignOut,
  isSigningOut = false,
}: SidebarUserMenuProps) {
  if (!user) {
    return null;
  }

  const initials = getUserInitials(user.email);
  const displayEmail = user.email || 'No email';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-[var(--radius-md)]',
            'text-left transition-colors duration-150',
            'hover:bg-surface-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          {/* Avatar */}
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-primary">{initials}</span>
          </div>

          {/* Email */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {displayEmail}
            </p>
          </div>

          {/* Chevron */}
          <ChevronUp className="h-4 w-4 text-foreground-muted shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        className="w-[calc(var(--sidebar-width)-2rem)] mb-1"
      >
        {/* User info */}
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium text-foreground">{displayEmail}</p>
          <p className="text-xs text-foreground-muted">Signed in</p>
        </div>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={onSignOut}
          disabled={isSigningOut}
          className="text-error focus:text-error cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isSigningOut ? 'Signing out...' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
