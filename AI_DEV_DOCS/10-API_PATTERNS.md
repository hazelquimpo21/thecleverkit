# API Patterns

> **Updated December 19, 2025**: Added docs generation API patterns.

## OpenAI Integration

All GPT calls go through thin wrappers in `lib/api/openai.ts`.

### Setup

```typescript
// lib/api/openai.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = 'gpt-4o-mini';
const DEFAULT_TIMEOUT = 30000; // 30 seconds
```

### Basic Completion

For analysis prompts (natural language response).

```typescript
// lib/api/openai.ts

export async function callGPT(
  prompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const { maxTokens = 1500, temperature = 0.7 } = options;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature,
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Empty response from GPT');
    }

    return content;

  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
}
```

### Function Calling

For parsing structured data.

```typescript
// lib/api/openai.ts

export async function callGPTWithFunction<T>(
  systemPrompt: string,
  userContent: string,
  functionName: string,
  functionDescription: string,
  schema: Record<string, unknown>
): Promise<T> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent }
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: functionName,
            description: functionDescription,
            parameters: schema,
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: { name: functionName },
      },
      temperature: 0.3, // Lower for structured extraction
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.type !== 'function') {
      throw new Error('No function call in response');
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    return parsed as T;

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse GPT function response');
    }
    if (error instanceof OpenAI.APIError) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw error;
  }
}
```

### Rate Limiting

Simple in-memory rate limiting for MVP.

```typescript
// lib/api/openai.ts

const requestTimes: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 50;

async function checkRateLimit(): Promise<void> {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  
  // Remove old requests
  while (requestTimes.length > 0 && requestTimes[0] < oneMinuteAgo) {
    requestTimes.shift();
  }
  
  if (requestTimes.length >= MAX_REQUESTS_PER_MINUTE) {
    const waitTime = requestTimes[0] - oneMinuteAgo;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  requestTimes.push(now);
}

// Add to callGPT and callGPTWithFunction:
// await checkRateLimit();
```

## API Routes

### Convention

- All API routes in `app/api/`
- RESTful patterns where sensible
- Always return JSON
- Use proper HTTP status codes

### Response Shape

```typescript
// Success
{ success: true, data?: any }

// Error
{ error: string, code?: string }
```

### Error Handling Pattern

```typescript
// app/api/brands/[brandId]/scrape/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  try {
    // 1. Auth check
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse body
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // 3. Business logic
    // ...

    // 4. Success response
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Scrape error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Auth Middleware

Protect dashboard routes.

```typescript
// middleware.ts

import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  
  // Refresh session
  const { data: { session } } = await supabase.auth.getSession();

  // Protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/brands');
  
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/signup');

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/brands/:path*', '/login', '/signup'],
};
```

## Supabase Patterns

### Browser Client

```typescript
// lib/supabase/client.ts

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server Client

```typescript
// lib/supabase/server.ts

import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createServerClient() {
  const cookieStore = cookies();

  return createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### Data Operations

```typescript
// lib/supabase/brands.ts

import { createServerClient } from './server';
import type { Brand } from '@/types/database';

export async function getBrands(userId: string): Promise<Brand[]> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getBrand(brandId: string): Promise<Brand> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('id', brandId)
    .single();

  if (error) throw error;
  return data;
}

export async function createBrand(
  userId: string,
  input: { source_url: string; is_own_brand: boolean }
): Promise<Brand> {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('brands')
    .insert({
      user_id: userId,
      source_url: input.source_url,
      is_own_brand: input.is_own_brand,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBrand(
  brandId: string,
  updates: Partial<Brand>
): Promise<void> {
  const supabase = createServerClient();
  
  const { error } = await supabase
    .from('brands')
    .update(updates)
    .eq('id', brandId);

  if (error) throw error;
}
```

## TanStack Query Patterns

### Provider Setup

The QueryClient is configured in `lib/providers/query-provider.tsx` with SSR-safe initialization:

```typescript
// lib/providers/query-provider.tsx

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

/**
 * Creates a new QueryClient with optimized defaults for the app.
 *
 * Configuration choices:
 * - staleTime: 60s - Data is fresh for 1 minute, reducing unnecessary refetches
 * - gcTime: 10min - Keep unused data in cache for 10 minutes for quick navigation
 * - retry: 1 - Single retry on failure (network issues are usually transient)
 * - refetchOnWindowFocus: false - Don't spam the API when user switches tabs
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,        // 60 seconds
        gcTime: 10 * 60 * 1000,       // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Something went wrong');
        },
      },
    },
  });
}

// SSR-safe singleton pattern
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient(); // Server: always make a new client
  }
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient(); // Browser: reuse singleton
  }
  return browserQueryClient;
}
```

### Query Key Factory Pattern

We use a factory pattern for query keys to ensure consistency and enable smart invalidation:

```typescript
// hooks/use-brands.ts

/**
 * Query key factory for brand-related queries.
 * Enables smart invalidation:
 * - brandKeys.all → invalidates everything
 * - brandKeys.lists() → invalidates all lists
 * - brandKeys.detail(id) → invalidates specific brand
 */
export const brandKeys = {
  all: ['brands'] as const,
  lists: () => [...brandKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...brandKeys.lists(), filters] as const,
  details: () => [...brandKeys.all, 'detail'] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};
```

### Query Hooks

```typescript
// hooks/use-brands.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Brand, AnalysisRun } from '@/types/database';

// Type for brand with analysis runs included
type BrandWithAnalysis = Brand & { analysis_runs: AnalysisRun[] };

/**
 * Fetch all brands for the current user.
 * Includes analysis runs for status display.
 */
export function useBrands() {
  const supabase = createClient();

  return useQuery({
    queryKey: brandKeys.lists(),
    queryFn: async (): Promise<BrandWithAnalysis[]> => {
      const { data, error } = await supabase
        .from('brands')
        .select('*, analysis_runs(*)')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as BrandWithAnalysis[];
    },
  });
}

/**
 * Fetch a single brand by ID.
 * Includes analysis runs for the detail view.
 */
export function useBrand(brandId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: brandKeys.detail(brandId),
    queryFn: async (): Promise<BrandWithAnalysis> => {
      const { data, error } = await supabase
        .from('brands')
        .select('*, analysis_runs(*)')
        .eq('id', brandId)
        .single();

      if (error) throw error;
      return data as BrandWithAnalysis;
    },
    enabled: !!brandId, // Only run if brandId is truthy
  });
}
```

### Mutation Hooks

```typescript
// hooks/use-brands.ts (continued)

/**
 * Create a new brand and start analysis.
 * Calls the /api/brands/analyze endpoint.
 */
export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { url: string; isOwnBrand: boolean }) => {
      const response = await fetch('/api/brands/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create brand');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate all brand lists to include the new brand
      queryClient.invalidateQueries({ queryKey: brandKeys.lists() });
    },
  });
}

/**
 * Delete a brand and all its analysis runs.
 */
export function useDeleteBrand() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async (brandId: string) => {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
    },
  });
}

/**
 * Re-run analysis for an existing brand.
 */
export function useReanalyzeBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId: string) => {
      const response = await fetch(`/api/brands/${brandId}/analyze`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start analysis');
      }

      return response.json();
    },
    onSuccess: (_, brandId) => {
      queryClient.invalidateQueries({ queryKey: brandKeys.detail(brandId) });
    },
  });
}
```

### Prefetching

```typescript
// hooks/use-brands.ts (continued)

/**
 * Prefetch a brand's data for faster navigation.
 * Use this on hover or when a link is visible.
 */
export function usePrefetchBrand() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return (brandId: string) => {
    queryClient.prefetchQuery({
      queryKey: brandKeys.detail(brandId),
      queryFn: async () => {
        const { data, error } = await supabase
          .from('brands')
          .select('*, analysis_runs(*)')
          .eq('id', brandId)
          .single();

        if (error) throw error;
        return data;
      },
    });
  };
}
```

### Realtime Subscription with React Query

```typescript
// hooks/use-realtime-analysis.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { brandKeys } from './use-brands';

/**
 * Subscribe to realtime updates for a brand's analysis runs.
 * Automatically invalidates the cache when updates arrive.
 */
export function useRealtimeAnalysis(brandId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!brandId) return;

    const channel = supabase
      .channel(`analysis_runs:${brandId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analysis_runs',
          filter: `brand_id=eq.${brandId}`,
        },
        () => {
          // Invalidate to trigger refetch with fresh data
          queryClient.invalidateQueries({
            queryKey: brandKeys.detail(brandId)
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [brandId, supabase, queryClient]);
}
```

### Usage Examples

```tsx
// In a component
function BrandList() {
  const { data: brands, isLoading, error } = useBrands();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div>
      {brands?.map(brand => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
}

// With mutations
function AddBrandForm() {
  const createBrand = useCreateBrand();
  const router = useRouter();

  async function handleSubmit(url: string) {
    try {
      const result = await createBrand.mutateAsync({
        url,
        isOwnBrand: false
      });
      router.push(`/brands/${result.brandId}`);
    } catch (error) {
      // Error toast is shown automatically by mutation config
    }
  }
}
```

## Error Handling

### Client-Side

```typescript
// In components, handle query errors gracefully

function BrandProfile({ brandId }: { brandId: string }) {
  const { data: brand, isLoading, error } = useBrand(brandId);

  if (isLoading) return <LoadingSkeleton />;
  
  if (error) {
    return (
      <ErrorState 
        message="Couldn't load this brand" 
        onRetry={() => window.location.reload()}
      />
    );
  }

  return <ProfileContent brand={brand} />;
}
```

### Toast Notifications

For mutations and async actions.

```typescript
// Using sonner or similar

import { toast } from 'sonner';

const createBrand = useCreateBrand();

async function handleSubmit(url: string) {
  try {
    await createBrand.mutateAsync({ url, isOwnBrand: false });
    toast.success('Brand added! Starting analysis...');
    router.push(`/brands/${newBrand.id}`);
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Something went wrong');
  }
}
```

---

## Doc Generation API (Planned)

### POST /api/docs/generate

Generate a new doc from a brand's analyzed data.

**Request:**
```typescript
{
  brandId: string;
  templateId: string;  // 'golden-circle', 'brand-brief', etc.
}
```

**Response:**
```typescript
{
  success: true;
  doc: {
    id: string;
    title: string;
    content: Record<string, unknown>;  // Structured content
    contentMarkdown: string;           // Rendered markdown
  };
}
```

**Error responses:**
- `400` - Missing required fields
- `400` - Insufficient brand data for this template
- `401` - Unauthorized
- `404` - Brand not found
- `500` - Generation failed

### Query Hooks for Docs

```typescript
// hooks/use-docs.ts

/**
 * Query key factory for doc-related queries.
 */
export const docKeys = {
  all: ['docs'] as const,
  lists: () => [...docKeys.all, 'list'] as const,
  listByBrand: (brandId: string) => [...docKeys.lists(), brandId] as const,
  details: () => [...docKeys.all, 'detail'] as const,
  detail: (id: string) => [...docKeys.details(), id] as const,
};

/**
 * Fetch all docs for a brand.
 */
export function useBrandDocs(brandId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: docKeys.listByBrand(brandId),
    queryFn: async (): Promise<GeneratedDoc[]> => {
      const { data, error } = await supabase
        .from('generated_docs')
        .select('*')
        .eq('brand_id', brandId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as GeneratedDoc[];
    },
    enabled: !!brandId,
  });
}

/**
 * Generate a new doc from a template.
 */
export function useGenerateDoc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { brandId: string; templateId: string }) => {
      const response = await fetch('/api/docs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate doc');
      }

      return response.json();
    },
    onSuccess: (_, { brandId }) => {
      // Invalidate docs list for this brand
      queryClient.invalidateQueries({ queryKey: docKeys.listByBrand(brandId) });
      toast.success('Doc generated!');
    },
  });
}

/**
 * Delete a generated doc.
 */
export function useDeleteDoc() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  return useMutation({
    mutationFn: async ({ docId, brandId }: { docId: string; brandId: string }) => {
      const { error } = await supabase
        .from('generated_docs')
        .delete()
        .eq('id', docId);

      if (error) throw error;
      return { brandId };
    },
    onSuccess: (_, { brandId }) => {
      queryClient.invalidateQueries({ queryKey: docKeys.listByBrand(brandId) });
      toast.success('Doc deleted');
    },
  });
}
```

### Data Sufficiency Check Hook

```typescript
// hooks/use-doc-readiness.ts

import { useMemo } from 'react';
import { docTemplates } from '@/lib/docs/registry';
import type { BrandWithAnalyses } from '@/types/database';

type ReadinessResult = {
  ready: boolean;
  missing: string[];
  missingAnalyzers: string[];
};

/**
 * Check if a brand has sufficient data for a doc template.
 */
export function useDocReadiness(
  brand: BrandWithAnalyses | undefined,
  templateId: string
): ReadinessResult {
  return useMemo(() => {
    if (!brand) {
      return { ready: false, missing: ['Brand data'], missingAnalyzers: [] };
    }

    const template = docTemplates.find(t => t.id === templateId);
    if (!template) {
      return { ready: false, missing: ['Unknown template'], missingAnalyzers: [] };
    }

    const missing: string[] = [];
    const missingAnalyzers: string[] = [];

    // Check each required analyzer
    for (const analyzerType of template.requiredAnalyzers) {
      const run = brand.analysis_runs.find(r => r.analyzer_type === analyzerType);

      if (!run || run.status !== 'complete' || !run.parsed_data) {
        missingAnalyzers.push(analyzerType);
        continue;
      }

      // Check required fields within this analyzer
      const requiredFields = template.requiredFields?.[analyzerType] || [];
      for (const field of requiredFields) {
        const value = run.parsed_data[field];
        if (value === null || value === undefined || value === '') {
          missing.push(`${analyzerType}.${field}`);
        }
      }
    }

    return {
      ready: missing.length === 0 && missingAnalyzers.length === 0,
      missing,
      missingAnalyzers,
    };
  }, [brand, templateId]);
}
```

### Doc Generation Server Logic

```typescript
// lib/docs/generator.ts

import { docTemplates } from './registry';
import { callGPT, callGPTWithFunction } from '@/lib/api/openai';

type GenerateDocInput = {
  brandId: string;
  templateId: string;
  brandData: {
    basics?: ParsedBasics;
    customer?: ParsedCustomer;
    products?: ParsedProducts;
  };
};

export async function generateDoc(input: GenerateDocInput) {
  const template = docTemplates.find(t => t.id === input.templateId);
  if (!template) throw new Error(`Unknown template: ${input.templateId}`);

  // Step 1: Analysis - GPT generates natural language content
  const analysisPrompt = template.buildPrompt(input.brandData);
  const rawAnalysis = await callGPT(analysisPrompt, {
    maxTokens: 2000,
    temperature: 0.7,
  });

  // Step 2: Parse - Function calling extracts structured content
  const parsedContent = await callGPTWithFunction(
    template.parseSystemPrompt,
    rawAnalysis,
    template.parseFunctionName,
    template.parseFunctionDescription,
    template.parseSchema
  );

  // Generate markdown from structured content
  const markdown = template.renderMarkdown(parsedContent);

  return {
    content: parsedContent,
    contentMarkdown: markdown,
    title: template.generateTitle(input.brandData),
  };
}
```
