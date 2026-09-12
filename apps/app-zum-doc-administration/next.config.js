/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    '@app-zum-doc/utils',
  ],
}

export default nextConfig
