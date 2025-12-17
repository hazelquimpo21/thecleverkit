/**
 * BASICS ANALYZER CONFIG
 * =======================
 * Configuration for the basics analyzer.
 * Extracts core business identity information.
 */

import { Building2 } from 'lucide-react';
import type { AnalyzerConfig } from '../types';

export const config: AnalyzerConfig = {
  id: 'basics',
  name: 'Basics',
  description: 'Core business information like name, industry, and what they do',
  icon: Building2,
  dependsOn: [], // No dependencies - runs first
};
