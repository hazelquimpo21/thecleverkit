/**
 * DASHBOARD PAGE
 * ===============
 * The main authenticated landing page showing all user's brands.
 * Features:
 * - Empty state for new users
 * - Brand list organized by "Your Brand" and "Brands You Manage"
 * - Quick add brand action
 * - Delete confirmation dialog
 *
 * This is a client component because it uses React Query for data fetching
 * and real-time state management.
 */

import type { Metadata } from 'next';
import { DashboardContent } from './dashboard-content';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View and manage your brands',
};

// ============================================================================
// PAGE COMPONENT
// ============================================================================

/**
 * Dashboard page - shows user's brands.
 * Server component that renders the client content.
 */
export default function DashboardPage() {
  return <DashboardContent />;
}
