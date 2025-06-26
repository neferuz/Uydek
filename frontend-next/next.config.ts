import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BACKEND_URL: 'http://127.0.0.1:8001',
  },
  devServer: {
    allowedDevOrigins: ['http://127.0.0.1:3000', 'http://localhost:3000'],
  },
  /* config options here */
};

export default nextConfig;
