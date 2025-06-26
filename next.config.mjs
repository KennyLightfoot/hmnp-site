/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Environment variables configuration
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://houstonmobilenotarypros.com',
  },
  
  // Skip validation during build
  experimental: {
    skipMiddlewareUrlNormalize: false,
    skipTrailingSlashRedirect: false,
  },

  images: {
    // No specific image config needed for now, 
    // defaults will apply. If remote domains are needed, add them here.
    // e.g., remotePatterns: [{ protocol: 'https', hostname: 'example.com' }]
  },
  webpack: (config, { isServer }) => {
    // Make LaunchDarkly server SDK external for client builds
    if (!isServer) {
      config.externals = config.externals || [];
      config.externals.push('launchdarkly-node-server-sdk');
    }
    return config;
  },
}

export default nextConfig