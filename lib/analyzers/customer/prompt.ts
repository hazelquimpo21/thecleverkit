/**
 * CUSTOMER ANALYZER PROMPT
 * =========================
 * Builds the analysis prompt for understanding target customers.
 *
 * This is STEP 1 of the two-step AI process.
 * Focuses on psychographics, problems, and buying motivations.
 */

import type { PromptBuilder } from '../types';

/**
 * Build the customer analysis prompt.
 *
 * The prompt asks GPT to think like a customer researcher trying
 * to understand who this business is really speaking to.
 */
export const buildPrompt: PromptBuilder = (scrapedContent, _priorResults) => {
  return `You are a customer research specialist analyzing a business's website to understand their target audience.

Based on the website content below, write natural observations about:

1. **Who they're talking to**: What type of person or business are they trying to reach?
   What subcultures, communities, or identities might their customers belong to?
   (e.g., "startup founders", "busy moms", "fitness enthusiasts", "SaaS companies")

2. **The core problem**: What's the main problem or pain point they're solving for customers?
   What frustrations or challenges is their customer facing?

3. **Secondary problems**: What other related problems might their customer be dealing with?

4. **Customer sophistication**: How knowledgeable does their ideal customer seem to be?
   Are they beginners who need hand-holding, informed buyers who know what they want,
   or experts who need advanced solutions?

5. **Why they buy**: What's driving the purchase decision?
   - Pain relief (solving an urgent problem)
   - Aspiration (achieving a goal or dream)
   - Necessity (required for work/life)
   - Curiosity (exploring something new)
   - Status (appearing successful or sophisticated)

Write conversationally, like you're explaining your observations to a colleague.
Read between the lines—what the website says and how it says it reveals a lot
about who they're targeting.

---
WEBSITE CONTENT:
${scrapedContent}`;
};
