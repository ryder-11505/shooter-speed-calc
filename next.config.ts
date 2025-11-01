import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  distDir: 'docs',
  assetPrefix: "/shooter-speed-calc"
};

export default nextConfig;
