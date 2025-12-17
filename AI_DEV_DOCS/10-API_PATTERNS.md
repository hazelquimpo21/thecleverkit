# API Patterns

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

### Query Hooks

```typescript
// hooks/use-brands.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useBrands() {
  const supabase = createClient();

  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*, analysis_runs(*)')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useBrand(brandId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ['brands', brandId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*, analysis_runs(*)')
        .eq('id', brandId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!brandId,
  });
}
```

### Mutation Hooks

```typescript
// hooks/use-brands.ts (continued)

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { url: string; isOwnBrand: boolean }) => {
      const response = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}
```

### Realtime Subscription

```typescript
// hooks/use-realtime-analysis.ts

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function useRealtimeAnalysis(brandId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
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
        (payload) => {
          // Invalidate to refetch
          queryClient.invalidateQueries({ 
            queryKey: ['brands', brandId] 
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
