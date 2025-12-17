/**
 * OPENAI API HELPER
 * ==================
 * Wrapper functions for OpenAI GPT API calls.
 * Handles both analysis (step 1) and parsing (step 2) calls.
 *
 * Usage:
 *   import { analyzeWithGPT, parseWithGPT } from '@/lib/api/openai';
 */

import OpenAI from 'openai';
import { log } from '@/lib/utils/logger';
import type { FunctionSchema } from '@/lib/analyzers/types';

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

let openaiClient: OpenAI | null = null;

/**
 * Get or create the OpenAI client.
 * Lazily initialized to avoid issues during build.
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        '❌ Missing OPENAI_API_KEY!\n' +
        'Add OPENAI_API_KEY to your .env.local file.'
      );
    }

    openaiClient = new OpenAI({ apiKey });
    log.info('🤖 OpenAI client initialized');
  }

  return openaiClient;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_MODEL = 'gpt-4o-mini';
const MAX_TOKENS_ANALYSIS = 2000;
const MAX_TOKENS_PARSE = 1500;
const TEMPERATURE_ANALYSIS = 0.7; // More creative for analysis
const TEMPERATURE_PARSE = 0.1;    // More deterministic for parsing

// ============================================================================
// ANALYSIS (STEP 1)
// ============================================================================

export interface AnalysisOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AnalysisResult {
  success: boolean;
  content?: string;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Run the analysis step (natural language thinking).
 *
 * @param prompt - The analysis prompt
 * @param options - Optional configuration
 * @returns Analysis result with natural language content
 *
 * @example
 * const result = await analyzeWithGPT(buildPrompt(scrapedContent));
 * if (result.success) {
 *   console.log(result.content); // Natural language analysis
 * }
 */
export async function analyzeWithGPT(
  prompt: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResult> {
  const {
    model = DEFAULT_MODEL,
    maxTokens = MAX_TOKENS_ANALYSIS,
    temperature = TEMPERATURE_ANALYSIS,
  } = options;

  log.debug('🔄 Starting GPT analysis', { model, maxTokens });

  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      log.error('GPT returned empty response');
      return {
        success: false,
        error: 'GPT returned an empty response',
      };
    }

    log.debug('✅ GPT analysis complete', {
      tokens: response.usage?.total_tokens,
    });

    return {
      success: true,
      content,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('GPT analysis failed', { error: message });

    return {
      success: false,
      error: `GPT analysis failed: ${message}`,
    };
  }
}

// ============================================================================
// PARSING (STEP 2)
// ============================================================================

export interface ParseOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ParseResult<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Run the parsing step (structured extraction via function calling).
 *
 * @param analysis - The natural language analysis from step 1
 * @param systemPrompt - System prompt for the parser
 * @param functionName - Name of the function to call
 * @param functionDescription - Description of the function
 * @param schema - JSON schema for the function parameters
 * @param options - Optional configuration
 * @returns Parsed structured data
 *
 * @example
 * const result = await parseWithGPT(
 *   analysisText,
 *   parser.systemPrompt,
 *   parser.functionName,
 *   parser.functionDescription,
 *   parser.schema
 * );
 */
export async function parseWithGPT<T = Record<string, unknown>>(
  analysis: string,
  systemPrompt: string,
  functionName: string,
  functionDescription: string,
  schema: FunctionSchema,
  options: ParseOptions = {}
): Promise<ParseResult<T>> {
  const {
    model = DEFAULT_MODEL,
    maxTokens = MAX_TOKENS_PARSE,
    temperature = TEMPERATURE_PARSE,
  } = options;

  log.debug('📋 Starting GPT parsing', { functionName, model });

  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Extract the structured data from this analysis:\n\n${analysis}`,
        },
      ],
      tools: [
        {
          type: 'function',
          function: {
            name: functionName,
            description: functionDescription,
            parameters: schema as unknown as Record<string, unknown>,
          },
        },
      ],
      tool_choice: {
        type: 'function',
        function: { name: functionName },
      },
      max_tokens: maxTokens,
      temperature,
    });

    const toolCall = response.choices[0]?.message?.tool_calls?.[0];

    // Type guard for function tool calls
    if (!toolCall || toolCall.type !== 'function') {
      log.error('GPT did not call the expected function', { toolCall });
      return {
        success: false,
        error: 'GPT did not return structured data in the expected format',
      };
    }

    const functionCall = toolCall.function;
    if (functionCall.name !== functionName) {
      log.error('GPT called wrong function', { expected: functionName, actual: functionCall.name });
      return {
        success: false,
        error: 'GPT did not return structured data in the expected format',
      };
    }

    // Parse the function arguments
    let parsedData: T;
    try {
      parsedData = JSON.parse(functionCall.arguments);
    } catch (parseError) {
      log.error('Failed to parse GPT function arguments', {
        arguments: functionCall.arguments,
      });
      return {
        success: false,
        error: 'Failed to parse GPT response as JSON',
      };
    }

    log.debug('✅ GPT parsing complete', {
      functionName,
      tokens: response.usage?.total_tokens,
    });

    return {
      success: true,
      data: parsedData,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('GPT parsing failed', { error: message });

    return {
      success: false,
      error: `GPT parsing failed: ${message}`,
    };
  }
}
