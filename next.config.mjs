/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'mwafnmhpnlciztcxvxpf.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
    // Use unoptimized images for Sanity since it has its own CDN optimization
    unoptimized: true,
  },
  transpilePackages: ['next-sanity'],
}

export default nextConfig;
