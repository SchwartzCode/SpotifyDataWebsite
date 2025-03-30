import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during build
    ignoreDuringBuilds: true,
  },
  output: 'export', // This creates an 'out' directory

  // Disable image optimization since we're exporting statically
  images: {
    unoptimized: true,
  },
  
  // Disable @next/swc-* imports which aren't needed for static exports
  experimental: {
    esmExternals: true,
  },
  
  // Other Next.js config options
  reactStrictMode: true,
};

export default nextConfig;
