/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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