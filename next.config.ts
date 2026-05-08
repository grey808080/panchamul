import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        // Allow both /object/public/ (direct) and /render/image/public/ (transformed)
        pathname: '/storage/v1/**',
      },
    ] as const,
  },
};

export default withNextIntl(nextConfig);