import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Removing swcMinify as it's not recognized in Next.js 15.3.4
};

export default nextConfig;
