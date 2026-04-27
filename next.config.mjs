/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },

  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  reactStrictMode: process.env.NODE_ENV === 'development',

  compress: true,
  poweredByHeader: false,
}

export default nextConfig