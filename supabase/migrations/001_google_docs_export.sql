-- ============================================================================
-- MIGRATION: GOOGLE DOCS EXPORT
-- ============================================================================
-- Adds support for Google OAuth integration and Google Docs export tracking.
-- Run this in your Supabase SQL Editor after the main schema.sql.
--
-- Changes:
-- 1. Adds Google OAuth columns to profiles table
-- 2. Adds Google Docs export columns to generated_docs table
-- ============================================================================

-- ============================================================================
-- SECTION 1: PROFILES - Google OAuth Columns
-- ============================================================================

-- Add Google OAuth columns to profiles
-- These store the user's Google connection for exporting to Google Docs

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS google_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS google_email TEXT,
  ADD COLUMN IF NOT EXISTS google_connected_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN profiles.google_refresh_token IS 'Encrypted Google OAuth refresh token for Docs API access';
COMMENT ON COLUMN profiles.google_email IS 'Google account email used for integration';
COMMENT ON COLUMN profiles.google_connected_at IS 'When the user connected their Google account';


-- ============================================================================
-- SECTION 2: GENERATED_DOCS - Google Docs Export Columns
-- ============================================================================

-- Add Google Docs reference columns
-- These track when a doc has been exported to Google Docs

ALTER TABLE generated_docs
  ADD COLUMN IF NOT EXISTS google_doc_id TEXT,
  ADD COLUMN IF NOT EXISTS google_doc_url TEXT,
  ADD COLUMN IF NOT EXISTS google_exported_at TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN generated_docs.google_doc_id IS 'The Google Docs document ID if exported';
COMMENT ON COLUMN generated_docs.google_doc_url IS 'Direct URL to the Google Doc';
COMMENT ON COLUMN generated_docs.google_exported_at IS 'When the doc was last exported to Google Docs';

-- Index for finding docs that have been exported
CREATE INDEX IF NOT EXISTS idx_generated_docs_google_doc_id
  ON generated_docs(google_doc_id)
  WHERE google_doc_id IS NOT NULL;


-- ============================================================================
-- DONE! Run this in your Supabase SQL Editor.
-- ============================================================================
