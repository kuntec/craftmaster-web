/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'Content-Security-Policy',
              value: "img-src 'self' data: https: blob:;",
            },
          ],
        },
      ]
    },
    images: {
      remotePatterns: [
        { protocol: 'https', hostname: 'replicate.delivery' },
        { protocol: 'https', hostname: 'pbxt.replicate.delivery' },
        { protocol: 'https', hostname: 'image.pollinations.ai'   },

      ],
    },
  }
  
  export default nextConfig