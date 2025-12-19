/**
 * DOC LIST ITEM
 * ==============
 * Single item in the generated docs list.
 * Shows doc title, date, and actions (view, export, delete).
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import * as React from 'react';
import { useState } from 'react';
import { FileText, Eye, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DocExportMenu } from './doc-export-menu';
import { formatRelativeTime } from '@/lib/utils/format';
import { useDeleteDoc } from '@/hooks';
import { cn } from '@/lib/utils/cn';
import type { GeneratedDoc } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface DocListItemProps {
  /** The generated doc */
  doc: GeneratedDoc;

  /** Callback when view is clicked */
  onView: () => void;
}

// ============================================================================
// INLINE ALERT DIALOG (avoids creating separate ui file)
// ============================================================================

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogContent = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Overlay
      className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
    />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Content>
  </AlertDialogPrimitive.Portal>
));
AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);

const AlertDialogTitle = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = 'AlertDialogTitle';

const AlertDialogDescription = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = 'AlertDialogDescription';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * List item for a generated doc.
 * Shows title, date, and action menu.
 *
 * @example
 * <DocListItem doc={doc} onView={() => setSelectedDoc(doc)} />
 */
export function DocListItem({ doc, onView }: DocListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteDoc = useDeleteDoc();

  const isDeleting = deleteDoc.isPending && deleteDoc.variables?.docId === doc.id;

  const handleDelete = () => {
    deleteDoc.mutate(
      { docId: doc.id, brandId: doc.brand_id },
      { onSuccess: () => setShowDeleteDialog(false) }
    );
  };

  // Format the date
  const dateText = formatRelativeTime(doc.created_at);

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/20 transition-colors">
        {/* Doc info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{doc.title}</p>
            <p className="text-xs text-muted-foreground">{dateText}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onView}>
            <Eye className="w-4 h-4" />
            <span className="sr-only">View</span>
          </Button>

          {doc.content_markdown && (
            <DocExportMenu
              markdown={doc.content_markdown}
              title={doc.title}
              trigger={
                <Button variant="ghost" size="sm">
                  Export
                </Button>
              }
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{doc.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogPrimitive.Cancel asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action asChild>
              <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </AlertDialogPrimitive.Action>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
