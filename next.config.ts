import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Using Vercel SSR - no static export needed
  images: {
    unoptimized: true, // Keep for now, can enable optimization later
  },
};

export default nextConfig;
