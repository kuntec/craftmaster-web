/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'replicate.delivery' },
        { protocol: 'https', hostname: 'pbxt.replicate.delivery' },
      ],
    },
  }
  
  export default nextConfig