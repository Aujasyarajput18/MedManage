/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Fix: suppress webpack cache snapshot warning in monorepo / symlinked envs
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.cache = {
        ...config.cache,
        type: 'filesystem',
        buildDependencies: { config: [__filename] },
      };
    }
    return config;
  },
};

module.exports = nextConfig;
