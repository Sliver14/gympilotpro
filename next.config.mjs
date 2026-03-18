// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   typescript: {
//     ignoreBuildErrors: true,
//   },
//   images: {
//     unoptimized: true,
//   },
//   reactStrictMode: true,
// }

// export default nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  reactStrictMode: process.env.NODE_ENV === 'development',

  experimental: {
    allowedDevOrigins: ['klimarx.lvh.me', '*.lvh.me', 'lvh.me', 'localhost:3000', '*.lvh.me:3000'],
  },

  compress: true,
  poweredByHeader: false,
}

export default nextConfig