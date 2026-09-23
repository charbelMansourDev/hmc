import path from "node:path";
import type { NextConfig } from "next";

// A stray package.json / package-lock.json in the home directory makes Next
// infer the wrong workspace root, so pin both roots to this project.
const root = path.resolve(process.cwd());

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: root,
  turbopack: { root },
  // Local uploads are read with cwd-relative fs calls; keep them out of traces.
  outputFileTracingExcludes: { "*": ["./uploads/**/*"] },
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
    ],
    localPatterns: [{ pathname: "/api/media/**" }],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
