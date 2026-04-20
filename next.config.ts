import type { NextConfig } from 'next';

const securityHeaders = [
  // HSTS: force HTTPS for 2 years; safe because we only serve over HTTPS
  // in production on Vercel. Preload-eligible.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Block MIME-type sniffing.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Don't leak paths via Referer to third parties.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Anti-clickjacking. Admin/auth pages must never be embedded.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Lock down powerful APIs we don't use.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
  // Belt-and-braces anti-clickjacking for modern browsers.
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
    ],
  },
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
    ];
  },
};

export default nextConfig;
