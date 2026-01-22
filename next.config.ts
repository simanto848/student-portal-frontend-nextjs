import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/public/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/public/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8001',
        pathname: '/public/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8007',
        pathname: '/public/uploads/**',
      },
    ],
  },
};

export default nextConfig;
