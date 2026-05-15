/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Add remote image hosts here, e.g.:
      // { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // FastAPI backend URL (Phase 2+). Reads from env so dev/prod can differ.
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000',
  },
};

export default nextConfig;
