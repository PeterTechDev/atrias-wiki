import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
