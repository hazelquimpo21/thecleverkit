/**
 * GOLDEN CIRCLE CONFIG
 * =====================
 * Configuration for the Golden Circle document template.
 * Based on Simon Sinek's Why/How/What framework.
 *
 * This template helps brands articulate:
 * - Why they exist (purpose/belief)
 * - How they deliver value (approach/method)
 * - What they offer (products/services)
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

import { Target } from 'lucide-react';
import type { DocTemplateConfig } from '../../types';

// ============================================================================
// TEMPLATE CONFIG
// ============================================================================

export const config: DocTemplateConfig = {
  id: 'golden-circle',
  name: 'Golden Circle',
  description: 'Define your Why, How, and What using Simon Sinek\'s framework',
  icon: Target,

  // Requires both basics and customer analyzers to be complete
  requiredAnalyzers: ['basics', 'customer'],

  // Specific fields we need from each analyzer
  requiredFields: {
    basics: ['business_description', 'business_model'],
    customer: ['primary_problem', 'buying_motivation'],
  },
};
