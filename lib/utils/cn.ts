/**
 * CN UTILITY
 * ===========
 * Combines clsx and tailwind-merge for conditional class handling.
 * This is the standard pattern used by shadcn/ui.
 *
 * Usage:
 *   import { cn } from '@/lib/utils/cn';
 *
 *   <div className={cn(
 *     'base-class',
 *     isActive && 'active-class',
 *     variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500'
 *   )} />
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution.
 *
 * @param inputs - Class values to merge (strings, arrays, objects, etc.)
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * cn('px-4 py-2', 'px-6')           // -> 'py-2 px-6' (px-6 wins)
 * cn('text-red-500', isBlue && 'text-blue-500')
 * cn({ 'bg-green': isSuccess, 'bg-red': isError })
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
