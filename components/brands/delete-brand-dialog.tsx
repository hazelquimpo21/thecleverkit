/**
 * DELETE BRAND DIALOG COMPONENT
 * ===============================
 * Confirmation dialog for deleting a brand.
 * Warns user that deletion is permanent.
 *
 * Usage:
 * - Controlled by parent component
 * - Shows brand name in confirmation
 * - Has cancel and delete buttons
 */

'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ============================================================================
// TYPES
// ============================================================================

interface DeleteBrandDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Name of brand being deleted (for display) */
  brandName: string;
  /** Callback when delete is confirmed */
  onConfirm: () => void;
  /** Whether delete is in progress */
  isDeleting?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Confirmation dialog for deleting a brand.
 * Requires explicit confirmation to prevent accidents.
 *
 * @example
 * <DeleteBrandDialog
 *   open={showDelete}
 *   onOpenChange={setShowDelete}
 *   brandName="Acme Corp"
 *   onConfirm={handleDelete}
 *   isDeleting={deleteIsPending}
 * />
 */
export function DeleteBrandDialog({
  open,
  onOpenChange,
  brandName,
  onConfirm,
  isDeleting = false,
}: DeleteBrandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <DialogTitle>Delete Brand</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">{brandName}</span>?
            This action cannot be undone. All analysis data will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            isLoading={isDeleting}
            loadingText="Deleting..."
          >
            Delete Brand
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
