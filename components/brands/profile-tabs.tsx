/**
 * PROFILE TABS
 * =============
 * Tab navigation for brand profile pages.
 * Switches between Overview (analysis) and Docs views.
 *
 * @created 2025-12-19 - Initial docs feature implementation
 */

'use client';

import { cn } from '@/lib/utils/cn';

// ============================================================================
// TYPES
// ============================================================================

export type ProfileTab = 'overview' | 'docs';

interface ProfileTabsProps {
  /** Currently active tab */
  activeTab: ProfileTab;

  /** Callback when tab is changed */
  onTabChange: (tab: ProfileTab) => void;

  /** Optional count for docs tab */
  docsCount?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Tab navigation for brand profile.
 *
 * @example
 * <ProfileTabs
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   docsCount={3}
 * />
 */
export function ProfileTabs({ activeTab, onTabChange, docsCount }: ProfileTabsProps) {
  return (
    <div className="border-b border-border mb-6">
      <nav className="flex gap-6" aria-label="Tabs">
        <TabButton
          isActive={activeTab === 'overview'}
          onClick={() => onTabChange('overview')}
        >
          Overview
        </TabButton>
        <TabButton
          isActive={activeTab === 'docs'}
          onClick={() => onTabChange('docs')}
        >
          Docs
          {docsCount !== undefined && docsCount > 0 && (
            <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
              {docsCount}
            </span>
          )}
        </TabButton>
      </nav>
    </div>
  );
}

// ============================================================================
// TAB BUTTON
// ============================================================================

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ isActive, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative pb-3 text-sm font-medium transition-colors',
        isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
      {/* Active indicator */}
      {isActive && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );
}
