import { createAdminClient } from '@/lib/supabase/admin';
import { formatPrice } from '@/lib/utils/formatPrice';
import Image from 'next/image';

type TopProduct = {
  id: string;
  name_en: string;
  images: string[] | null;
  sold_count: number;
  revenue: number;
};

export default async function TopProductsTable() {
  const supabase = createAdminClient();

  // sold_count was added in migration 001 — cast to any since generated types may not include it yet.
  // Run `supabase gen types` after applying migration 001 to remove this cast.
  const { data: rawProducts } = await (supabase
    .from('products')
    .select('id, name_en, images, sold_count')
    .gt('sold_count', 0)
    .order('sold_count', { ascending: false })
    .limit(5) as any);

  const products = rawProducts as Array<{
    id: string;
    name_en: string;
    images: string[] | null;
    sold_count: number;
  }> | null;

  // Enrich with revenue from orders
  let topProducts: TopProduct[] = [];

  if (products && products.length > 0) {
    // Fetch all delivered orders to calculate revenue per product
    const { data: orders } = await supabase
      .from('orders')
      .select('items, total')
      .eq('status', 'delivered');

    const revenueMap: Record<string, number> = {};

    orders?.forEach(order => {
      const items = order.items as Array<{ product_id?: string; id?: string; price: number; quantity: number }>;
      items?.forEach(item => {
        const pid = item.product_id || item.id;
        if (pid) {
          revenueMap[pid] = (revenueMap[pid] || 0) + (Number(item.price) * Number(item.quantity));
        }
      });
    });

    topProducts = products.map(p => ({
      id: p.id,
      name_en: p.name_en,
      images: p.images,
      sold_count: p.sold_count || 0,
      revenue: revenueMap[p.id] || 0,
    }));
  }

  if (topProducts.length === 0) return null;

  const maxSold = Math.max(...topProducts.map(p => p.sold_count), 1);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Top Selling Products</h2>

      <div className="space-y-4">
        {topProducts.map((product, i) => (
          <div key={product.id} className="flex items-center gap-4">
            {/* Rank */}
            <span className={`text-sm font-bold w-5 shrink-0 text-center ${
              i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-700' : 'text-slate-400'
            }`}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </span>

            {/* Image */}
            <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              {product.images?.[0] ? (
                <Image src={product.images[0]} alt={product.name_en} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg">📦</div>
              )}
            </div>

            {/* Bar + labels */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-800 truncate">{product.name_en}</p>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span className="text-xs text-slate-400">{product.sold_count} sold</span>
                  <span className="text-xs font-semibold text-slate-700">{formatPrice(product.revenue)}</span>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all duration-500"
                  style={{ width: `${(product.sold_count / maxSold) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
