/**
 * STATUS BADGE COMPONENT
 * =======================
 * Shows analysis status with appropriate styling.
 */

import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import type { AnalysisStatus } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface StatusBadgeProps {
  status: AnalysisStatus | 'pending';
  showIcon?: boolean;
}

// ============================================================================
// CONFIG
// ============================================================================

const statusConfig: Record<
  AnalysisStatus | 'pending',
  {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'error' | 'info';
    icon: typeof Clock;
  }
> = {
  queued: {
    label: 'Queued',
    variant: 'default',
    icon: Clock,
  },
  analyzing: {
    label: 'Analyzing',
    variant: 'info',
    icon: Loader2,
  },
  parsing: {
    label: 'Processing',
    variant: 'info',
    icon: Loader2,
  },
  complete: {
    label: 'Complete',
    variant: 'success',
    icon: CheckCircle,
  },
  error: {
    label: 'Error',
    variant: 'error',
    icon: AlertCircle,
  },
  pending: {
    label: 'Pending',
    variant: 'default',
    icon: Clock,
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Status badge with icon and appropriate coloring.
 *
 * @example
 * <StatusBadge status="analyzing" />
 * <StatusBadge status="complete" showIcon />
 */
export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isAnimated = status === 'analyzing' || status === 'parsing';

  return (
    <Badge variant={config.variant}>
      {showIcon && (
        <Icon
          className={`w-3 h-3 ${isAnimated ? 'animate-spin' : ''}`}
        />
      )}
      {config.label}
    </Badge>
  );
}
