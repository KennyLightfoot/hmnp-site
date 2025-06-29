/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Enhanced bundle optimization configuration
  trailingSlash: false,
  generateBuildId: () => 'phase3-optimized-build',
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  experimental: {
    // Phase 3: Advanced bundle optimizations
    webpackMemoryOptimizations: true,
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-*',
      'react-hook-form',
      '@hookform/resolvers',
      'date-fns',
      'zustand'
    ],
    
    // Enable when stable in production
    reactCompiler: false,
    optimizeServerReact: true,
    serverMinification: true,
    
    // Enhanced caching
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  
  // Turbopack configuration for development
  turbopack: {
    loaders: {
      '.svg': ['@svgr/webpack'],
    },
    resolveAlias: {
      '@': './src',
    },
  },
  
  // Webpack optimization for production builds
  webpack: (config, { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }) => {
    // Bundle analyzer (enable when needed)
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: isServer ? 'server-bundle-analysis.html' : 'client-bundle-analysis.html',
        })
      );
    }

    // Enhanced code splitting
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // UI components
            ui: {
              test: /[\\/]components[\\/]ui[\\/]/,
              name: 'ui-components',
              chunks: 'all',
              priority: 15,
            },
            // React and core libraries
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              name: 'react-vendor',
              chunks: 'all',
              priority: 20,
            },
            // Form libraries
            forms: {
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform)[\\/]/,
              name: 'form-vendor',
              chunks: 'all',
              priority: 15,
            },
            // Date utilities
            dates: {
              test: /[\\/]node_modules[\\/](date-fns)[\\/]/,
              name: 'date-vendor',
              chunks: 'all',
              priority: 15,
            },
            // Common components
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Tree shaking optimizations
    config.optimization.usedExports = true;
    config.optimization.sideEffects = false;

    // Compression optimizations
    if (!dev) {
      config.plugins.push(
        new webpack.optimize.AggressiveMergingPlugin(),
      );
    }

    return config;
  },
  
  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
}

export default nextConfig