import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Tailscale access during local dev (cross-origin)
  allowedDevOrigins: ['100.89.16.55', '100.120.180.64'],
  // Vercel SSR deployment - images optimized
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
