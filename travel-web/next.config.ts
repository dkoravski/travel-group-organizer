import type { NextConfig } from "next";

import { apiCorsHeaderList } from "./src/lib/api/cors";

function getHostname(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname;
  } catch {
    return value
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .trim();
  }
}

const serverActionAllowedOrigins = Array.from(
  new Set(
    [
      getHostname(process.env.URL),
      getHostname(process.env.DEPLOY_URL),
      getHostname(process.env.DEPLOY_PRIME_URL),
      getHostname(process.env.NEXT_PUBLIC_SITE_URL),
    ].filter((origin): origin is string => Boolean(origin)),
  ),
);

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: serverActionAllowedOrigins,
    },
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: apiCorsHeaderList,
      },
    ];
  },
};

export default nextConfig;
