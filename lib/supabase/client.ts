/**
 * SUPABASE BROWSER CLIENT
 * ========================
 * Client-side Supabase client for use in React components.
 * Uses the anon key and respects Row Level Security.
 *
 * Usage:
 *   import { createBrowserClient } from '@/lib/supabase/client';
 *   const supabase = createBrowserClient();
 */

import { createBrowserClient as createClient } from '@supabase/ssr';
import type { Database } from '@/types';

/**
 * Create a Supabase client for browser/client-side usage.
 * Safe to use in React components and hooks.
 *
 * @returns Typed Supabase client
 *
 * @example
 * const supabase = createBrowserClient();
 * const { data, error } = await supabase.from('brands').select('*');
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      '❌ Missing Supabase environment variables!\n' +
      'Make sure you have set:\n' +
      '  - NEXT_PUBLIC_SUPABASE_URL\n' +
      '  - NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      'in your .env.local file.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
}
