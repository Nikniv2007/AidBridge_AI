/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Keep portfolio builds green even if lint is not configured in CI.
    ignoreDuringBuilds: true,
  },
  experimental: {
    typedRoutes: false,
  },
};

module.exports = nextConfig;
