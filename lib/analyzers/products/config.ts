/**
 * PRODUCTS ANALYZER CONFIG
 * =========================
 * Configuration for the products & pricing analyzer.
 * Extracts information about what the business sells.
 */

import { Package } from 'lucide-react';
import type { AnalyzerConfig } from '../types';

export const config: AnalyzerConfig = {
  id: 'products',
  name: 'Products & Pricing',
  description: 'What they sell, pricing models, and market positioning',
  icon: Package,
  dependsOn: [], // No dependencies - runs concurrently
};
