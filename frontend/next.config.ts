import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // No
    // Warning: This allows production builds to successfully complete even if your project has ESLint errors.
    // Use this only temporarily during development. Read more here:
    // https://nextjs.org/docs/basic-features/eslint#linting-during-development-and-production-builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
