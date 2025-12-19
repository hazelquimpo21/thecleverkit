/**
 * GOLDEN CIRCLE TYPES
 * ====================
 * TypeScript types for the Golden Circle document content.
 * Based on Simon Sinek's Why/How/What framework.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

// ============================================================================
// SECTION TYPE
// ============================================================================

/**
 * A section of the Golden Circle (Why, How, or What).
 * Each has a headline and explanation.
 */
export interface GoldenCircleSection {
  /** One-sentence statement capturing the essence */
  headline: string;

  /** 2-3 sentence expansion with supporting detail */
  explanation: string;
}

// ============================================================================
// MAIN CONTENT TYPE
// ============================================================================

/**
 * Complete parsed content for a Golden Circle document.
 * This is what gets stored in GeneratedDoc.content.
 */
export interface GoldenCircleContent {
  /**
   * WHY: The brand's purpose, cause, or belief.
   * Answers "Why does this company exist beyond making money?"
   */
  why: GoldenCircleSection;

  /**
   * HOW: The brand's differentiating value proposition.
   * Answers "How do they deliver on their purpose?"
   */
  how: GoldenCircleSection;

  /**
   * WHAT: The brand's products or services.
   * Answers "What tangible things do they offer?"
   */
  what: GoldenCircleSection;

  /**
   * Summary paragraph tying all three together.
   * Provides cohesive narrative of the brand's story.
   */
  summary: string;
}
