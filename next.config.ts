import type { NextConfig } from "next";

// Chỉ khống chế số worker khi chạy trên Windows local để tránh lỗi tràn Paging File (os error 1455 / 1450).
// Trên Vercel/Linux, hệ thống sẽ tự do tận dụng tối đa vCPU được cấp phát.
if (process.platform === "win32") {
  process.env.NEXT_CPU_COUNT = process.env.NEXT_CPU_COUNT || "2";
  process.env.NEXT_PRIVATE_WORKER_CORES = process.env.NEXT_PRIVATE_WORKER_CORES || "2";
}

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
