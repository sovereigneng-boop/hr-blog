/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ["@vercel/blob", "@vercel/kv"],
  },
};

export default nextConfig;

