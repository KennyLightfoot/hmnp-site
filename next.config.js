/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove TypeScript ignore - enable proper type checking
  // typescript: {
  //   ignoreBuildErrors: true
  // },
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
  
  // Modern Next.js 15 features - moved from experimental
  serverExternalPackages: ['@prisma/client'],
  
  experimental: {
    // Simplified experimental features to prevent conflicts
    webpackMemoryOptimizations: false, // Disable to prevent optimization conflicts
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-*',
      'react-hook-form',
      '@hookform/resolvers',
      'date-fns',
      'zustand'
    ],
    
    // Modern Next.js 15 features
    serverActions: {
      bodySizeLimit: '2mb'
    },
    
    // Keep only stable features
    reactCompiler: false,
    
    // Simplified caching
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  
  // REMOVED: Turbopack configuration causing build errors
  // The loaders configuration is not supported in current Next.js version
  
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

    // Simplified code splitting to prevent optimization conflicts
    if (!dev && !isServer) {
      // Remove problematic optimization configurations
      config.optimization.splitChunks = {
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
        };
    }

    // REMOVED: Tree shaking optimizations causing conflicts
    // config.optimization.usedExports = true;
    // config.optimization.sideEffects = false;

    // Compression optimizations
    if (!dev) {
      config.plugins.push(
        new webpack.optimize.AggressiveMergingPlugin(),
      );
    }

    // Stub out Node.js-only modules when bundling for the browser so libraries
    // like `ioredis` don’t cause webpack to fail during client compilation.
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        dns: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  
  // Headers for performance and security
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
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
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
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
    ];
  },
}

export default nextConfig