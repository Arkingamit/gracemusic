/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mobile export only when explicitly requested
  output: process.env.MOBILE_BUILD === 'true' ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
