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
  
  // SOP Compliance redirects for forbidden service types
  redirects: async () => {
    // Define redirects inline to avoid import issues
    return [
      // Essential → Standard Notary
      { source: '/services/essential', destination: '/services/standard-notary', permanent: true },
      { source: '/services/essential/:path*', destination: '/services/standard-notary/:path*', permanent: true },
      
      // Priority → Extended Hours Notary  
      { source: '/services/priority', destination: '/services/extended-hours-notary', permanent: true },
      { source: '/services/priority/:path*', destination: '/services/extended-hours-notary/:path*', permanent: true },
      
      // Basic → Standard Notary
      { source: '/services/basic', destination: '/services/standard-notary', permanent: true },
      { source: '/services/basic/:path*', destination: '/services/standard-notary/:path*', permanent: true },
      
      // Premium → Specialty Notary Service
      { source: '/services/premium', destination: '/services/specialty-notary-service', permanent: true },
      { source: '/services/premium/:path*', destination: '/services/specialty-notary-service/:path*', permanent: true },
      
      // Legacy API redirects
      { source: '/api/calendar/essential/:path*', destination: '/api/calendar/standard-notary/:path*', permanent: true },
      { source: '/api/calendar/priority/:path*', destination: '/api/calendar/extended-hours-notary/:path*', permanent: true },
      { source: '/api/calendar/basic/:path*', destination: '/api/calendar/standard-notary/:path*', permanent: true },
      { source: '/api/calendar/premium/:path*', destination: '/api/calendar/specialty-notary-service/:path*', permanent: true },
    ]
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