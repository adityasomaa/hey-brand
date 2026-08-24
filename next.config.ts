import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Vercel Image Optimization quota on this account is exhausted. With the
  // optimizer on, every <Image> request returns 402 and production renders blank.
  // All artwork here is deterministic SVG, so optimization buys us nothing anyway.
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
