'use client';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type { Tables } from '@/types';

// Gradient fallback keyed by slug — add new slugs here as categories grow
const GRADIENT_MAP: Record<string, string> = {
  'wires-cables': 'from-blue-500 to-blue-600',
  'switches-sockets': 'from-emerald-500 to-green-600',
  'lights-fittings': 'from-amber-400 to-yellow-500',
  'mcbs-dbs': 'from-red-500 to-rose-600',
  'fans': 'from-cyan-500 to-teal-600',
  'solar': 'from-orange-400 to-amber-500',
  'tools-equipment': 'from-slate-600 to-slate-700',
  'house-wiring': 'from-purple-500 to-violet-600',
};

const DEFAULT_GRADIENT = 'from-primary to-primary-light';

type Category = Tables<'categories'>;

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const locale = useLocale();
  const t = useTranslations('home');

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">{t('categoriesTitle')}</h2>
          <p className="mt-2 text-slate-500">{t('categoriesSubtitle')}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 lg:gap-6">
          {categories.map((cat) => {
            const gradient = GRADIENT_MAP[cat.slug] ?? DEFAULT_GRADIENT;
            const label = locale === 'np' ? cat.name_np : cat.name_en;
            return (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-primary/30 sm:p-6"
              >
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-16 sm:w-16 sm:text-3xl`}>
                  {cat.icon ?? '📦'}
                </div>
                <h3 className="mt-3 text-center text-xs font-semibold text-slate-800 transition-colors group-hover:text-primary sm:mt-4 sm:text-sm">
                  {label}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
