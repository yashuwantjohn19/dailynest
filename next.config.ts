import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // set root to this project to avoid workspace root inference warnings
    root: process.cwd()
  }
};

export default nextConfig;
