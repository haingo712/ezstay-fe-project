/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['face-api.js'],
  
  // Completely disable Next.js dev indicators (the floating button in corner)
  devIndicators: false,
  
  // Disable error overlay completely in Next.js 15
  reactStrictMode: false,
  
  // Customize which errors show overlay
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ipfs.filebase.io',
        port: '',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
