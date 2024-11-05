/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/api/**',
      },
    ],
  },
  serverActions: {
    bodySizeLimit: '5mb', // Adjust the limit as needed
  },
}

module.exports = nextConfig