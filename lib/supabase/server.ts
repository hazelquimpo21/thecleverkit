/**
 * SUPABASE SERVER CLIENT
 * =======================
 * Server-side Supabase client for use in API routes and Server Components.
 * Handles cookies for auth session management.
 *
 * Usage:
 *   import { createServerClient } from '@/lib/supabase/server';
 *   const supabase = await createServerClient();
 */

import { createServerClient as createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types';

/**
 * Create a Supabase client for server-side usage.
 * Automatically handles auth cookies from the request.
 *
 * Must be called within a Server Component or API route.
 *
 * @returns Typed Supabase client with session awareness, or null if env vars missing
 *
 * @example
 * // In a Server Component or API route:
 * const supabase = await createServerClient();
 * if (supabase) {
 *   const { data: { user } } = await supabase.auth.getUser();
 * }
 */
export async function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Return null if env vars are missing (allows build to succeed)
  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // This can happen in Server Components where cookies can't be modified.
          // It's safe to ignore in read-only contexts.
        }
      },
    },
  });
}

/**
 * Create a Supabase admin client with service role key.
 * ONLY use this for server-side operations that need to bypass RLS.
 *
 * WARNING: This client bypasses Row Level Security!
 * Only use for background jobs, webhooks, or admin operations.
 *
 * @returns Supabase admin client
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      '❌ Missing Supabase admin environment variables!\n' +
      'Make sure you have set:\n' +
      '  - NEXT_PUBLIC_SUPABASE_URL\n' +
      '  - SUPABASE_SERVICE_ROLE_KEY\n' +
      'in your .env.local file.'
    );
  }

  // Use dynamic import to avoid cookie issues in non-request contexts
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js') as typeof import('@supabase/supabase-js');
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
