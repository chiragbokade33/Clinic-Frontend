import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ already added for ESLint
  },
  typescript: {
    // ✅ Ignores TypeScript errors during `next build`
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
