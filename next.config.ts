import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Only warnings from our custom code matter.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep TypeScript checks during builds for type safety
    ignoreBuildErrors: false,
  },
  // Configuración para mejor manejo de rutas
  trailingSlash: false,
  // Configuración para mejorar la compatibilidad
  poweredByHeader: false,
  // Optimización de imágenes
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
