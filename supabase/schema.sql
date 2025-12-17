-- ============================================================================
-- THE CLEVER KIT - DATABASE SCHEMA
-- ============================================================================
-- Run this in your Supabase SQL Editor to set up the database.
-- This creates all tables, indexes, triggers, and Row Level Security policies.
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- SECTION 2: PROFILES TABLE (extends Supabase Auth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();


-- ============================================================================
-- SECTION 3: BRANDS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Basic info (may be null until analyzers run)
  name TEXT,
  source_url TEXT NOT NULL,
  is_own_brand BOOLEAN DEFAULT FALSE,

  -- Scraped content
  scraped_content TEXT,
  scraped_at TIMESTAMPTZ,
  scrape_status TEXT DEFAULT 'pending' CHECK (scrape_status IN ('pending', 'scraping', 'complete', 'failed')),
  scrape_error TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_scrape_status ON brands(scrape_status);

-- Auto-update timestamp
CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- SECTION 4: ANALYSIS RUNS TABLE
-- ============================================================================

-- Create custom types for analyzer and status
DO $$ BEGIN
  CREATE TYPE analyzer_type AS ENUM ('basics', 'customer', 'products');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE analysis_status AS ENUM ('queued', 'analyzing', 'parsing', 'complete', 'error');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,

  -- Analyzer identification
  analyzer_type analyzer_type NOT NULL,
  status analysis_status DEFAULT 'queued',

  -- Results
  raw_analysis TEXT,           -- Natural language analysis (step 1)
  parsed_data JSONB,           -- Structured output (step 2)

  -- Error tracking
  error_message TEXT,
  retry_count INT DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- One run per analyzer per brand
  UNIQUE(brand_id, analyzer_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_analysis_runs_brand_id ON analysis_runs(brand_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_status ON analysis_runs(status) WHERE status NOT IN ('complete', 'error');


-- ============================================================================
-- SECTION 5: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Users can only see and edit their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- BRANDS POLICIES
-- Users can only access their own brands
CREATE POLICY "brands_select_own" ON brands
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "brands_insert_own" ON brands
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "brands_update_own" ON brands
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "brands_delete_own" ON brands
  FOR DELETE USING (auth.uid() = user_id);

-- ANALYSIS RUNS POLICIES
-- Access through brand ownership
CREATE POLICY "analysis_runs_select_own" ON analysis_runs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = analysis_runs.brand_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "analysis_runs_insert_own" ON analysis_runs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = analysis_runs.brand_id
      AND brands.user_id = auth.uid()
    )
  );

CREATE POLICY "analysis_runs_update_own" ON analysis_runs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = analysis_runs.brand_id
      AND brands.user_id = auth.uid()
    )
  );


-- ============================================================================
-- SECTION 6: REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for analysis_runs so we can show live progress
ALTER PUBLICATION supabase_realtime ADD TABLE analysis_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE brands;


-- ============================================================================
-- DONE! Your database is ready.
-- ============================================================================
