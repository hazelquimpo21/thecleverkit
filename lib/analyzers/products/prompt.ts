/**
 * PRODUCTS ANALYZER PROMPT
 * =========================
 * Builds the analysis prompt for understanding products and pricing.
 *
 * This is STEP 1 of the two-step AI process.
 * Focuses on what they sell, how they price it, and market positioning.
 */

import type { PromptBuilder } from '../types';

/**
 * Build the products analysis prompt.
 *
 * The prompt asks GPT to analyze the business's offerings
 * like a competitor analyst would.
 */
export const buildPrompt: PromptBuilder = (scrapedContent, _priorResults) => {
  return `You are a competitive analyst examining a business's product and pricing strategy based on their website.

Analyze the website content below and write observations about:

1. **What they offer**: Do they sell products, services, or both?
   List out the specific offerings you can identify (courses, consulting, software, physical products, etc.)

2. **Pricing**: What prices can you see on the website?
   What pricing model do they use? (one-time, subscription, retainer, project-based, etc.)
   If pricing isn't shown, note that.

3. **Primary offer**: What's their main thing they want you to buy?
   This is usually the most prominently featured product/service.

4. **Price positioning**: Based on the language, design, and any visible prices,
   where do they position themselves in the market?
   - Budget: Emphasizes affordability, discounts, value
   - Mid-market: Balanced value proposition
   - Premium: Higher prices, emphasizes quality and exclusivity
   - Luxury: Top-tier pricing, aspirational positioning

Write conversationally. Include specific product names and prices if you find them.
Note when information is unclear or not shown on the website.

---
WEBSITE CONTENT:
${scrapedContent}`;
};
