import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isProd ? '/atrias-wiki' : '',
  assetPrefix: isProd ? '/atrias-wiki/' : '',
  images: {
    unoptimized: true,
  },
  // Exclude studio from static export (needs server)
  experimental: {
    // Skip routes that can't be statically exported
  },
};

export default nextConfig;
