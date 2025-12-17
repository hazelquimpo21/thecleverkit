# Scrapers

## Overview

Scrapers fetch content from external sources (websites, social profiles, etc.) and convert it to clean text for analyzers to process.

MVP has one scraper: **web-homepage** (fetches and parses a single URL).

The architecture supports multiple scrapers per brand in the future.

## File Structure

```
/lib/scrapers/
  web-homepage/
    index.ts       ← main scrape function
    parser.ts      ← HTML → clean text
    config.ts      ← metadata
    
  types.ts         ← shared types (ScrapedSource, ScraperConfig)
  index.ts         ← registry of all scrapers
  
  # Future scrapers:
  linkedin/
  twitter/
  instagram/
  google-search/
```

## Scraper Types

```typescript
// lib/scrapers/types.ts

export type ScraperType = 
  | 'web-homepage'
  // Future:
  // | 'web-deep'
  // | 'linkedin'
  // | 'twitter'
  // | 'instagram'
  // | 'google-search'

export type ScraperConfig = {
  id: ScraperType;
  name: string;
  description: string;
  icon: LucideIcon;
  // What kind of input this scraper needs
  inputType: 'url' | 'handle' | 'search-query';
  inputPlaceholder: string;
  inputValidation: RegExp;
};

export type ScrapedSource = {
  scraper_type: ScraperType;
  source_url: string;
  content: string;
  scraped_at: string;
  metadata?: Record<string, unknown>;  // Scraper-specific extras
};

export type ScrapeResult = {
  success: boolean;
  source?: ScrapedSource;
  error?: string;
};
```

## Web Homepage Scraper

### Config

```typescript
// lib/scrapers/web-homepage/config.ts

import { Globe } from 'lucide-react';
import type { ScraperConfig } from '../types';

export const config: ScraperConfig = {
  id: 'web-homepage',
  name: 'Website',
  description: 'Scrape a website homepage',
  icon: Globe,
  inputType: 'url',
  inputPlaceholder: 'https://example.com',
  inputValidation: /^https?:\/\/.+\..+/,
};
```

### Main Scraper

```typescript
// lib/scrapers/web-homepage/index.ts

import { parseHTML } from './parser';
import type { ScrapeResult } from '../types';

const TIMEOUT_MS = 15000;
const USER_AGENT = 'CleverKitBot/1.0 (brand research tool)';

export async function scrape(url: string): Promise<ScrapeResult> {
  try {
    // Normalize URL
    const normalizedUrl = normalizeUrl(url);

    // Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();
    const content = parseHTML(html);

    if (!content || content.length < 100) {
      return {
        success: false,
        error: 'Page appears to be empty or blocked',
      };
    }

    return {
      success: true,
      source: {
        scraper_type: 'web-homepage',
        source_url: normalizedUrl,
        content,
        scraped_at: new Date().toISOString(),
        metadata: {
          content_length: content.length,
        },
      },
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: 'Request timed out' };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function normalizeUrl(url: string): string {
  let normalized = url.trim();
  
  // Add protocol if missing
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }
  
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  
  return normalized;
}
```

### HTML Parser

```typescript
// lib/scrapers/web-homepage/parser.ts

import * as cheerio from 'cheerio';

export function parseHTML(html: string): string {
  const $ = cheerio.load(html);

  // Remove non-content elements
  $('script').remove();
  $('style').remove();
  $('noscript').remove();
  $('iframe').remove();
  $('nav').remove();           // Usually just links
  $('footer').remove();        // Usually boilerplate
  $('[role="navigation"]').remove();
  $('[aria-hidden="true"]').remove();

  // Extract meaningful content
  const parts: string[] = [];

  // Page title
  const title = $('title').text().trim();
  if (title) {
    parts.push(`PAGE TITLE: ${title}`);
  }

  // Meta description
  const metaDesc = $('meta[name="description"]').attr('content');
  if (metaDesc) {
    parts.push(`META DESCRIPTION: ${metaDesc.trim()}`);
  }

  // Open Graph tags (often have good summaries)
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDesc = $('meta[property="og:description"]').attr('content');
  if (ogTitle && ogTitle !== title) {
    parts.push(`OG TITLE: ${ogTitle.trim()}`);
  }
  if (ogDesc && ogDesc !== metaDesc) {
    parts.push(`OG DESCRIPTION: ${ogDesc.trim()}`);
  }

  // Main content areas (priority order)
  const mainContent = $('main, [role="main"], article, .content, #content')
    .first()
    .text();
  
  if (mainContent && mainContent.trim().length > 50) {
    parts.push(`MAIN CONTENT:\n${cleanText(mainContent)}`);
  } else {
    // Fallback to body if no main content area
    const bodyText = $('body').text();
    parts.push(`PAGE CONTENT:\n${cleanText(bodyText)}`);
  }

  // About section (often has founder/company info)
  const aboutSection = $('[class*="about"], #about, [id*="about"]').text();
  if (aboutSection && aboutSection.trim().length > 50) {
    parts.push(`ABOUT SECTION:\n${cleanText(aboutSection)}`);
  }

  return parts.join('\n\n---\n\n');
}

function cleanText(text: string): string {
  return text
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim
    .trim()
    // Limit length (GPT context limits)
    .slice(0, 15000);
}
```

## Scraper Registry

```typescript
// lib/scrapers/index.ts

import { config as webHomepageConfig } from './web-homepage/config';
import { scrape as webHomepageScrape } from './web-homepage';
import type { ScraperConfig, ScrapeResult } from './types';

type ScraperDefinition = {
  config: ScraperConfig;
  scrape: (input: string) => Promise<ScrapeResult>;
};

export const scrapers: Record<string, ScraperDefinition> = {
  'web-homepage': {
    config: webHomepageConfig,
    scrape: webHomepageScrape,
  },
  // Future:
  // 'linkedin': { config: linkedinConfig, scrape: linkedinScrape },
};

export const scraperConfigs = Object.values(scrapers).map(s => s.config);
```

## Using Scrapers

### API Route for Scraping

```typescript
// app/api/brands/[brandId]/scrape/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { scrapers } from '@/lib/scrapers';
import { updateBrand } from '@/lib/supabase/brands';

export async function POST(
  request: NextRequest,
  { params }: { params: { brandId: string } }
) {
  const { brandId } = params;
  const { url, scraperType = 'web-homepage' } = await request.json();

  // Update brand status
  await updateBrand(brandId, {
    scrape_status: 'scraping',
    source_url: url,
  });

  try {
    const scraper = scrapers[scraperType];
    if (!scraper) {
      throw new Error(`Unknown scraper: ${scraperType}`);
    }

    const result = await scraper.scrape(url);

    if (!result.success) {
      await updateBrand(brandId, {
        scrape_status: 'failed',
        scrape_error: result.error,
      });
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    await updateBrand(brandId, {
      scrape_status: 'complete',
      scraped_content: result.source!.content,
      scraped_at: result.source!.scraped_at,
      scrape_error: null,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    await updateBrand(brandId, {
      scrape_status: 'failed',
      scrape_error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      { error: 'Scraping failed' },
      { status: 500 }
    );
  }
}
```

## Future: Multiple Sources Per Brand

When we add more scrapers, we'll store multiple sources:

```typescript
// Future schema update
type Brand = {
  // ...existing fields
  scraped_sources: ScrapedSource[];  // Array instead of single content
};

// Analyzers will receive combined content
function combineScrapedSources(sources: ScrapedSource[]): string {
  return sources
    .map(s => `=== SOURCE: ${s.scraper_type} (${s.source_url}) ===\n\n${s.content}`)
    .join('\n\n---\n\n');
}
```

## Adding a New Scraper

### Step 1: Create the folder

```
/lib/scrapers/linkedin/
  config.ts
  index.ts
  parser.ts (if needed)
```

### Step 2: Define config

```typescript
// lib/scrapers/linkedin/config.ts

import { Linkedin } from 'lucide-react';
import type { ScraperConfig } from '../types';

export const config: ScraperConfig = {
  id: 'linkedin',
  name: 'LinkedIn',
  description: 'Scrape a LinkedIn company page',
  icon: Linkedin,
  inputType: 'url',
  inputPlaceholder: 'https://linkedin.com/company/...',
  inputValidation: /linkedin\.com\/company\//,
};
```

### Step 3: Implement scraper

```typescript
// lib/scrapers/linkedin/index.ts

import type { ScrapeResult } from '../types';

export async function scrape(url: string): Promise<ScrapeResult> {
  // LinkedIn-specific scraping logic
  // May need to use a service like Proxycurl, PhantomBuster, etc.
  // Or official LinkedIn API if available
}
```

### Step 4: Add to registry

```typescript
// lib/scrapers/index.ts

import { config as linkedinConfig } from './linkedin/config';
import { scrape as linkedinScrape } from './linkedin';

export const scrapers = {
  'web-homepage': { ... },
  'linkedin': {
    config: linkedinConfig,
    scrape: linkedinScrape,
  },
};
```

### Step 5: Update types

```typescript
// lib/scrapers/types.ts

export type ScraperType = 
  | 'web-homepage'
  | 'linkedin';  // Add new type
```

## Error Handling

| Error Type | User Message | Technical Detail |
|------------|--------------|------------------|
| Timeout | "The site took too long to respond" | AbortError after 15s |
| 404 | "We couldn't find that page" | HTTP 404 |
| 403/401 | "This site blocked our request" | Auth required or bot blocked |
| Empty content | "The page appears to be empty" | Less than 100 chars extracted |
| Invalid URL | "Please enter a valid URL" | Validation regex failed |
| Network error | "We couldn't connect to that site" | Fetch failed |

## Rate Limiting

For MVP, rate limiting is simple:
- Max 1 concurrent scrape per user
- Max 10 scrapes per hour per user

Implemented at API route level:

```typescript
// Pseudo-code for rate limiting
const userScrapeCount = await getUserScrapeCount(userId, '1 hour');
if (userScrapeCount >= 10) {
  return NextResponse.json(
    { error: 'Rate limit exceeded. Try again later.' },
    { status: 429 }
  );
}
```

## Testing Scrapers

```typescript
// lib/scrapers/__tests__/web-homepage.test.ts

import { scrape } from '../web-homepage';

describe('web-homepage scraper', () => {
  it('scrapes a valid URL', async () => {
    const result = await scrape('https://example.com');
    expect(result.success).toBe(true);
    expect(result.source?.content).toContain('Example Domain');
  });

  it('handles timeout', async () => {
    // Mock a slow server
    const result = await scrape('https://slow-server.test');
    expect(result.success).toBe(false);
    expect(result.error).toContain('timed out');
  });

  it('handles invalid URL', async () => {
    const result = await scrape('not-a-url');
    expect(result.success).toBe(false);
  });
});
```
