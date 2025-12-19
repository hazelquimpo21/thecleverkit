# Implementation Roadmap

> **STATUS UPDATE (December 19, 2025)**: Phases 1-6 complete + Dashboard. Major UI redesign planned (see Phase 17). Build passes. See `00-SESSION_NOTES.md` for implementation details and gotchas.

---

## 🎨 MAJOR REDESIGN PLANNED

A significant UI redesign is planned with a 1960s science textbook aesthetic. See:
- `15-REDESIGN-VISION.md` — Complete design philosophy and specs
- `16-REDESIGN-TASKS.md` — Implementation task breakdown
- `17-TEMPLATE-STORE.md` — Template store feature spec

**Phase 17** below contains the redesign implementation plan.

---

## Build Order

This is the recommended sequence for building The Clever Kit MVP. Each phase results in something testable.

---

## Phase 1: Foundation

**Goal**: Basic Next.js app with Supabase auth working.

**STATUS: ✅ COMPLETE** (Auth UI with magic links implemented)

### 1.1 Project Setup
- [x] Create Next.js 14 app with App Router
- [x] Install dependencies: `@supabase/ssr`, `tailwindcss`
- [x] Set up Tailwind with custom colors (warm neutrals, orange primary)
- [x] Add UI components: Button, Card, Input, Badge, Skeleton
- [x] Install shadcn/ui full suite (components use semantic CSS variables)
- [x] Install `@tanstack/react-query` (provider + hooks wired up)

### 1.2 Supabase Setup
- [x] Database schema created (see `supabase/schema.sql`)
- [x] Row Level Security policies defined
- [ ] Create Supabase project (user needs to do this)
- [ ] Run migrations in Supabase SQL Editor
- [ ] Configure Auth providers

### 1.3 Auth Flow
- [x] Create `lib/supabase/client.ts`, `server.ts`
- [x] Auth callback route (`/api/auth/callback`)
- [x] Build `/login` page (magic link authentication)
- [x] Create `useAuth` hook for user state management
- [x] Create middleware for protected routes
- [x] Test: Can sign in via magic link, log out

### 1.4 Auth-Gated Analysis Flow ✅ NEW
- [x] Create `lib/utils/auth-intent.ts` (save/load/clear intent)
- [x] Create `hooks/use-auth-gate.ts` (gate actions behind auth)
- [x] Update AddBrandForm to use auth gating
- [x] Create `/analyze` continuation page
- [x] Create intent-aware login UI (`login-page-content.tsx`)
- [x] Add `/analyze` to protected routes in middleware

### 1.5 Layout Shell
- [x] Create root layout with Header component
- [x] Create PageContainer component
- [x] Build home page with add brand form
- [x] Create UserMenu (shows user email + sign out)
- [x] Build `/dashboard` page

**Checkpoint**: ✅ Auth complete. Users can sign in with magic link, protected routes work. Unauthenticated users trying to analyze get a smooth redirect flow that preserves their URL.

---

## Phase 2: Brand Management

**Goal**: Users can add brands and see them listed.

**STATUS: ✅ COMPLETE**

### 2.1 Dashboard Page
- [x] Create `useBrands` hook (TanStack Query)
- [x] Build BrandEmptyState component
- [x] Build BrandCard component
- [x] Build BrandList component (integrated in dashboard-content.tsx)
- [x] Dashboard shows empty state or brand list
- [x] Header navigation with "My Brands" and "Add Brand" links
- [x] Delete brand with confirmation dialog

### 2.2 Add Brand Flow
- [x] Build AddBrandForm (URL input + checkbox)
- [x] Create analysis API route (creates brand + triggers analysis)
- [x] Form submits, creates brand, redirects to brand page

### 2.3 Brand Profile Page (Shell)
- [x] Create `/brands/[brandId]` page
- [x] Build ProfileHeader component
- [x] Show brand URL and analysis status
- [x] Create `useBrand` hook (TanStack Query)
- [x] Back link to dashboard

**Checkpoint**: ✅ Full brand management flow working. Dashboard shows all brands with status.

---

## Phase 3: Scraping

**Goal**: Brands get their homepage scraped when added.

**STATUS: ✅ COMPLETE**

### 3.1 Web Scraper
- [x] Install `cheerio`
- [x] Create `lib/scrapers/types.ts`
- [x] Create `lib/scrapers/web-homepage/config.ts`
- [x] Create `lib/scrapers/web-homepage/parser.ts` (HTML → text)
- [x] Create `lib/scrapers/web-homepage/index.ts` (main scrape function)
- [x] Create `lib/scrapers/index.ts` (registry)

### 3.2 Scrape Integration
- [x] Scraping integrated into brand creation flow
- [x] Brand updated with scraped content
- [x] Error handling (timeout, blocked, empty)

**Checkpoint**: ✅ Adding a brand scrapes the URL and stores content.

---

## Phase 4: Analyzers

**Goal**: Scraped content gets analyzed by three concurrent analyzers.

**STATUS: ✅ COMPLETE**

### 4.1 OpenAI Setup
- [x] Install `openai`
- [x] Create `lib/api/openai.ts` (`analyzeWithGPT`, `parseWithGPT`)
- [x] Two-step analysis pattern implemented

### 4.2 Analyzer Framework
- [x] Create `lib/analyzers/types.ts`
- [x] Create `lib/analyzers/runner.ts` (orchestration + execution)
- [x] Dependency-based execution support

### 4.3 Basics Analyzer
- [x] Create `lib/analyzers/basics/config.ts`
- [x] Create `lib/analyzers/basics/prompt.ts`
- [x] Create `lib/analyzers/basics/parser.ts`
- [x] Create `lib/analyzers/basics/types.ts`

### 4.4 Customer Analyzer
- [x] Create `lib/analyzers/customer/` (all 5 files)

### 4.5 Products Analyzer
- [x] Create `lib/analyzers/products/` (all 5 files)

### 4.6 Analyzer Registry
- [x] Create `lib/analyzers/index.ts`
- [x] Wire up all three analyzers

### 4.7 Analysis API Route
- [x] Create `POST /api/brands/analyze` route
- [x] Creates brand + analysis_run records
- [x] Triggers concurrent analyzers

**Checkpoint**: ✅ Adding a brand runs all three analyzers and stores results.

---

## Phase 5: Real-Time Progress

**Goal**: User sees live progress during analysis.

**STATUS: ✅ COMPLETE**

### 5.1 Supabase Realtime
- [x] Enable Realtime on `analysis_runs` table (in schema)
- [x] Create `useRealtimeAnalysis` hook (with fallback polling)
- [x] Create `useBrandAnalysis` hook (state management)

### 5.2 Progress UI
- [x] Create ProgressList component
- [x] Status icons and labels
- [x] Live subscription to status changes
- [x] Completion celebration toast
- [x] Connection status indicator

### 5.3 Client/Server Split
- [x] BrandHeader component (server)
- [x] BrandAnalysisContent component (client with realtime)
- [x] Server fetches initial data, client subscribes to updates

**Checkpoint**: ✅ Analysis progress updates automatically. User sees live status changes.

---

## Phase 6: Brand Profile Display

**Goal**: Analyzed data displays beautifully on brand profile.

**STATUS: ✅ COMPLETE**

### 6.1 Analyzer Cards
- [x] Build BasicsCard (renders ParsedBasics)
- [x] Build CustomerCard (renders ParsedCustomer)
- [x] Build ProductsCard (renders ParsedProducts)
- [x] Skeleton loading states

### 6.2 Profile Page
- [x] Integrate all three cards
- [x] Show loading skeleton while fetching
- [x] Show error states for failed analyzers

**Checkpoint**: ✅ Brand profile shows all analyzed data in polished cards.

---

## Phase 7: Edit & Retry

**Goal**: Users can correct data and retry failed analyzers.

**STATUS: ❌ NOT STARTED**

### 7.1 Edit Forms
- [ ] Create BasicsForm component
- [ ] Create CustomerForm component
- [ ] Create ProductsForm component
- [ ] Wire up edit buttons to open forms

### 7.2 Save Edits
- [ ] Create `PATCH /api/brands/[brandId]/analysis` route
- [ ] Update parsed_data in database
- [ ] Optimistic UI updates

### 7.3 Retry Logic
- [ ] Create `POST /api/brands/[brandId]/retry` route
- [ ] Retry button on failed analyzer cards
- [ ] Re-runs single analyzer

### 7.4 Re-Analyze
- [ ] Add "Re-analyze" button to profile header
- [ ] Confirmation dialog
- [ ] Re-scrapes and re-runs all analyzers

**Checkpoint**: ❌ Not yet implemented.

---

## Phase 8: Polish

**Goal**: Delightful, production-ready experience.

**STATUS: 🔶 PARTIAL**

### 8.1 Loading States
- [x] Skeleton loaders for data-fetching views
- [ ] Button loading states during mutations
- [ ] Page transitions

### 8.2 Error Handling
- [x] Error states in UI components
- [ ] Global error boundary
- [x] Toast notifications for mutations (Sonner installed + React Query integration)
- [ ] User-friendly error messages everywhere

### 8.3 Empty States
- [ ] Polish dashboard empty state
- [ ] Empty state for 0 products in analyzer

### 8.4 Visual Polish
- [x] Consistent spacing/padding
- [x] Clean typography
- [ ] Subtle hover animations
- [ ] Review color contrast

### 8.5 Settings Page
- [ ] Create `/settings` page
- [ ] Display user email (read-only)
- [ ] Editable name field

**Checkpoint**: ⚠️ Basic polish done, needs full pass.

---

## Phase 9: Deploy

**Goal**: Ship to production.

**STATUS: ❌ NOT STARTED** (Build passes, not deployed)

### 9.1 Environment
- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Connect to Supabase production

### 9.2 Testing
- [ ] Full flow test on preview deploy
- [ ] Test with multiple accounts
- [ ] Test error scenarios

### 9.3 Launch
- [ ] Deploy to production
- [ ] Verify auth flows work
- [ ] Monitor for errors

**Checkpoint**: ❌ Not yet deployed.

---

## Future Phases (Post-MVP)

### Phase 10: Additional Scrapers
- LinkedIn company scraper
- Social profile aggregation
- Google search for brand mentions

### Phase 11: Additional Analyzers
- Competitors analyzer
- Tone of Voice analyzer
- Visual Identity analyzer

### Phase 12: Document Generation (In Planning)

**See `12-DOCS_FEATURE.md` for full implementation plan.**

**Goal**: Generate useful documents from brand intelligence.

#### 12.1 Foundation
- [ ] Create `generated_docs` table in Supabase
- [ ] Create `lib/docs/types.ts` (DocTemplate, GeneratedDoc types)
- [ ] Create `lib/docs/registry.ts` (template registry)
- [ ] Create `lib/docs/generator.ts` (orchestrates generation)
- [ ] Create `lib/docs/readiness.ts` (data sufficiency checks)

#### 12.2 Golden Circle Template
- [ ] Create `lib/docs/templates/golden-circle/` folder
- [ ] Implement config (required analyzers: basics, customer)
- [ ] Implement prompt (generates Why/How/What)
- [ ] Implement parser (structured output)
- [ ] Test generation end-to-end

#### 12.3 UI Components
- [ ] Create DocTemplateCard component
- [ ] Create DocTemplateGrid component
- [ ] Create DocList + DocListItem components
- [ ] Create DocViewer component
- [ ] Create ReadinessBadge component
- [ ] Create MissingDataDialog component

#### 12.4 Brand Profile Integration
- [ ] Add tabs to brand profile (Overview / Docs)
- [ ] Build Docs tab content
- [ ] Wire up generation flow
- [ ] Test full user flow

#### 12.5 Export
- [ ] Copy to clipboard (markdown)
- [ ] PDF export (using react-pdf or similar)

#### 12.6 Additional Templates (Future)
- [ ] Brand Brief template
- [ ] Customer Persona template
- [ ] Content Pillars template

### Phase 13: Google Docs Export

**See `13-GOOGLE_DOCS_EXPORT.md` and `14-GOOGLE_CLOUD_SETUP.md` for full details.**

**Goal**: Users can export generated docs directly to Google Docs.

#### 13.1 Google Cloud Setup
- [ ] Create Google Cloud project
- [ ] Enable Google Docs API + Google Drive API
- [ ] Configure OAuth consent screen
- [ ] Create OAuth credentials (Web application)
- [ ] Add environment variables

#### 13.2 Database & Types
- [ ] Add google columns to profiles table (refresh_token, email, connected_at)
- [ ] Add google columns to generated_docs table (doc_id, doc_url, exported_at)
- [ ] Update TypeScript types

#### 13.3 OAuth Integration
- [ ] Create `lib/integrations/google/` module
- [ ] Create `POST /api/integrations/google/auth` (initiate OAuth)
- [ ] Create `GET /api/integrations/google/callback` (handle callback)
- [ ] Create `POST /api/integrations/google/disconnect`
- [ ] Token refresh logic

#### 13.4 Export Flow
- [ ] Create `POST /api/export/google-docs` route
- [ ] Create `hooks/use-google-integration.ts`
- [ ] Update `doc-export-menu.tsx` with Google Docs option

#### 13.5 UI Components
- [ ] Create `components/integrations/google-connect-modal.tsx`
- [ ] Update `doc-list-item.tsx` to show Google Docs link
- [ ] Add Connected Apps section to settings page

### Phase 14: Additional Export Integrations (Future)
- Google Slides export
- Notion export
- Dropbox export

### Phase 15: Enhanced Input
- Chat interface for adding brand info
- Voice input support
- File upload (brand assets)

### Phase 16: Collaboration
- Team workspaces
- Invite team members
- Role-based permissions

### Phase 17: UI Redesign 🎨

**See `15-REDESIGN-VISION.md`, `16-REDESIGN-TASKS.md`, and `17-TEMPLATE-STORE.md` for full details.**

**Goal**: Transform the UI into a delightful, human-centered experience with 1960s science textbook aesthetic.

**STATUS: 📋 PLANNING COMPLETE**

#### 17.1 Design System Foundation
- [ ] Update global CSS variables with new color palette
- [ ] Add warm-tinted shadow utilities
- [ ] Update Tailwind config with semantic colors
- [ ] Update border radius scale

#### 17.2 Navigation Restructure
- [ ] Create Sidebar component (260px left navigation)
- [ ] Create SidebarNavItem component
- [ ] Create SidebarBrandItem component
- [ ] Update root layout to use sidebar
- [ ] Remove/refactor top Header
- [ ] Create PageHeader component for page titles

#### 17.3 Card & Component Styling
- [ ] Update Card component (shadow-based, no border)
- [ ] Create color-coded AnalyzerCard variants (sage/rose/mustard)
- [ ] Update Button component variants
- [ ] Update Badge component with semantic variants
- [ ] Update Input component styling

#### 17.4 Page Updates
- [ ] Update Dashboard page layout
- [ ] Create warm empty state design
- [ ] Update Brand Profile page with new tabs (Overview/Documents/Store)
- [ ] Update Analysis Progress visualization
- [ ] Update Home page styling
- [ ] Update Login page styling

#### 17.5 Template Store Feature
- [ ] Create StoreTabContent component
- [ ] Create TemplateGalleryCard component
- [ ] Create TemplateIllustration components (CSS/SVG)
- [ ] Create template category sections
- [ ] Implement generation history display
- [ ] Create "Coming Soon" template state

#### 17.6 Polish & Micro-interactions
- [ ] Add hover transitions to all interactive elements
- [ ] Update skeleton loading states
- [ ] Update toast styling for warm palette
- [ ] Ensure all focus states use primary ring
- [ ] Create reusable EmptyState component
- [ ] Create reusable ErrorState component

**Checkpoint**: ❌ Not started. Planning complete.

---

## Estimated Timeline (Remaining Work)

| Phase | Status | Remaining Effort |
|-------|--------|------------------|
| 1. Foundation | ✅ Complete | - |
| 2. Brand Management | ✅ Complete | - |
| 3. Scraping | ✅ Complete | - |
| 4. Analyzers | ✅ Complete | - |
| 5. Real-Time Progress | ✅ Complete | - |
| 6. Brand Profile Display | ✅ Complete | - |
| 7. Edit & Retry | ❌ Not started | ~1 day |
| 8. Polish | 🔶 Partial | ~0.5 day |
| 9. Deploy | ❌ Not started | ~0.5 day |
| 12. Docs Feature | ✅ Complete | - |
| 17. UI Redesign | 📋 Planning | ~3-5 days |

**Remaining for MVP: ~2 days**
**Remaining for UI Redesign: ~3-5 days**

---

## Definition of Done (MVP)

- [x] User can sign up and log in (via magic link)
- [x] User can add brands via URL
- [x] Unauthenticated users get smooth redirect flow (URL preserved)
- [x] Scraping completes within 15 seconds
- [x] All three analyzers run concurrently
- [x] Analysis completes within 90 seconds
- [x] User sees real-time progress (auto-refreshing UI)
- [x] Brand profile displays all analyzed data
- [ ] User can edit any analyzed field
- [ ] User can retry failed analyzers
- [ ] User can re-analyze a brand
- [x] App handles errors gracefully
- [x] UI feels polished and professional
