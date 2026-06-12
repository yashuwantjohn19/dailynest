import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    // set root to this project to avoid workspace root inference warnings
    root: './'
  }
};

export default nextConfig;
