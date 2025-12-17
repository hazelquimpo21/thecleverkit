# Runner (Analyzer Orchestration)

## Overview

The runner orchestrates analyzer execution:
- Builds an execution plan based on dependencies
- Groups independent analyzers into concurrent "waves"
- Manages status updates for real-time UI feedback
- Handles errors gracefully per-analyzer

## File Location

```
/lib/analyzers/runner.ts
```

This file should stay under 200 lines by delegating to helper functions.

## Core Functions

### runAnalyzers

Main entry point. Called after scraping completes.

```typescript
// lib/analyzers/runner.ts

import { analyzers, analyzerIds } from './index';
import { buildExecutionPlan } from './execution-plan';
import { runSingleAnalyzer } from './run-single';
import { getBrand } from '@/lib/supabase/brands';

export async function runAnalyzers(
  brandId: string,
  requestedAnalyzerIds: string[] = analyzerIds
): Promise<void> {
  // 1. Get brand with scraped content
  const brand = await getBrand(brandId);
  
  if (!brand.scraped_content) {
    throw new Error('Brand has no scraped content');
  }

  // 2. Build execution plan (group by dependencies)
  const waves = buildExecutionPlan(requestedAnalyzerIds);

  // 3. Execute wave by wave
  const allResults: Record<string, unknown> = {};

  for (const wave of waves) {
    // Run all analyzers in this wave concurrently
    const waveResults = await Promise.allSettled(
      wave.map(analyzerId =>
        runSingleAnalyzer(
          brandId,
          analyzerId,
          brand.scraped_content!,
          allResults
        )
      )
    );

    // Collect successful results for next wave's dependencies
    wave.forEach((analyzerId, index) => {
      const result = waveResults[index];
      if (result.status === 'fulfilled') {
        allResults[analyzerId] = result.value;
      }
      // Errors are already logged/saved by runSingleAnalyzer
    });
  }
}
```

### buildExecutionPlan

Groups analyzers into waves based on dependencies.

```typescript
// lib/analyzers/execution-plan.ts

import { analyzers } from './index';

export function buildExecutionPlan(analyzerIds: string[]): string[][] {
  const waves: string[][] = [];
  const completed = new Set<string>();
  const remaining = new Set(analyzerIds);

  while (remaining.size > 0) {
    // Find analyzers whose dependencies are all satisfied
    const readyThisWave = [...remaining].filter(id => {
      const config = analyzers[id].config;
      return config.dependsOn.every(dep => completed.has(dep));
    });

    if (readyThisWave.length === 0 && remaining.size > 0) {
      // Circular dependency or missing dependency
      throw new Error(
        `Cannot resolve dependencies for: ${[...remaining].join(', ')}`
      );
    }

    waves.push(readyThisWave);

    // Mark as completed for next iteration
    readyThisWave.forEach(id => {
      remaining.delete(id);
      completed.add(id);
    });
  }

  return waves;
}
```

**Example outputs:**

```typescript
// MVP analyzers (no dependencies)
buildExecutionPlan(['basics', 'customer', 'products'])
// → [['basics', 'customer', 'products']]
// All run concurrently in one wave

// Future with dependencies
buildExecutionPlan(['basics', 'customer', 'products', 'competitors'])
// → [['basics', 'customer', 'products'], ['competitors']]
// Wave 1 concurrent, then wave 2 after basics completes
```

### runSingleAnalyzer

Executes one analyzer through both steps.

```typescript
// lib/analyzers/run-single.ts

import { analyzers } from './index';
import { updateAnalysisRun } from '@/lib/supabase/analysis-runs';
import { callGPT, callGPTWithFunction } from '@/lib/api/openai';

export async function runSingleAnalyzer(
  brandId: string,
  analyzerId: string,
  scrapedContent: string,
  priorResults: Record<string, unknown>
): Promise<unknown> {
  const { buildPrompt, parser } = analyzers[analyzerId];

  try {
    // Step 1: Analysis
    await updateAnalysisRun(brandId, analyzerId, {
      status: 'analyzing',
      started_at: new Date().toISOString(),
    });

    const prompt = buildPrompt(scrapedContent, priorResults);
    const rawAnalysis = await callGPT(prompt);

    // Step 2: Parsing
    await updateAnalysisRun(brandId, analyzerId, {
      status: 'parsing',
      raw_analysis: rawAnalysis,
    });

    const parsedData = await callGPTWithFunction(
      parser.systemPrompt,
      rawAnalysis,
      parser.functionName,
      parser.functionDescription,
      parser.schema
    );

    // Apply post-processing if defined
    const finalData = parser.postProcess
      ? parser.postProcess(parsedData)
      : parsedData;

    // Step 3: Complete
    await updateAnalysisRun(brandId, analyzerId, {
      status: 'complete',
      parsed_data: finalData,
      completed_at: new Date().toISOString(),
    });

    return finalData;

  } catch (error) {
    // Handle failure
    await updateAnalysisRun(brandId, analyzerId, {
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      completed_at: new Date().toISOString(),
    });

    // Re-throw so Promise.allSettled captures it
    throw error;
  }
}
```

## Status Flow

```
queued        Initial state when analysis_run created
   │
   ▼
analyzing     Step 1 in progress (GPT analysis)
   │
   ▼
parsing       Step 2 in progress (GPT function call)
   │
   ├─────────────────────┐
   ▼                     ▼
complete              error
(success)            (failure)
```

Each status change triggers a Supabase Realtime event for live UI updates.

## Database Operations

```typescript
// lib/supabase/analysis-runs.ts

import { supabase } from './client';
import type { AnalysisStatus } from '@/types/database';

// Create initial run records for a brand
export async function createAnalysisRuns(
  brandId: string,
  analyzerIds: string[]
): Promise<void> {
  const runs = analyzerIds.map(analyzerId => ({
    brand_id: brandId,
    analyzer_type: analyzerId,
    status: 'queued' as AnalysisStatus,
  }));

  const { error } = await supabase
    .from('analysis_runs')
    .insert(runs);

  if (error) throw error;
}

// Update a single run's status/data
export async function updateAnalysisRun(
  brandId: string,
  analyzerId: string,
  updates: {
    status?: AnalysisStatus;
    raw_analysis?: string;
    parsed_data?: unknown;
    error_message?: string;
    started_at?: string;
    completed_at?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from('analysis_runs')
    .update(updates)
    .eq('brand_id', brandId)
    .eq('analyzer_type', analyzerId);

  if (error) throw error;
}

// Get all runs for a brand
export async function getAnalysisRuns(brandId: string) {
  const { data, error } = await supabase
    .from('analysis_runs')
    .select('*')
    .eq('brand_id', brandId);

  if (error) throw error;
  return data;
}
```

## API Route

The runner is triggered from an API route after scraping:

```typescript
// app/api/brands/[brandId]/analyze/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { runAnalyzers } from '@/lib/analyzers/runner';
import { analyzerIds } from '@/lib/analyzers';
import { createAnalysisRuns } from '@/lib/supabase/analysis-runs';

export async function POST(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  const { brandId } = params;

  try {
    // Create queued run records first (for immediate UI feedback)
    await createAnalysisRuns(brandId, analyzerIds);

    // Start analysis (don't await—let it run in background)
    runAnalyzers(brandId).catch(console.error);

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    );
  }
}
```

Note: In production, you might want to use Vercel's background functions or a job queue for reliability. For MVP, fire-and-forget with error logging is acceptable.

## Retry Logic

```typescript
// lib/analyzers/retry.ts

import { runSingleAnalyzer } from './run-single';
import { getBrand } from '@/lib/supabase/brands';
import { getAnalysisRun, updateAnalysisRun } from '@/lib/supabase/analysis-runs';

const MAX_RETRIES = 2;

export async function retryAnalyzer(
  brandId: string,
  analyzerId: string
): Promise<void> {
  const run = await getAnalysisRun(brandId, analyzerId);
  
  if (run.retry_count >= MAX_RETRIES) {
    throw new Error('Maximum retries exceeded');
  }

  // Increment retry count
  await updateAnalysisRun(brandId, analyzerId, {
    status: 'queued',
    error_message: null,
    retry_count: run.retry_count + 1,
  });

  // Get brand and prior results
  const brand = await getBrand(brandId);
  const allRuns = await getAnalysisRuns(brandId);
  
  const priorResults: Record<string, unknown> = {};
  allRuns.forEach(r => {
    if (r.status === 'complete' && r.parsed_data) {
      priorResults[r.analyzer_type] = r.parsed_data;
    }
  });

  // Re-run single analyzer
  await runSingleAnalyzer(
    brandId,
    analyzerId,
    brand.scraped_content!,
    priorResults
  );
}
```

## Testing Analyzers

```typescript
// lib/analyzers/__tests__/runner.test.ts

import { buildExecutionPlan } from '../execution-plan';

describe('buildExecutionPlan', () => {
  it('puts independent analyzers in one wave', () => {
    const waves = buildExecutionPlan(['basics', 'customer', 'products']);
    expect(waves).toEqual([['basics', 'customer', 'products']]);
  });

  it('respects dependencies', () => {
    // Assuming competitors depends on basics
    const waves = buildExecutionPlan(['basics', 'competitors']);
    expect(waves).toEqual([['basics'], ['competitors']]);
  });

  it('throws on circular dependencies', () => {
    // Would need to mock analyzers with circular deps
    expect(() => buildExecutionPlan(['circular-a', 'circular-b']))
      .toThrow();
  });
});
```

## Performance Considerations

- **Concurrent execution**: All independent analyzers run simultaneously
- **Streaming**: Could stream GPT responses for faster perceived progress (future)
- **Caching**: Could cache analysis for unchanged scraped_content (future)
- **Rate limits**: May need to add delays if hitting OpenAI rate limits
- **Timeouts**: Each GPT call should have a timeout (30s suggested)
