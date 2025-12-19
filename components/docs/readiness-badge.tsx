/**
 * READINESS BADGE
 * ================
 * Displays "Ready" or "Needs data" status for doc templates.
 * Used in template cards to show if generation is possible.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import { Check, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

interface ReadinessBadgeProps {
  /** Whether the template is ready for generation */
  isReady: boolean;

  /** Optional click handler for "needs data" state */
  onClick?: () => void;

  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Badge showing template readiness status.
 *
 * @example
 * <ReadinessBadge isReady={true} />
 * <ReadinessBadge isReady={false} onClick={() => setShowDialog(true)} />
 */
export function ReadinessBadge({ isReady, onClick, className }: ReadinessBadgeProps) {
  if (isReady) {
    return (
      <Badge
        variant="success"
        className={cn('gap-1', className)}
      >
        <Check className="w-3 h-3" />
        Ready
      </Badge>
    );
  }

  return (
    <Badge
      variant="warning"
      className={cn(
        'gap-1',
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={onClick}
    >
      <AlertCircle className="w-3 h-3" />
      Needs data
    </Badge>
  );
}
