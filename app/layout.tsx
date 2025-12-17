/**
 * ROOT LAYOUT
 * ============
 * The root layout for the entire app.
 * Sets up metadata and global providers.
 */

import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
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
    <html lang="en">
      <body className="antialiased min-h-screen bg-[var(--background)]">
        <Header />
        {children}
      </body>
    </html>
  );
}
