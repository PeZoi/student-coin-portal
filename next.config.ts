import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Tối ưu Router Cache khi chuyển trang và Back lại (Next.js 15/16)
    // Giữ cache trang động 60s để chuyển tab tức thì 0ms, không bị nháy lại Skeleton loading
    staleTimes: {
      dynamic: 900,
      static: 180,
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
