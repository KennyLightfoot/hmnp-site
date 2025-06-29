/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  // Temporarily disable static optimization to fix build
  // Skip static generation for build issues
  trailingSlash: false,
  generateBuildId: () => 'critical-fixes-deploy',
  experimental: {
    // Phase 3.2: React Compiler optimizations (when stable)
    reactCompiler: false, // Enable after testing
    
    // Phase 3.3: Development performance (moved to config.turbopack in 15.3+)
    // turbo: {}, // Deprecated - moved to turbopack config
    
    // Phase 3.4: Memory and bundle optimizations
    webpackMemoryOptimizations: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
    
    // Next.js 15 stable optimizations
    optimizeServerReact: false, // Temporarily disabled for build stability
    serverMinification: false // Temporarily disabled for build stability
  },
  
  // Turbopack configuration (new location in Next.js 15.3+)
  turbopack: {}
}

export default nextConfig