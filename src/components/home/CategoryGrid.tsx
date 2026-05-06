'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

const categories = [
  { slug: 'wires-cables', icon: '🔌', gradient: 'from-blue-500 to-blue-600' },
  { slug: 'switches-sockets', icon: '🔲', gradient: 'from-emerald-500 to-green-600' },
  { slug: 'lighting', icon: '💡', gradient: 'from-amber-400 to-yellow-500' },
  { slug: 'circuit-protection', icon: '⚡', gradient: 'from-red-500 to-rose-600' },
  { slug: 'fans', icon: '🌀', gradient: 'from-cyan-500 to-teal-600' },
  { slug: 'solar', icon: '☀️', gradient: 'from-orange-400 to-amber-500' },
  { slug: 'tools', icon: '🔧', gradient: 'from-slate-600 to-slate-700' },
  { slug: 'appliances', icon: '🏠', gradient: 'from-purple-500 to-violet-600' },
];

export default function CategoryGrid() {
  const t = useTranslations('home');

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900">{t('categoriesTitle')}</h2>
          <p className="mt-2 text-slate-500">{t('categoriesSubtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-primary/30"
            >
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} text-3xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                {cat.icon}
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-800 text-center group-hover:text-primary transition-colors">
                {t(`cat_${cat.slug.replace(/-/g, '_')}`)}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
