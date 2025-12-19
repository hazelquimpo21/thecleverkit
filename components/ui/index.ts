/**
 * UI COMPONENTS INDEX
 * ====================
 * Central export for all UI primitives.
 *
 * @update 2025-12-19 - Added EmptyState, ErrorState, CardProps
 */

// Core components
export { Button, buttonVariants, type ButtonProps } from './button';
export { Input } from './input';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  type CardProps,
} from './card';
export { Badge, badgeVariants, type BadgeProps } from './badge';
export { Skeleton } from './skeleton';

// State components
export { EmptyState, type EmptyStateProps } from './empty-state';
export { ErrorState, type ErrorStateProps } from './error-state';
