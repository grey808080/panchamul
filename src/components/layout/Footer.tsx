'use client';

import { BoltIcon } from '@heroicons/react/24/outline';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();
  const mapUrl =
    'https://www.google.com/maps/place/Panchamul+Bijuli+Bhandar/@28.1977792,81.7001386,17z/data=!3m1!4b1!4m6!3m5!1s0x39986fa9a7aa7f9f:0xc7a8dcc50b9d2fd1!8m2!3d28.1977792!4d81.7001386!16s%2Fg%2F11rf6r7b9p?hl=en-US&entry=ttu';

  const footerLinks = {
    shop: [
      { href: '/products', label: t('allProducts') },
      { href: '/products?category=wires-cables', label: t('wiresAndCables') },
      { href: '/products?category=lights-fittings', label: t('lightsAndFittings') },
      { href: '/products?category=solar', label: t('solar') },
    ],
    services: [
      { href: '/electricians', label: t('ourElectricians') },
      { href: '/services', label: t('services') },
      { href: '/contact', label: t('bookService') },
    ],
    company: [
      { href: '/about', label: t('aboutUs') },
      { href: '/gallery', label: t('gallery') },
      { href: '/contact', label: t('contact') },
    ],
  };

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light shadow-lg">
                <BoltIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-white leading-tight">Panchamul Bijuli</p>
                <p className="text-xs text-slate-400 leading-tight">Kohalpur, Banke</p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              {t('tagline')}
            </p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-secondary">📞</span>
                <a href="tel:+9779849401009" className="hover:text-white transition-colors">+977-9849401009</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-secondary">💬</span>
                
                  <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '9849401009'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {t('whatsapp')}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-secondary">📍</span>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Panchamul Bijuli Bhandar, Kohalpur
                </a>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">{t('shop')}</h3>
            <ul className="space-y-2.5">
              {footerLinks.shop.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">{t('services')}</h3>
            <ul className="space-y-2.5">
              {footerLinks.services.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">{t('company')}</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Trust Badges */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-secondary">✅</span> {t('yearsExp')}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-secondary">🚚</span> {t('freeDelivery')}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-secondary">⭐</span> {t('products')}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {currentYear} Panchamul Bijuli. {t('rights')}
          </p>
          <p className="text-xs text-slate-500">
            Kohalpur, Banke, Nepal 🇳🇵
          </p>
        </div>
      </div>
    </footer>
  );
}