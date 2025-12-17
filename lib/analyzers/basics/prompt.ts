/**
 * BASICS ANALYZER PROMPT
 * =======================
 * Builds the analysis prompt for extracting basic business info.
 *
 * This is STEP 1 of the two-step AI process.
 * The output is natural language that will be parsed in step 2.
 */

import type { PromptBuilder } from '../types';

/**
 * Build the basics analysis prompt.
 *
 * The prompt asks GPT to think like a brand strategist reviewing
 * a new client's website for the first time.
 */
export const buildPrompt: PromptBuilder = (scrapedContent, _priorResults) => {
  return `You are a sharp brand strategist doing intake research on a new client.
You've just reviewed their website content (provided below).

Write a brief, natural summary covering:
- What the business is called and who founded it (if apparent)
- Roughly when they seem to have started (if mentioned or inferable)
- What industry or space they operate in
- What this business actually does—explain it like you're telling a colleague
- What their primary business model seems to be (products, services, SaaS, agency, etc.)

Be conversational and observant. Note if anything is unclear or missing from the website.
Don't use bullet points or structured formatting—just write naturally as if you're jotting
notes after reviewing their site.

If you can't find certain information (like founder name or founding year), just mention
that it wasn't apparent from the website. Don't make things up.

---
WEBSITE CONTENT:
${scrapedContent}`;
};
