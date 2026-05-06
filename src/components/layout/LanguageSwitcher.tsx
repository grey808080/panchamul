'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'np' : 'en';
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      onClick={toggleLocale}
      disabled={isPending}
      className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-primary/30 hover:text-primary hover:shadow-md disabled:opacity-50"
      title={locale === 'en' ? 'Switch to Nepali' : 'Switch to English'}
    >
      <span className="text-sm">{locale === 'en' ? '🇳🇵' : '🇬🇧'}</span>
      <span>{locale === 'en' ? 'NP' : 'EN'}</span>
    </button>
  );
}
