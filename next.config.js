import path from 'path'

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@aws-sdk/client-s3'],
  
  // TypeScript configuration for memory optimization
  typescript: {
    // Skip Next.js separate type-check step – we run `pnpm type-check` in CI instead.
    ignoreBuildErrors: true,
  },
  
  // Optimize build performance and memory usage
  experimental: {
    // Enable modern build optimizations
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    // Disable memory-intensive features during build
    webpackMemoryOptimizations: true,
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Allow imports like "@/lib/db" to resolve to project root
    config.resolve = config.resolve || {}
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(process.cwd()),
    }
    // Reduce memory usage during builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxSize: 200000, // 200KB chunks
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              maxSize: 200000,
            },
          },
        },
      };
      
      // Memory optimization
      config.infrastructureLogging = { level: 'error' };
      config.stats = { warnings: false };
    }
    
    return config;
  },
  
  headers: async () => {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },
  images: {
    domains: ['houstonmobilenotarypros.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  trailingSlash: false,
  reactStrictMode: true,
}

export default nextConfig 