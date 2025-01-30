import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // 输出静态文件
  images: {
    unoptimized: true, // 禁用图片优化，因为静态导出不支持图片优化
  },
};

export default nextConfig;
