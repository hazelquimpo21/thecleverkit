/**
 * CUSTOMER CARD COMPONENT
 * =========================
 * Displays the customer analyzer results.
 */

import { Users, AlertCircle, Target, Brain, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ParsedCustomer } from '@/types/analyzers';

// ============================================================================
// TYPES
// ============================================================================

interface CustomerCardProps {
  data: ParsedCustomer | null;
  isLoading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card displaying customer analyzer results.
 *
 * @example
 * <CustomerCard data={parsedCustomer} />
 */
export function CustomerCard({ data, isLoading }: CustomerCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Customer Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-stone-400" />
            Customer Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500">Analysis not yet complete</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-500" />
          Customer Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Subcultures */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-stone-500" />
            <p className="text-xs text-stone-500 uppercase tracking-wide">
              Target Audiences
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.subcultures.map((subculture, i) => (
              <Badge key={i} variant="secondary">
                {subculture}
              </Badge>
            ))}
          </div>
        </div>

        {/* Primary Problem */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-stone-500" />
            <p className="text-xs text-stone-500 uppercase tracking-wide">
              Primary Problem
            </p>
          </div>
          <p className="text-sm text-stone-700">{data.primary_problem}</p>
        </div>

        {/* Secondary Problems */}
        {data.secondary_problems.length > 0 && (
          <div>
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">
              Secondary Problems
            </p>
            <ul className="space-y-1">
              {data.secondary_problems.map((problem, i) => (
                <li
                  key={i}
                  className="text-sm text-stone-600 flex items-start gap-2"
                >
                  <span className="text-stone-400 mt-1">•</span>
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Sophistication & Motivation */}
        <div className="flex gap-4 pt-2 border-t border-stone-100">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-stone-500" />
              <p className="text-xs text-stone-500 uppercase tracking-wide">
                Sophistication
              </p>
            </div>
            <Badge variant="info">{data.customer_sophistication}</Badge>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-stone-500" />
              <p className="text-xs text-stone-500 uppercase tracking-wide">
                Buying Driver
              </p>
            </div>
            <Badge variant="customer">{data.buying_motivation}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
