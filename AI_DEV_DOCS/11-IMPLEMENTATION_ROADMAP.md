# Implementation Roadmap

## Build Order

This is the recommended sequence for building The Clever Kit MVP. Each phase results in something testable.

---

## Phase 1: Foundation

**Goal**: Basic Next.js app with Supabase auth working.

### 1.1 Project Setup
- [ ] Create Next.js 14 app with App Router
- [ ] Install dependencies: `@supabase/ssr`, `@tanstack/react-query`, `tailwindcss`
- [ ] Set up Tailwind with custom colors (warm neutrals, orange primary)
- [ ] Install shadcn/ui, add: Button, Card, Input, Badge, Avatar, Dropdown Menu

### 1.2 Supabase Setup
- [ ] Create Supabase project
- [ ] Run database migrations (profiles, brands, analysis_runs tables)
- [ ] Enable Row Level Security policies
- [ ] Configure Auth (enable email magic link + Google OAuth)

### 1.3 Auth Flow
- [ ] Create `lib/supabase/client.ts`, `server.ts`, `middleware.ts`
- [ ] Build `/login` page (email input + Google button)
- [ ] Build `/signup` page (same UI, different copy)
- [ ] Set up auth callback route
- [ ] Create middleware for protected routes
- [ ] Test: Can sign up, log in, log out

### 1.4 Layout Shell
- [ ] Create `(dashboard)` layout with Header component
- [ ] Create UserMenu (avatar dropdown with logout)
- [ ] Create PageContainer component
- [ ] Build empty `/dashboard` page

**Checkpoint**: User can sign up, log in, see empty dashboard, log out.

---

## Phase 2: Brand Management

**Goal**: Users can add brands and see them listed.

### 2.1 Dashboard Page
- [ ] Create `useBrands` hook (TanStack Query)
- [ ] Build BrandEmptyState component
- [ ] Build BrandCard component
- [ ] Build BrandList component
- [ ] Dashboard shows empty state or brand list

### 2.2 Add Brand Flow
- [ ] Create `/brands/new` page
- [ ] Build AddBrandForm (URL input + checkbox)
- [ ] Create `POST /api/brands` route (creates brand record)
- [ ] Form submits, creates brand, redirects to brand page

### 2.3 Brand Profile Page (Shell)
- [ ] Create `/brands/[brandId]` page
- [ ] Create `useBrand` hook
- [ ] Build ProfileHeader component
- [ ] Show brand URL and "Pending analysis" state

**Checkpoint**: User can add a brand, see it in dashboard, view its profile page.

---

## Phase 3: Scraping

**Goal**: Brands get their homepage scraped when added.

### 3.1 Web Scraper
- [ ] Install `cheerio`
- [ ] Create `lib/scrapers/types.ts`
- [ ] Create `lib/scrapers/web-homepage/config.ts`
- [ ] Create `lib/scrapers/web-homepage/parser.ts` (HTML → text)
- [ ] Create `lib/scrapers/web-homepage/index.ts` (main scrape function)
- [ ] Create `lib/scrapers/index.ts` (registry)

### 3.2 Scrape API Route
- [ ] Create `POST /api/brands/[brandId]/scrape` route
- [ ] Route updates brand with scraped content
- [ ] Handle errors (timeout, blocked, empty)

### 3.3 Integrate Scraping
- [ ] After brand creation, trigger scrape
- [ ] Update brand profile to show scrape status
- [ ] Show error state if scrape failed

**Checkpoint**: Adding a brand scrapes the URL and stores content.

---

## Phase 4: Analyzers

**Goal**: Scraped content gets analyzed by three concurrent analyzers.

### 4.1 OpenAI Setup
- [ ] Install `openai`
- [ ] Create `lib/api/openai.ts` (callGPT, callGPTWithFunction)
- [ ] Test with simple prompt

### 4.2 Analyzer Framework
- [ ] Create `lib/analyzers/types.ts`
- [ ] Create `lib/analyzers/execution-plan.ts`
- [ ] Create `lib/analyzers/run-single.ts`
- [ ] Create `lib/analyzers/runner.ts`

### 4.3 Basics Analyzer
- [ ] Create `lib/analyzers/basics/config.ts`
- [ ] Create `lib/analyzers/basics/prompt.ts`
- [ ] Create `lib/analyzers/basics/parser.ts`
- [ ] Create `lib/analyzers/basics/types.ts`
- [ ] Test standalone

### 4.4 Customer Analyzer
- [ ] Create `lib/analyzers/customer/` (all 4 files)
- [ ] Test standalone

### 4.5 Products Analyzer
- [ ] Create `lib/analyzers/products/` (all 4 files)
- [ ] Test standalone

### 4.6 Analyzer Registry
- [ ] Create `lib/analyzers/index.ts`
- [ ] Wire up all three analyzers

### 4.7 Analysis API Route
- [ ] Create `POST /api/brands/[brandId]/analyze` route
- [ ] Creates analysis_run records
- [ ] Triggers runner (fire and forget)

### 4.8 Integrate Analysis
- [ ] After successful scrape, trigger analysis
- [ ] Test full flow: URL → scrape → analyze

**Checkpoint**: Adding a brand runs all three analyzers and stores results.

---

## Phase 5: Real-Time Progress

**Goal**: User sees live progress during analysis.

### 5.1 Supabase Realtime
- [ ] Enable Realtime on `analysis_runs` table
- [ ] Create `useRealtimeAnalysis` hook

### 5.2 Progress UI
- [ ] Create ProgressItem component (status icons, labels)
- [ ] Create ProgressList component
- [ ] Build progress page/view for `/brands/new`

### 5.3 Status Flow
- [ ] Show progress immediately after submitting URL
- [ ] Update each analyzer row as status changes
- [ ] Auto-redirect to profile when complete
- [ ] Handle partial failures gracefully

**Checkpoint**: User sees real-time progress with animated status indicators.

---

## Phase 6: Brand Profile Display

**Goal**: Analyzed data displays beautifully on brand profile.

### 6.1 Analyzer Cards
- [ ] Create AnalyzerCard base component
- [ ] Create Field component (label/value display)
- [ ] Build BasicsCard (renders ParsedBasics)
- [ ] Build CustomerCard (renders ParsedCustomer)
- [ ] Build ProductsCard (renders ParsedProducts)

### 6.2 Profile Page
- [ ] Integrate all three cards
- [ ] Show loading skeleton while fetching
- [ ] Show error states for failed analyzers

### 6.3 Coming Soon Section
- [ ] Create ComingSoon component
- [ ] Show teaser for future doc generation

**Checkpoint**: Brand profile shows all analyzed data in polished cards.

---

## Phase 7: Edit & Retry

**Goal**: Users can correct data and retry failed analyzers.

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

**Checkpoint**: Users can edit any field and retry failed analyzers.

---

## Phase 8: Polish

**Goal**: Delightful, production-ready experience.

### 8.1 Loading States
- [ ] Skeleton loaders for all data-fetching views
- [ ] Button loading states during mutations
- [ ] Page transitions

### 8.2 Error Handling
- [ ] Global error boundary
- [ ] Toast notifications for mutations
- [ ] User-friendly error messages everywhere

### 8.3 Empty States
- [ ] Polish dashboard empty state
- [ ] Empty state for 0 products in analyzer

### 8.4 Visual Polish
- [ ] Review all spacing/padding
- [ ] Ensure consistent typography
- [ ] Add subtle hover animations
- [ ] Review color contrast

### 8.5 Settings Page
- [ ] Create `/settings` page
- [ ] Display user email (read-only)
- [ ] Editable name field

**Checkpoint**: App feels polished, handles all edge cases gracefully.

---

## Phase 9: Deploy

**Goal**: Ship to production.

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

**Checkpoint**: MVP is live!

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

### Phase 12: Document Generation
- Brand Brief generator
- Customer Persona generator
- Content Pillars generator

### Phase 13: Enhanced Input
- Chat interface for adding brand info
- Voice input support
- File upload (brand assets)

### Phase 14: Collaboration
- Team workspaces
- Invite team members
- Role-based permissions

---

## Estimated Timeline

| Phase | Effort | Cumulative |
|-------|--------|------------|
| 1. Foundation | 1-2 days | 2 days |
| 2. Brand Management | 1 day | 3 days |
| 3. Scraping | 1 day | 4 days |
| 4. Analyzers | 2 days | 6 days |
| 5. Real-Time Progress | 1 day | 7 days |
| 6. Brand Profile Display | 1 day | 8 days |
| 7. Edit & Retry | 1 day | 9 days |
| 8. Polish | 1-2 days | 11 days |
| 9. Deploy | 0.5 day | 11.5 days |

**Total: ~2 weeks for focused development**

---

## Definition of Done (MVP)

- [ ] User can sign up and log in
- [ ] User can add their own brand via URL
- [ ] User can add brands they manage via URL
- [ ] Scraping completes within 15 seconds
- [ ] All three analyzers run concurrently
- [ ] Analysis completes within 90 seconds
- [ ] User sees real-time progress
- [ ] Brand profile displays all analyzed data
- [ ] User can edit any analyzed field
- [ ] User can retry failed analyzers
- [ ] User can re-analyze a brand
- [ ] App handles errors gracefully
- [ ] UI feels polished and professional
