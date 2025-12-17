/**
 * PRODUCTS CARD COMPONENT
 * =========================
 * Displays the products analyzer results.
 */

import { Package, DollarSign, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ParsedProducts, ProductOffering } from '@/types/analyzers';

// ============================================================================
// TYPES
// ============================================================================

interface ProductsCardProps {
  data: ParsedProducts | null;
  isLoading?: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function OfferingItem({ offering }: { offering: ProductOffering }) {
  return (
    <div className="p-3 rounded-lg bg-stone-50 border border-stone-100">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-stone-900">
            {offering.name}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">
            {offering.description}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          {offering.price && (
            <p className="text-sm font-semibold text-stone-900">
              {offering.price}
            </p>
          )}
          <Badge variant="default" className="mt-1">
            {offering.pricing_model}
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card displaying products analyzer results.
 *
 * @example
 * <ProductsCard data={parsedProducts} />
 */
export function ProductsCard({ data, isLoading }: ProductsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            Products & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="opacity-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-stone-400" />
            Products & Pricing
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
          <Package className="w-5 h-5 text-orange-500" />
          Products & Pricing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Offering Type & Price Positioning */}
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{data.offering_type}</Badge>
          <Badge variant="orange">{data.price_positioning}</Badge>
        </div>

        {/* Primary Offer */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            <p className="text-xs text-stone-500 uppercase tracking-wide">
              Primary Offer
            </p>
          </div>
          <p className="text-sm text-stone-700">{data.primary_offer}</p>
        </div>

        {/* Offerings List */}
        {data.offerings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-stone-500" />
              <p className="text-xs text-stone-500 uppercase tracking-wide">
                Offerings ({data.offerings.length})
              </p>
            </div>
            <div className="space-y-2">
              {data.offerings.map((offering, i) => (
                <OfferingItem key={i} offering={offering} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
