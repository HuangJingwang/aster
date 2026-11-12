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
    }];
  },
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
