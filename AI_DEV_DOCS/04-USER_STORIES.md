# User Stories

## Epic: Authentication

### US-001: Sign Up

**As a** new user  
**I want to** create an account  
**So that** I can save my brands and analysis data

**Acceptance Criteria:**
- [ ] User can sign up with email (magic link)
- [ ] User can sign up with Google OAuth
- [ ] After signup, user is redirected to dashboard
- [ ] Profile record is auto-created
- [ ] Error states: email taken, invalid email, OAuth failure

**UI Notes:**
- Clean, minimal form
- Single input for email with "Continue" button
- "Or continue with Google" below
- No password field (magic link only for MVP)

---

### US-002: Log In

**As a** returning user  
**I want to** log into my account  
**So that** I can access my brands

**Acceptance Criteria:**
- [ ] User can log in with magic link
- [ ] User can log in with Google
- [ ] After login, redirect to dashboard
- [ ] Error states: email not found (offer signup), expired link

---

### US-003: Log Out

**As a** logged-in user  
**I want to** log out  
**So that** I can secure my account

**Acceptance Criteria:**
- [ ] Logout option in user menu (avatar dropdown)
- [ ] Clears session and redirects to login
- [ ] Works from any page

---

### US-004: Auth-Gated Brand Analysis ✅ IMPLEMENTED

**As a** visitor trying to analyze a brand without logging in
**I want to** have my intended URL preserved across the login flow
**So that** I don't have to re-enter it after signing in

**Acceptance Criteria:**
- [x] Form accepts URL input from unauthenticated users
- [x] Clicking "Analyze Brand" saves URL to localStorage
- [x] User is redirected to login with intent=analyze parameter
- [x] Login page shows intent-aware message ("Sign in to continue analyzing [URL]")
- [x] After login, user lands on /analyze continuation page
- [x] Continuation page shows saved URL with confirm/edit/cancel options
- [x] Confirming starts the analysis and clears saved intent
- [x] Intent expires after 30 minutes for security
- [x] Graceful fallback if localStorage unavailable

**UI Notes:**
- Subtle hint on form: "You'll sign in after clicking to save your analysis"
- Login page shows the URL being analyzed
- Continuation page has prominent "Start Analysis" button
- User can edit URL or cancel before starting

**Implementation Files:**
- `lib/utils/auth-intent.ts` - localStorage utilities
- `hooks/use-auth-gate.ts` - auth gating hook
- `app/analyze/` - continuation page
- `app/login/login-page-content.tsx` - intent-aware login UI

---

## Epic: Brand Management

### US-010: View Dashboard (Empty State)

**As a** new user with no brands  
**I want to** see a welcoming empty state  
**So that** I know how to get started

**Acceptance Criteria:**
- [ ] Shows friendly illustration or icon
- [ ] Clear headline: "Welcome to The Clever Kit"
- [ ] Explains the value prop briefly
- [ ] Single prominent CTA: "Add Your Brand"
- [ ] Feels warm and inviting, not empty/broken

---

### US-011: View Dashboard (With Brands)

**As a** user with brands  
**I want to** see all my brands at a glance  
**So that** I can navigate to any of them

**Acceptance Criteria:**
- [ ] "Your Brand" section at top (if is_own_brand exists)
- [ ] "Brands You Manage" section below with count
- [ ] Each brand shows: name (or "Untitled"), URL, status indicator
- [ ] Status indicators: Complete ✓, Analyzing ◐, Failed ✗
- [ ] Clicking a brand goes to its profile page
- [ ] "Add Brand" button always visible

**UI Notes:**
- Card-based layout
- Own brand gets subtle visual distinction (star icon or border)
- Brands sorted by most recently updated

---

### US-012: Add a Brand

**As a** user  
**I want to** add a new brand by URL  
**So that** I can analyze it

**Acceptance Criteria:**
- [ ] Form with URL input field
- [ ] Checkbox: "This is my own brand"
- [ ] Validation: must be valid URL format
- [ ] Submit creates brand record and starts scraping
- [ ] User sees progress UI immediately (no waiting on response)

**UI Notes:**
- URL input with placeholder "https://..."
- Help text: "We'll scan the homepage and learn about the brand"
- Button: "Analyze This Site →"

---

### US-013: Watch Analysis Progress

**As a** user who just added a brand  
**I want to** see real-time progress  
**So that** I know it's working and how long to wait

**Acceptance Criteria:**
- [ ] Shows list of steps with status icons:
  - Scraping website
  - Basics (analyzing → parsing → complete)
  - Customer Profile (analyzing → parsing → complete)
  - Products & Pricing (analyzing → parsing → complete)
- [ ] Status updates in real-time (no refresh needed)
- [ ] When all complete, auto-navigate to brand profile (or show "View Brand" button)
- [ ] If scrape fails, show error with retry option

**UI Notes:**
- Progress items have subtle animation when "in progress"
- Completed items get checkmark
- "Usually takes 30-60 seconds" helper text
- Consider a gentle pulsing effect, not a spinner

---

### US-014: View Brand Profile

**As a** user  
**I want to** see all analyzed data for a brand  
**So that** I can understand the brand and use the intelligence

**Acceptance Criteria:**
- [ ] Header: Brand name, URL, date added
- [ ] Three analyzer cards (Basics, Customer, Products)
- [ ] Each card shows parsed fields in readable format
- [ ] Edit button on each card
- [ ] Re-analyze button in header
- [ ] Back link to dashboard

**UI Notes:**
- Cards have clear section headers
- Data fields use label: value format
- Arrays (like subcultures) show as tags or comma list
- Products show as nested list/table

---

### US-015: View Analyzer Error State

**As a** user  
**I want to** see which analyzers failed and why  
**So that** I can decide whether to retry or enter data manually

**Acceptance Criteria:**
- [ ] Failed analyzer card shows error state (not empty)
- [ ] Brief, human-friendly error message
- [ ] "Retry" button to re-run that analyzer
- [ ] "Enter Manually" option to fill in fields
- [ ] Successful analyzers still display normally

---

### US-016: Edit Analyzed Data

**As a** user  
**I want to** correct or add to AI-extracted data  
**So that** I have accurate brand information

**Acceptance Criteria:**
- [ ] Each analyzer card has "Edit" button
- [ ] Edit mode shows form fields for all parsed fields
- [ ] Pre-populated with current values
- [ ] Save updates the parsed_data in database
- [ ] Cancel discards changes
- [ ] Works for all three analyzer types

**UI Notes:**
- Inline edit (card expands to form) or slide-over panel
- Clear Save/Cancel buttons
- No auto-save (explicit action required)

---

### US-017: Re-Analyze a Brand

**As a** user  
**I want to** re-run analysis on a brand  
**So that** I can get fresh data if the website changed

**Acceptance Criteria:**
- [ ] "Re-analyze" button in brand profile header
- [ ] Confirmation: "This will re-scrape and re-analyze. Continue?"
- [ ] Re-scrapes the URL
- [ ] Re-runs all analyzers
- [ ] Shows progress UI (same as initial analysis)
- [ ] Overwrites previous parsed_data

---

### US-018: Delete a Brand

**As a** user  
**I want to** delete a brand I no longer need  
**So that** my dashboard stays clean

**Acceptance Criteria:**
- [ ] Delete option in brand profile (maybe in menu/dropdown)
- [ ] Confirmation dialog: "Delete [Brand Name]? This can't be undone."
- [ ] Deletes brand and all analysis_runs
- [ ] Redirects to dashboard

---

## Epic: User Account

### US-030: View/Edit Profile

**As a** user  
**I want to** update my name and see my account info  
**So that** I can personalize my experience

**Acceptance Criteria:**
- [ ] Settings page accessible from avatar menu
- [ ] Shows email (read-only)
- [ ] Editable: full name
- [ ] Save button
- [ ] Success feedback on save

---

## Future Epics (Not MVP)

### Document Generation
- US-050: Generate Brand Brief from analyzed data
- US-051: Generate Customer Persona document
- US-052: Generate Content Pillars

### Additional Scrapers
- US-060: Add LinkedIn company URL as source
- US-061: Add social profile URLs as sources
- US-062: Web search to find additional brand info

### Additional Analyzers
- US-070: Competitors analyzer
- US-071: Tone of Voice analyzer
- US-072: Visual Identity analyzer

### Collaboration
- US-080: Invite team members
- US-081: Share brand with team
- US-082: Role-based permissions

---

## User Flow Diagrams

### New User First Brand Flow (Starting from Home Page) ✅ IMPLEMENTED
```
Home Page (not logged in)
    │
    ▼
Enter URL in form, click "Analyze Brand"
    │
    ▼
URL saved to localStorage
    │
    ▼
Redirect to /login?intent=analyze
    │
    ▼
Login page shows: "Sign in to continue analyzing [URL]"
    │
    ▼
Sign in via magic link
    │
    ▼
Redirect to /analyze (continuation page)
    │
    ▼
See saved URL, click "Start Analysis"
    │
    ▼
Brand Profile (analysis in progress)
```

### New User First Brand Flow (Starting from Login)
```
Landing/Login
    │
    ▼
Sign Up (email or Google)
    │
    ▼
Dashboard (empty state)
    │
    ▼
Click "Add Your Brand"
    │
    ▼
Enter URL + check "This is my own brand"
    │
    ▼
Analysis Progress Screen
    │
    ▼
Brand Profile (complete)
```

### Returning User Adds Client Brand Flow
```
Dashboard (has brands)
    │
    ▼
Click "Add Brand"
    │
    ▼
Enter URL (don't check "own brand")
    │
    ▼
Analysis Progress Screen
    │
    ▼
Brand Profile (complete)
    │
    ▼
Dashboard (shows new brand in "Brands You Manage")
```

### Edit Flow
```
Brand Profile
    │
    ▼
Click "Edit" on a card
    │
    ▼
Edit Mode (form fields)
    │
    ▼
Make changes → Save
    │
    ▼
Brand Profile (updated)
```
