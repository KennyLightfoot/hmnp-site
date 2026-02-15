/** @type {import('next').NextConfig} */
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const nextConfig = {
  // ... (keep existing config unchanged)

  webpack: (config, { isServer }) => {
    // ... (existing webpack config)

    // Modified bundle analyzer configuration
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