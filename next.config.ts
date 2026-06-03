import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARNING !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARNING !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
