/**
 * HEADER COMPONENT
 * =================
 * App header with logo and navigation.
 */

'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * App header with logo and navigation.
 *
 * @example
 * <Header />
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold text-stone-900 transition-colors hover:text-orange-600"
        >
          <Sparkles className="h-6 w-6 text-orange-500" />
          <span>The Clever Kit</span>
        </Link>

        {/* Navigation could go here */}
        <nav className="flex items-center gap-4">
          {/* User menu will be added later */}
        </nav>
      </div>
    </header>
  );
}
