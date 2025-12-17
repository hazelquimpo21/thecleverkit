/**
 * ANALYZER RUNNER
 * =================
 * Orchestrates the execution of analyzers for a brand.
 * Handles the two-step AI process: analysis → parsing.
 *
 * Usage:
 *   import { runAnalyzer, runAllAnalyzers } from '@/lib/analyzers/runner';
 *
 *   // Run all analyzers
 *   await runAllAnalyzers(brandId, scrapedContent);
 *
 *   // Run single analyzer
 *   await runAnalyzer({ brandId, analyzerType: 'basics', scrapedContent });
 */

import { getAnalyzer, analyzerIds } from './index';
import { updateAnalysisRunByType } from '@/lib/supabase/analysis-runs';
import { analyzeWithGPT, parseWithGPT } from '@/lib/api/openai';
import { log, analyzerLog } from '@/lib/utils/logger';
import type { AnalyzerType } from '@/types';
import type { AnalyzerInput, AnalyzerResult, PriorResults } from './types';

// ============================================================================
// SINGLE ANALYZER EXECUTION
// ============================================================================

/**
 * Run a single analyzer for a brand.
 *
 * This is the core execution function that:
 * 1. Updates status to "analyzing"
 * 2. Runs the analysis prompt through GPT
 * 3. Updates status to "parsing"
 * 4. Runs the parser to extract structured data
 * 5. Saves results and updates status to "complete"
 *
 * @param input - Analyzer input with brandId, type, and content
 * @returns Result with raw analysis and parsed data
 */
export async function runAnalyzer(input: AnalyzerInput): Promise<AnalyzerResult> {
  const { brandId, analyzerType, scrapedContent, priorResults } = input;
  const startTime = Date.now();

  analyzerLog.start(analyzerType, brandId);

  try {
    // Get the analyzer definition
    const analyzer = getAnalyzer(analyzerType);

    // ========================================
    // STEP 1: Analysis (natural language)
    // ========================================

    // Update status to analyzing
    await updateAnalysisRunByType(brandId, analyzerType, {
      status: 'analyzing',
      startedAt: new Date().toISOString(),
    });

    analyzerLog.analyzing(analyzerType);

    // Build the prompt
    const prompt = analyzer.buildPrompt(scrapedContent, priorResults);

    // Run GPT analysis
    const analysisResult = await analyzeWithGPT(prompt);

    if (!analysisResult.success || !analysisResult.content) {
      throw new Error(analysisResult.error || 'Analysis failed');
    }

    const rawAnalysis = analysisResult.content;

    // ========================================
    // STEP 2: Parsing (structured extraction)
    // ========================================

    // Update status to parsing
    await updateAnalysisRunByType(brandId, analyzerType, {
      status: 'parsing',
      rawAnalysis,
    });

    analyzerLog.parsing(analyzerType);

    // Run GPT parsing with function calling
    const parseResult = await parseWithGPT(
      rawAnalysis,
      analyzer.parser.systemPrompt,
      analyzer.parser.functionName,
      analyzer.parser.functionDescription,
      analyzer.parser.schema
    );

    if (!parseResult.success || !parseResult.data) {
      throw new Error(parseResult.error || 'Parsing failed');
    }

    // Apply post-processing if defined
    let parsedData = parseResult.data;
    if (analyzer.parser.postProcess) {
      parsedData = analyzer.parser.postProcess(parsedData as never);
    }

    // ========================================
    // Save results
    // ========================================

    await updateAnalysisRunByType(brandId, analyzerType, {
      status: 'complete',
      parsedData: parsedData as Record<string, unknown>,
      completedAt: new Date().toISOString(),
      errorMessage: null,
    });

    const duration = Date.now() - startTime;
    analyzerLog.complete(analyzerType, duration);

    return {
      success: true,
      rawAnalysis,
      parsedData,
      durationMs: duration,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Update status to error
    await updateAnalysisRunByType(brandId, analyzerType, {
      status: 'error',
      errorMessage,
      completedAt: new Date().toISOString(),
    });

    const duration = Date.now() - startTime;
    analyzerLog.error(analyzerType, errorMessage);

    return {
      success: false,
      error: errorMessage,
      durationMs: duration,
    };
  }
}

// ============================================================================
// BATCH ANALYZER EXECUTION
// ============================================================================

/**
 * Run all analyzers for a brand concurrently.
 *
 * Since none of our MVP analyzers have dependencies, they all run
 * in parallel for maximum speed.
 *
 * @param brandId - The brand UUID
 * @param scrapedContent - The scraped website content
 * @returns Results from all analyzers
 */
export async function runAllAnalyzers(
  brandId: string,
  scrapedContent: string
): Promise<Map<AnalyzerType, AnalyzerResult>> {
  log.group('Running All Analyzers', () => {
    log.info('Starting concurrent analysis', {
      brandId,
      analyzers: analyzerIds.join(', '),
    });
  });

  const startTime = Date.now();
  const results = new Map<AnalyzerType, AnalyzerResult>();

  // Build execution plan (for future dependency support)
  const waves = buildExecutionPlan();

  // Execute each wave
  for (const wave of waves) {
    log.info(`📊 Executing wave: ${wave.join(', ')}`);

    // Run analyzers in this wave concurrently
    const waveResults = await Promise.all(
      wave.map(analyzerType =>
        runAnalyzer({
          brandId,
          analyzerType,
          scrapedContent,
          priorResults: buildPriorResults(results),
        }).then(result => ({ analyzerType, result }))
      )
    );

    // Store results
    for (const { analyzerType, result } of waveResults) {
      results.set(analyzerType, result);
    }
  }

  const totalDuration = Date.now() - startTime;
  const successCount = Array.from(results.values()).filter(r => r.success).length;

  log.success('All analyzers complete', {
    total: results.size,
    successful: successCount,
    failed: results.size - successCount,
    totalDuration: `${(totalDuration / 1000).toFixed(2)}s`,
  });

  return results;
}

// ============================================================================
// EXECUTION PLANNING
// ============================================================================

/**
 * Build an execution plan based on analyzer dependencies.
 * Returns arrays of analyzer IDs that can run concurrently.
 *
 * For MVP, all analyzers have no dependencies so they run in one wave.
 * This function supports future analyzers with dependencies.
 */
function buildExecutionPlan(): AnalyzerType[][] {
  const waves: AnalyzerType[][] = [];
  const completed = new Set<AnalyzerType>();

  // Keep building waves until all analyzers are scheduled
  while (completed.size < analyzerIds.length) {
    const wave: AnalyzerType[] = [];

    for (const id of analyzerIds) {
      if (completed.has(id)) continue;

      const analyzer = getAnalyzer(id);
      const dependenciesMet = analyzer.config.dependsOn.every(dep =>
        completed.has(dep)
      );

      if (dependenciesMet) {
        wave.push(id);
      }
    }

    if (wave.length === 0) {
      // Circular dependency or missing analyzer
      log.error('Could not build execution plan - possible circular dependency');
      break;
    }

    waves.push(wave);
    wave.forEach(id => completed.add(id));
  }

  return waves;
}

/**
 * Build prior results object from completed analyzer results.
 * Used by dependent analyzers to access previous outputs.
 */
function buildPriorResults(
  results: Map<AnalyzerType, AnalyzerResult>
): PriorResults {
  const priorResults: PriorResults = {};

  for (const [analyzerType, result] of results) {
    if (result.success && result.parsedData) {
      priorResults[analyzerType] = result.parsedData;
    }
  }

  return priorResults;
}
