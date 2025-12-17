/**
 * ANALYZER TYPES
 * ===============
 * Types for analyzer outputs (the structured data extracted by GPT).
 * Each analyzer produces a specific shape stored in `parsed_data` JSONB.
 */

// ============================================================================
// BASICS ANALYZER OUTPUT
// ============================================================================

export type BusinessModel =
  | 'B2B Services'
  | 'B2C Services'
  | 'B2B Products'
  | 'B2C Products'
  | 'B2B SaaS'
  | 'B2C SaaS'
  | 'Marketplace'
  | 'Agency'
  | 'Consultancy'
  | 'Other';

export type ParsedBasics = {
  business_name: string;
  founder_name: string | null;
  founded_year: string | null;
  industry: string;
  business_description: string;
  business_model: BusinessModel;
};

// ============================================================================
// CUSTOMER ANALYZER OUTPUT
// ============================================================================

export type CustomerSophistication = 'Beginner' | 'Informed' | 'Expert';

export type BuyingMotivation =
  | 'Pain relief'
  | 'Aspiration'
  | 'Necessity'
  | 'Curiosity'
  | 'Status';

export type ParsedCustomer = {
  subcultures: string[];
  primary_problem: string;
  secondary_problems: string[];
  customer_sophistication: CustomerSophistication;
  buying_motivation: BuyingMotivation;
};

// ============================================================================
// PRODUCTS ANALYZER OUTPUT
// ============================================================================

export type OfferingType = 'Products' | 'Services' | 'Both' | 'Unclear';

export type PricingModel =
  | 'One-time'
  | 'Subscription'
  | 'Retainer'
  | 'Project-based'
  | 'Custom/Contact'
  | 'Free'
  | 'Freemium'
  | 'Unknown';

export type PricePositioning = 'Budget' | 'Mid-market' | 'Premium' | 'Luxury' | 'Unclear';

export type ProductOffering = {
  name: string;
  description: string;
  price: string | null;
  pricing_model: PricingModel;
};

export type ParsedProducts = {
  offering_type: OfferingType;
  offerings: ProductOffering[];
  primary_offer: string;
  price_positioning: PricePositioning;
};

// ============================================================================
// UNION TYPE (for generic handling)
// ============================================================================

export type ParsedAnalyzerData = ParsedBasics | ParsedCustomer | ParsedProducts;

// ============================================================================
// TYPE GUARDS (helpful for narrowing types safely)
// ============================================================================

export function isParsedBasics(data: unknown): data is ParsedBasics {
  return (
    typeof data === 'object' &&
    data !== null &&
    'business_name' in data &&
    'industry' in data
  );
}

export function isParsedCustomer(data: unknown): data is ParsedCustomer {
  return (
    typeof data === 'object' &&
    data !== null &&
    'primary_problem' in data &&
    'subcultures' in data
  );
}

export function isParsedProducts(data: unknown): data is ParsedProducts {
  return (
    typeof data === 'object' &&
    data !== null &&
    'offerings' in data &&
    'offering_type' in data
  );
}
