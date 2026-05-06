import HeroBanner from '@/components/home/HeroBanner';
import TrustBadges from '@/components/home/TrustBadges';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';

export const revalidate = 3600;

export default function HomePage() {
  return (
    <div>
      <HeroBanner />
      <TrustBadges />
      <FeaturedProducts />
      <CategoryGrid />
    </div>
  );
}
