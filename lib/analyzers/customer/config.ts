/**
 * CUSTOMER ANALYZER CONFIG
 * =========================
 * Configuration for the customer profile analyzer.
 * Extracts information about who the business serves.
 */

import { Users } from 'lucide-react';
import type { AnalyzerConfig } from '../types';

export const config: AnalyzerConfig = {
  id: 'customer',
  name: 'Customer Profile',
  description: 'Who they serve, their problems, and buying motivations',
  icon: Users,
  dependsOn: [], // No dependencies - runs concurrently with basics
};
