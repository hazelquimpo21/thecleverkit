/**
 * ROOT LAYOUT
 * ============
 * The root layout for the entire app.
 * Sets up metadata, global providers, and app shell.
 */

import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Providers } from '@/lib/providers';
import './globals.css';

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: {
    default: 'The Clever Kit',
    template: '%s | The Clever Kit',
  },
  description: 'AI-powered brand intelligence for agencies and freelancers. Paste a URL, get instant brand insights.',
  keywords: ['brand intelligence', 'marketing', 'AI', 'brand analysis'],
};

// ============================================================================
// LAYOUT COMPONENT
// ============================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
