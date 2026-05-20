import type { NextConfig } from "next";

import { apiCorsHeaderList } from "./src/lib/api/cors";

const nextConfig: NextConfig = {
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
