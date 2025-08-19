/** @type {import('next').NextConfig} */
const nextConfig = {
  // Le decimos a Next.js que ignore los errores de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;