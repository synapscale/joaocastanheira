import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@ui': path.resolve(process.cwd(), '../../shared/ui'),
      '@utils': path.resolve(process.cwd(), '../../shared/utils'),
      '@hooks': path.resolve(process.cwd(), '../../shared/hooks'),
      '@constants': path.resolve(process.cwd(), '../../shared/constants'),
      '@types': path.resolve(process.cwd(), '../../packages/types'),
      '@shared': path.resolve(process.cwd(), '../../shared'),
      '@components': path.resolve(process.cwd(), '../../components'),
      '@theme': path.resolve(process.cwd(), '../../shared/theme-provider'),
      '@themePkg': path.resolve(process.cwd(), '../../packages/theme/theme-provider'),
      '@/services': path.resolve(process.cwd(), 'services'),
      '@/hooks': path.resolve(process.cwd(), 'hooks'),
      '@/components/ui/skeletons': path.resolve(process.cwd(), 'components/ui/skeletons'),
      '@/components/ui': path.resolve(process.cwd(), 'components/ui'),
    };
    return config;
  },
};

export default nextConfig;
