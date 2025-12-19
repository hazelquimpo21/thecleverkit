import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Headers for OAuth popup flow
  async headers() {
    return [
      {
        // Allow popups to communicate back to the opener window
        // This is needed for the Google OAuth popup flow
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
