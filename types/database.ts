/**
 * DATABASE TYPES
 * ===============
 * TypeScript types that match our Supabase schema.
 * These are the core data structures used throughout the app.
 *
 * @update 2025-12-19 - Added generated_docs table for docs feature
 */

// ============================================================================
// PROFILE (extends Supabase Auth user)
// ============================================================================

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// BRAND (the core entity - a business being analyzed)
// ============================================================================

export type ScrapeStatus = 'pending' | 'scraping' | 'complete' | 'failed';

export type Brand = {
  id: string;
  user_id: string;
  name: string | null;
  source_url: string;
  is_own_brand: boolean;
  scraped_content: string | null;
  scraped_at: string | null;
  scrape_status: ScrapeStatus;
  scrape_error: string | null;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// ANALYSIS RUN (one analyzer execution for one brand)
// ============================================================================

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

// ============================================================================
// JOINED TYPES (commonly used combinations)
// ============================================================================

/**
 * Brand with all its analysis runs included.
 * This is what we fetch for the brand profile page.
 */
export type BrandWithAnalyses = Brand & {
  analysis_runs: AnalysisRun[];
};

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

/**
 * Type for inserting a new profile.
 * Only id is required; other fields are optional.
 */
export type ProfileInsert = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
};

/**
 * Type for inserting a new brand.
 * user_id and source_url are required; others have defaults or are nullable.
 */
export type BrandInsert = {
  user_id: string;
  source_url: string;
  name?: string | null;
  is_own_brand?: boolean;
  scraped_content?: string | null;
  scraped_at?: string | null;
  scrape_status?: ScrapeStatus;
  scrape_error?: string | null;
};

/**
 * Type for inserting a new analysis run.
 * brand_id and analyzer_type are required.
 */
export type AnalysisRunInsert = {
  brand_id: string;
  analyzer_type: AnalyzerType;
  status?: AnalysisStatus;
  raw_analysis?: string | null;
  parsed_data?: Record<string, unknown> | null;
  error_message?: string | null;
  retry_count?: number;
  started_at?: string | null;
  completed_at?: string | null;
};

// ============================================================================
// UPDATE TYPES (for modifying existing records)
// ============================================================================

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
export type BrandUpdate = Partial<Omit<Brand, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type AnalysisRunUpdate = Partial<Omit<AnalysisRun, 'id' | 'brand_id' | 'analyzer_type' | 'created_at'>>;

// ============================================================================
// DATABASE TYPE (for Supabase client typing)
// ============================================================================

// Import doc types for generated_docs table
import type { GeneratedDoc, GeneratedDocInsert, GeneratedDocUpdate, DocStatus } from './docs';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      brands: {
        Row: Brand;
        Insert: BrandInsert;
        Update: BrandUpdate;
        Relationships: [
          {
            foreignKeyName: 'brands_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      analysis_runs: {
        Row: AnalysisRun;
        Insert: AnalysisRunInsert;
        Update: AnalysisRunUpdate;
        Relationships: [
          {
            foreignKeyName: 'analysis_runs_brand_id_fkey';
            columns: ['brand_id'];
            isOneToOne: false;
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          }
        ];
      };
      generated_docs: {
        Row: GeneratedDoc;
        Insert: GeneratedDocInsert;
        Update: GeneratedDocUpdate;
        Relationships: [
          {
            foreignKeyName: 'generated_docs_brand_id_fkey';
            columns: ['brand_id'];
            isOneToOne: false;
            referencedRelation: 'brands';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      analyzer_type: AnalyzerType;
      analysis_status: AnalysisStatus;
      scrape_status: ScrapeStatus;
      doc_status: DocStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
