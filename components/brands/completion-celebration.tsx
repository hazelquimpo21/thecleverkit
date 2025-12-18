/**
 * COMPLETION CELEBRATION COMPONENT
 * ==================================
 * Shows a celebratory toast when all analysis completes.
 * Auto-dismisses after a few seconds or on user action.
 */

'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================================================
// TYPES
// ============================================================================

interface CompletionCelebrationProps {
  /** Callback when user dismisses the celebration */
  onDismiss: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Celebratory toast that appears when all analyzers complete.
 *
 * @example
 * {justCompleted && <CompletionCelebration onDismiss={acknowledgeCompletion} />}
 */
export function CompletionCelebration({ onDismiss }: CompletionCelebrationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  /**
   * Handle dismissal with exit animation
   */
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 200);
  };

  // Auto-dismiss after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        bg-white rounded-xl shadow-lg border border-stone-200
        p-4 pr-10
        flex items-center gap-3
        transition-all duration-200
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Success icon with sparkle effect */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
      </div>

      {/* Message */}
      <div>
        <p className="font-medium text-stone-900">Analysis Complete!</p>
        <p className="text-sm text-stone-500">
          Brand insights are ready to view
        </p>
      </div>

      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 p-1 h-auto hover:bg-stone-100"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-stone-400" />
      </Button>
    </div>
  );
}
