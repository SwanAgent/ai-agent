import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'suicamp.b-cdn.net',
      },
      {
        hostname: 'imagedelivery.net',
      },
    ],
  },
};

export default nextConfig;
