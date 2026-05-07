/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'replicate.delivery'      },
      { protocol: 'https', hostname: 'pbxt.replicate.delivery' },
      { protocol: 'https', hostname: 'image.pollinations.ai'   },
    ],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig