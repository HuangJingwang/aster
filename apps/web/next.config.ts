import type { NextConfig } from 'next';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

const nextConfig: NextConfig = {
  devIndicators: false,
  output: 'standalone',
  async redirects() {
    return [{
      source: '/moments/mina-meeting-video',
      destination: '/posts/mina-meeting-video',
      permanent: true,
    }, {
      source: '/videos/mina-animatic-v1.mp4',
      destination: '/videos/mina-false-ending-office-v8.mp4',
      permanent: true,
    }];
  },
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
