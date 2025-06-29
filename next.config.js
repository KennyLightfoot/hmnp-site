/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    // Phase 3.2: React Compiler optimizations (when stable)
    reactCompiler: false, // Enable after testing
    
    // Phase 3.3: Development performance (Turbopack for dev only)
    turbo: true,
    
    // Phase 3.4: Memory and bundle optimizations
    webpackMemoryOptimizations: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*'],
    
    // Next.js 15 stable optimizations
    optimizeServerReact: true,
    serverMinification: true
  }
}

export default nextConfig