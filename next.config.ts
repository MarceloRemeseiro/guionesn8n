import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Only warnings from our custom code matter.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript checks during builds for type safety
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
