/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable the built-in server since we're using a custom one
  // with WebSocket support
  typescript: {
    // Ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
