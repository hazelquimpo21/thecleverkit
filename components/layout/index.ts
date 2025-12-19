/**
 * LAYOUT COMPONENTS INDEX
 * ========================
 * Exports all layout-related components.
 *
 * @update 2025-12-19 - Added sidebar components for redesign
 */

// App shell (main layout wrapper)
export { AppShell, type AppShellProps } from './app-shell';

// Page components
export { PageContainer } from './page-container';
export { PageHeader, type PageHeaderProps, type PageHeaderTab, type PageHeaderBackLink } from './page-header';

// Legacy header (kept for reference, being replaced by sidebar)
export { Header } from './header';

// Sidebar components
export {
  Sidebar,
  SidebarNavItem,
  SidebarBrandItem,
  SidebarSection,
  SidebarUserMenu,
  type SidebarProps,
  type SidebarNavItemProps,
  type SidebarBrandItemProps,
  type SidebarSectionProps,
  type SidebarUserMenuProps,
} from './sidebar';
