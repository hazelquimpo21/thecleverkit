# Data Model

> **Updated December 19, 2025**: Added generated_docs table for docs feature.

## Overview

Four core tables, designed for simplicity now and flexibility later.

```
users (managed by Supabase Auth)
  │
  └── brands (1:many)
        │
        ├── scraped_sources (JSONB array - future multi-source)
        │
        ├── analysis_runs (1:many)
        │     │
        │     └── parsed_data (JSONB - analyzer-specific)
        │
        └── generated_docs (1:many)
              │
              ├── content (TEXT - markdown)
              └── source_data (JSONB - snapshot of brand data used)
```

## Tables

### users

Managed by Supabase Auth. We extend with a `profiles` table for app-specific data.

```sql
-- profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### brands

The core entity. One brand = one business being analyzed.

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT,                          -- May be null until basics analyzer runs
  source_url TEXT NOT NULL,           -- The URL they provided
  is_own_brand BOOLEAN DEFAULT FALSE, -- Distinguishes "your brand" from managed brands
  
  -- Scraped content (MVP: single source)
  scraped_content TEXT,               -- Raw text from scrape
  scraped_at TIMESTAMPTZ,
  scrape_status TEXT DEFAULT 'pending', -- pending, scraping, complete, failed
  scrape_error TEXT,                  -- Error message if failed
  
  -- Future: multiple sources
  -- scraped_sources JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user's brands list
CREATE INDEX idx_brands_user_id ON brands(user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### analysis_runs

One record per analyzer per brand. Tracks status and stores results.

```sql
-- Enum for analyzer types (add more as we build them)
CREATE TYPE analyzer_type AS ENUM (
  'basics',
  'customer',
  'products'
  -- Future: 'competitors', 'tone_of_voice', 'visual_identity'
);

-- Enum for run status
CREATE TYPE analysis_status AS ENUM (
  'queued',
  'analyzing',
  'parsing',
  'complete',
  'error'
);

CREATE TABLE analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  
  -- What analyzer and its status
  analyzer_type analyzer_type NOT NULL,
  status analysis_status DEFAULT 'queued',
  
  -- Results
  raw_analysis TEXT,                  -- The natural language analysis (step 1)
  parsed_data JSONB,                  -- The structured output (step 2)
  
  -- Error tracking
  error_message TEXT,
  retry_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- One run per analyzer per brand (can re-run by deleting old)
  UNIQUE(brand_id, analyzer_type)
);

-- Index for fetching all runs for a brand
CREATE INDEX idx_analysis_runs_brand_id ON analysis_runs(brand_id);

-- Index for finding incomplete runs (for resume/retry logic)
CREATE INDEX idx_analysis_runs_status ON analysis_runs(status) 
  WHERE status NOT IN ('complete', 'error');
```

## Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Brands: users can only access their own brands
CREATE POLICY "Users can view own brands"
  ON brands FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own brands"
  ON brands FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own brands"
  ON brands FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own brands"
  ON brands FOR DELETE
  USING (auth.uid() = user_id);

-- Analysis runs: access through brand ownership
CREATE POLICY "Users can view own analysis runs"
  ON analysis_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brands 
      WHERE brands.id = analysis_runs.brand_id 
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own analysis runs"
  ON analysis_runs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brands 
      WHERE brands.id = analysis_runs.brand_id 
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own analysis runs"
  ON analysis_runs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM brands 
      WHERE brands.id = analysis_runs.brand_id 
      AND brands.user_id = auth.uid()
    )
  );
```

## TypeScript Types

```typescript
// types/database.ts

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Brand = {
  id: string;
  user_id: string;
  name: string | null;
  source_url: string;
  is_own_brand: boolean;
  scraped_content: string | null;
  scraped_at: string | null;
  scrape_status: 'pending' | 'scraping' | 'complete' | 'failed';
  scrape_error: string | null;
  created_at: string;
  updated_at: string;
};

export type AnalyzerType = 'basics' | 'customer' | 'products';

export type AnalysisStatus = 'queued' | 'analyzing' | 'parsing' | 'complete' | 'error';

export type AnalysisRun = {
  id: string;
  brand_id: string;
  analyzer_type: AnalyzerType;
  status: AnalysisStatus;
  raw_analysis: string | null;
  parsed_data: Record<string, unknown> | null;
  error_message: string | null;
  retry_count: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

// Joined type for brand with its analysis runs
export type BrandWithAnalyses = Brand & {
  analysis_runs: AnalysisRun[];
};
```

## Parsed Data Shapes

Each analyzer produces a specific shape. These are stored in `parsed_data` JSONB.

```typescript
// types/analyzers.ts

export type ParsedBasics = {
  business_name: string;
  founder_name: string | null;
  founded_year: string | null;
  industry: string;
  business_description: string;
  business_model: string;
};

export type ParsedCustomer = {
  subcultures: string[];
  primary_problem: string;
  secondary_problems: string[];
  customer_sophistication: 'Beginner' | 'Informed' | 'Expert';
  buying_motivation: 'Pain relief' | 'Aspiration' | 'Necessity' | 'Curiosity' | 'Status';
};

export type ProductOffering = {
  name: string;
  description: string;
  price: string | null;
  pricing_model: 'One-time' | 'Subscription' | 'Retainer' | 'Project-based' | 'Custom/Contact' | 'Free' | 'Freemium' | 'Unknown';
};

export type ParsedProducts = {
  offering_type: 'Products' | 'Services' | 'Both' | 'Unclear';
  offerings: ProductOffering[];
  primary_offer: string;
  price_positioning: 'Budget' | 'Mid-market' | 'Premium' | 'Luxury' | 'Unclear';
};

// Union type for any parsed data
export type ParsedAnalyzerData = ParsedBasics | ParsedCustomer | ParsedProducts;
```

## Future Schema Extensions

### Multiple Scraped Sources

When we add LinkedIn, social, etc:

```sql
-- Replace single scraped_content with array
ALTER TABLE brands ADD COLUMN scraped_sources JSONB DEFAULT '[]';

-- Each source looks like:
-- {
--   "source_type": "web_homepage",
--   "source_url": "https://example.com",
--   "content": "...",
--   "scraped_at": "2024-01-15T..."
-- }
```

### Generated Documents

```sql
-- Note: Using TEXT for template_id instead of ENUM for flexibility
-- (easier to add new templates without migrations)

CREATE TABLE generated_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,

  -- Template identification
  template_id TEXT NOT NULL,          -- e.g., 'golden-circle', 'brand-brief'
  title TEXT NOT NULL,                 -- Display title for the doc

  -- Content
  content JSONB NOT NULL,              -- Structured content from parser
  content_markdown TEXT,               -- Rendered markdown (for export)

  -- Snapshot of data used for generation
  source_data JSONB NOT NULL,          -- Copy of brand/analyzer data at generation time

  -- Status tracking
  status TEXT DEFAULT 'complete',      -- 'generating', 'complete', 'error'
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fetching all docs for a brand
CREATE INDEX idx_generated_docs_brand_id ON generated_docs(brand_id);

-- Index for finding docs by template
CREATE INDEX idx_generated_docs_template ON generated_docs(template_id);

-- RLS policy (access through brand ownership)
ALTER TABLE generated_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generated docs"
  ON generated_docs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = generated_docs.brand_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own generated docs"
  ON generated_docs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = generated_docs.brand_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own generated docs"
  ON generated_docs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = generated_docs.brand_id
      AND brands.user_id = auth.uid()
    )
  );
```

**TypeScript type:**

```typescript
// types/docs.ts

export type GeneratedDoc = {
  id: string;
  brand_id: string;
  template_id: string;
  title: string;
  content: Record<string, unknown>;  // Structured content
  content_markdown: string | null;
  source_data: Record<string, unknown>;
  status: 'generating' | 'complete' | 'error';
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

// Joined type for brand with docs
export type BrandWithDocs = Brand & {
  generated_docs: GeneratedDoc[];
};
```

**Design decisions:**
- `template_id` is TEXT (not enum) for easy addition of new templates
- `content` is JSONB for structured data, `content_markdown` for export
- `source_data` captures the brand data snapshot at generation time
- Can regenerate docs and compare what changed

### Team Collaboration

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  PRIMARY KEY (team_id, user_id)
);

-- Add team_id to brands
ALTER TABLE brands ADD COLUMN team_id UUID REFERENCES teams(id);
```
