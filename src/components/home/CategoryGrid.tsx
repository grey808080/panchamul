'use client';
import { Link } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';

const categories = [
  { slug: 'wires-cables', icon: '🔌', label_en: 'Wires & Cables', label_np: 'तार र केबल', gradient: 'from-blue-500 to-blue-600' },
  { slug: 'switches-sockets', icon: '🔲', label_en: 'Switches & Sockets', label_np: 'स्विच र सकेट', gradient: 'from-emerald-500 to-green-600' },
  { slug: 'lights-fittings', icon: '💡', label_en: 'Lights & Fittings', label_np: 'बत्ती र फिटिङ', gradient: 'from-amber-400 to-yellow-500' },
  { slug: 'mcbs-dbs', icon: '⚡', label_en: 'MCBs & DBs', label_np: 'एमसीबी र डीबी', gradient: 'from-red-500 to-rose-600' },
  { slug: 'fans', icon: '🌀', label_en: 'Fans', label_np: 'पंखा', gradient: 'from-cyan-500 to-teal-600' },
  { slug: 'solar', icon: '☀️', label_en: 'Solar', label_np: 'सोलार', gradient: 'from-orange-400 to-amber-500' },
  { slug: 'tools-equipment', icon: '🔧', label_en: 'Tools & Equipment', label_np: 'औजार र उपकरण', gradient: 'from-slate-600 to-slate-700' },
  { slug: 'house-wiring', icon: '🏠', label_en: 'House Wiring Goods', label_np: 'घर वायरिङ सामान', gradient: 'from-purple-500 to-violet-600' },
];

export default function CategoryGrid() {
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
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-primary/30 sm:p-6"
            >
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${cat.gradient} text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-16 sm:w-16 sm:text-3xl`}>
                {cat.icon}
              </div>
              <h3 className="mt-3 text-center text-xs font-semibold text-slate-800 transition-colors group-hover:text-primary sm:mt-4 sm:text-sm">
                {locale === 'np' ? cat.label_np : cat.label_en}
              </h3>
              <p className="mt-1 text-[11px] text-slate-400 sm:text-xs">
                {locale === 'np' ? cat.label_np : cat.label_en}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}