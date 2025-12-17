/**
 * LOGGER UTILITY
 * ===============
 * Beautiful, emoji-rich logging for development and debugging.
 * Makes it easy to see what's happening in the console.
 *
 * Usage:
 *   import { log } from '@/lib/utils/logger';
 *   log.info('Starting scrape', { url });
 *   log.success('Brand created!');
 *   log.error('Failed to fetch', error);
 */

// ============================================================================
// TYPES
// ============================================================================

type LogLevel = 'debug' | 'info' | 'success' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const LOG_EMOJIS: Record<LogLevel, string> = {
  debug: '🔍',
  info: '💡',
  success: '✅',
  warn: '⚠️',
  error: '❌',
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[90m',   // Gray
  info: '\x1b[36m',    // Cyan
  success: '\x1b[32m', // Green
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current timestamp in a readable format
 */
function getTimestamp(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format context object for display
 */
function formatContext(context?: LogContext): string {
  if (!context || Object.keys(context).length === 0) {
    return '';
  }

  const formatted = Object.entries(context)
    .map(([key, value]) => {
      const displayValue = typeof value === 'object'
        ? JSON.stringify(value, null, 2)
        : String(value);
      return `  ${DIM}${key}:${RESET} ${displayValue}`;
    })
    .join('\n');

  return `\n${formatted}`;
}

/**
 * Create a formatted log message
 */
function createLogMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const emoji = LOG_EMOJIS[level];
  const color = LOG_COLORS[level];
  const timestamp = getTimestamp();
  const contextStr = formatContext(context);

  return `${DIM}[${timestamp}]${RESET} ${emoji} ${color}${BOLD}${message}${RESET}${contextStr}`;
}

// ============================================================================
// LOGGER OBJECT
// ============================================================================

/**
 * Main logger object with methods for each log level.
 *
 * Examples:
 *   log.info('Starting process');
 *   log.success('Completed!', { duration: '2.5s' });
 *   log.error('Failed to connect', { url, error: err.message });
 */
export const log = {
  /**
   * Debug level - for detailed debugging info (only shows in development)
   */
  debug: (message: string, context?: LogContext): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log(createLogMessage('debug', message, context));
    }
  },

  /**
   * Info level - for general information
   */
  info: (message: string, context?: LogContext): void => {
    console.log(createLogMessage('info', message, context));
  },

  /**
   * Success level - for successful operations
   */
  success: (message: string, context?: LogContext): void => {
    console.log(createLogMessage('success', message, context));
  },

  /**
   * Warn level - for warnings that don't stop execution
   */
  warn: (message: string, context?: LogContext): void => {
    console.warn(createLogMessage('warn', message, context));
  },

  /**
   * Error level - for errors and failures
   */
  error: (message: string, context?: LogContext): void => {
    console.error(createLogMessage('error', message, context));
  },

  /**
   * Group related logs together (for cleaner output)
   */
  group: (title: string, fn: () => void): void => {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`${BOLD}📦 ${title}${RESET}`);
    console.log(`${'─'.repeat(60)}`);
    fn();
    console.log(`${'─'.repeat(60)}\n`);
  },

  /**
   * Log a step in a multi-step process
   */
  step: (stepNumber: number, totalSteps: number, message: string): void => {
    const progress = `[${stepNumber}/${totalSteps}]`;
    console.log(`${DIM}${progress}${RESET} ▶️  ${message}`);
  },

  /**
   * Log the start of an async operation (returns a "done" function)
   */
  startTimer: (operation: string): (() => void) => {
    const start = Date.now();
    console.log(`${DIM}[${getTimestamp()}]${RESET} ⏱️  Starting: ${operation}`);

    return () => {
      const duration = Date.now() - start;
      const durationStr = duration < 1000
        ? `${duration}ms`
        : `${(duration / 1000).toFixed(2)}s`;
      console.log(`${DIM}[${getTimestamp()}]${RESET} ⏱️  Finished: ${operation} ${DIM}(${durationStr})${RESET}`);
    };
  },

  /**
   * Pretty-print the app startup banner
   */
  banner: (appName: string, version?: string): void => {
    const versionStr = version ? ` v${version}` : '';
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 ${BOLD}${appName}${RESET}${versionStr}
║                                                              ║
║   ${DIM}Your brand intelligence assistant${RESET}
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
  },
};

// ============================================================================
// ANALYZER-SPECIFIC LOGGING
// ============================================================================

/**
 * Specialized logger for analyzer operations.
 * Provides consistent formatting for analyzer status updates.
 */
export const analyzerLog = {
  /**
   * Log analyzer starting
   */
  start: (analyzerType: string, brandId: string): void => {
    log.info(`🧠 Analyzer starting: ${analyzerType}`, { brandId });
  },

  /**
   * Log analyzer analyzing (step 1)
   */
  analyzing: (analyzerType: string): void => {
    log.info(`🔄 Analyzing with GPT: ${analyzerType}`);
  },

  /**
   * Log analyzer parsing (step 2)
   */
  parsing: (analyzerType: string): void => {
    log.info(`📋 Parsing results: ${analyzerType}`);
  },

  /**
   * Log analyzer complete
   */
  complete: (analyzerType: string, duration: number): void => {
    const durationStr = `${(duration / 1000).toFixed(2)}s`;
    log.success(`Analyzer complete: ${analyzerType}`, { duration: durationStr });
  },

  /**
   * Log analyzer error
   */
  error: (analyzerType: string, error: string): void => {
    log.error(`Analyzer failed: ${analyzerType}`, { error });
  },
};
