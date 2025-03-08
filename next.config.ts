import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable the Next.js server since we're using Express
  // This is important for production builds
  output: 'standalone',
};

export default nextConfig;
