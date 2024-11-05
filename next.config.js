/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['127.0.0.1', 'localhost'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/api/**',
      },
    ],
  },
}

module.exports = nextConfig