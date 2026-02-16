/** @type {import('next').NextConfig} */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix ioredis/net/tls being bundled for client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
      };
    }

    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer
            ? '../.next/analyze/server-bundle-analysis.html'
            : '../.next/analyze/client-bundle-analysis.html',
          generateStatsFile: true,
          statsFilename: '../.next/analyze/stats.json'
        })
      );
    }
    return config;
  },
}

export default nextConfig
