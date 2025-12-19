/**
 * GOLDEN CIRCLE PROMPT
 * =====================
 * Builds the analysis prompt for generating Golden Circle content.
 *
 * This is STEP 1 of the two-step AI process.
 * The output is natural language that will be parsed in step 2.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

import type { BrandData } from '../../types';

// ============================================================================
// PROMPT BUILDER
// ============================================================================

/**
 * Build the Golden Circle generation prompt.
 *
 * The prompt guides GPT to think like a brand strategist applying
 * Simon Sinek's Golden Circle framework to the brand's data.
 *
 * @param brandData - Aggregated brand analysis data
 * @returns The prompt string to send to GPT
 */
export function buildPrompt(brandData: BrandData): string {
  const { brandName, basics, customer, products } = brandData;

  // Build context from available analyzer data
  const contextSections: string[] = [];

  // Include basics data
  if (basics) {
    contextSections.push(`BUSINESS OVERVIEW:
- Name: ${basics.business_name}
- Industry: ${basics.industry}
- Description: ${basics.business_description}
- Business Model: ${basics.business_model}
${basics.founded_year ? `- Founded: ${basics.founded_year}` : ''}
${basics.founder_name ? `- Founder: ${basics.founder_name}` : ''}`);
  }

  // Include customer data
  if (customer) {
    contextSections.push(`CUSTOMER INSIGHTS:
- Primary Problem: ${customer.primary_problem}
- Buying Motivation: ${customer.buying_motivation}
- Customer Sophistication: ${customer.customer_sophistication}
- Subcultures: ${customer.subcultures.join(', ')}
${customer.secondary_problems.length > 0 ? `- Secondary Problems: ${customer.secondary_problems.join('; ')}` : ''}`);
  }

  // Include products data if available
  if (products) {
    const offeringsText = products.offerings
      .slice(0, 5) // Limit to top 5 offerings
      .map(o => `  - ${o.name}: ${o.description}`)
      .join('\n');

    contextSections.push(`OFFERINGS:
- Type: ${products.offering_type}
- Primary Offer: ${products.primary_offer}
- Price Positioning: ${products.price_positioning}
- Key Offerings:
${offeringsText}`);
  }

  const brandContext = contextSections.join('\n\n');

  return `You are a senior brand strategist applying Simon Sinek's Golden Circle framework.

Review the following brand intelligence about "${brandName}" and write a compelling Golden Circle analysis.

FRAMEWORK REMINDER:
- WHY: The purpose, cause, or belief. Why does this company exist beyond making money? What do they fundamentally believe about the world or their industry?
- HOW: The differentiating value proposition. How do they bring their why to life? What's their approach, process, or secret sauce?
- WHAT: The products or services. What tangible things do they offer? This is the easiest to identify.

${brandContext}

---

INSTRUCTIONS:

Write a thoughtful Golden Circle analysis for this brand. For each section:

1. **WHY**: Look at the customer's primary problem and buying motivation to infer the deeper purpose. What change does this brand believe in? What would the world look like if they succeeded at scale?

2. **HOW**: Look at their business model and approach. What makes their method distinctive? How do they deliver on their purpose differently than alternatives?

3. **WHAT**: Summarize their offerings clearly. What can customers actually buy or engage with?

Then write a brief summary paragraph that ties all three together into a cohesive brand story.

Write conversationally, as if explaining this brand to a colleague. Be insightful and specific—avoid generic statements that could apply to any company. Draw directly from the data provided.

Don't use bullet points or headers in your response—just write naturally, clearly separating the Why, How, What, and Summary sections.`;
}
