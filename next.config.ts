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
      {
        hostname: 'assets.coingecko.com',
      },
      {
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },
};

export default nextConfig;
