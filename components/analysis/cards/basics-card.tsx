/**
 * BASICS CARD COMPONENT
 * ======================
 * Displays the basics analyzer results.
 */

import { Building2, User, Calendar, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { ParsedBasics } from '@/types/analyzers';

// ============================================================================
// TYPES
// ============================================================================

interface BasicsCardProps {
  data: ParsedBasics | null;
  isLoading?: boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm text-foreground mt-0.5">
          {value || <span className="text-muted-foreground italic">Not found</span>}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Card displaying basics analyzer results.
 *
 * @example
 * <BasicsCard data={parsedBasics} />
 * <BasicsCard data={null} isLoading />
 */
export function BasicsCard({ data, isLoading }: BasicsCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Basics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
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
            <Building2 className="w-5 h-5 text-muted-foreground" />
            Basics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Analysis not yet complete</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Basics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field
          icon={Building2}
          label="Business Name"
          value={data.business_name}
        />
        <Field
          icon={User}
          label="Founder"
          value={data.founder_name}
        />
        <Field
          icon={Calendar}
          label="Founded"
          value={data.founded_year}
        />
        <Field
          icon={Briefcase}
          label="Industry"
          value={data.industry}
        />

        {/* Business Description */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            What They Do
          </p>
          <p className="text-sm text-foreground/80">
            {data.business_description}
          </p>
        </div>

        {/* Business Model */}
        <div className="pt-2">
          <Badge variant="basics">{data.business_model}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
