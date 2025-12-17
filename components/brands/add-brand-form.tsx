/**
 * ADD BRAND FORM COMPONENT
 * ==========================
 * Form for adding a new brand via URL.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Form to add a new brand by entering a website URL.
 *
 * @example
 * <AddBrandForm />
 */
export function AddBrandForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/brands/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to analyze brand');
        setIsLoading(false);
        return;
      }

      // Redirect to brand page
      router.push(`/brands/${data.brandId}`);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-stone-900">
              Analyze a Brand
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Enter a website URL to get instant brand intelligence
            </p>
          </div>

          {/* URL Input */}
          <div className="relative">
            <Input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              error={error || undefined}
              disabled={isLoading}
              className="pr-32"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            loadingText="Analyzing..."
          >
            Analyze Brand
            <ArrowRight className="w-4 h-4" />
          </Button>

          {/* Help text */}
          <p className="text-xs text-center text-stone-400">
            We&apos;ll scrape the homepage and analyze the brand using AI
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
