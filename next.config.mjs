/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Prevent Turbopack from trying to bundle Node.js-only packages
  serverExternalPackages: ['nodemailer'],
}

export default nextConfig
