'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();
  const mapUrl = 'https://www.google.com/maps/place/Panchamul+Bijuli+Bhandar/@28.1977792,81.7001386,17z';

  const footerLinks = {
    shop: [
      { href: '/products',                          label: t('allProducts') },
      { href: '/products?category=wires-cables',    label: t('wiresAndCables') },
      { href: '/products?category=lights-fittings', label: t('lightsAndFittings') },
      { href: '/products?category=solar',           label: t('solar') },
    ],
    services: [
      { href: '/electricians', label: t('ourElectricians') },
      { href: '/services',     label: t('services') },
      { href: '/contact',      label: t('bookService') },
    ],
    company: [
      { href: '/about',   label: t('aboutUs') },
      { href: '/gallery', label: t('gallery') },
      { href: '/contact', label: t('contact') },
    ],
  };

  return (
    <footer className="bg-surface-card border-t border-surface-border text-ink-secondary">

      {/* Top accent */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand column */}
          <div className="lg:col-span-1">
            {/* Logo text */}
            <Link href="/" className="inline-block mb-4">
              <p className="font-heading text-xl font-700 text-ink-primary leading-tight tracking-wide">PANCHAMUL</p>
              <p className="font-heading text-xl font-700 text-primary leading-tight tracking-widest -mt-1">BIJULI</p>
            </Link>

            <p className="text-sm text-ink-muted leading-relaxed mb-5">
              {t('tagline')}
            </p>

            <div className="space-y-2.5">
              <a
                href="tel:+9779849401009"
                className="flex items-center gap-2 text-sm text-ink-secondary hover:text-primary transition-colors"
              >
                <PhoneIcon className="h-4 w-4 text-primary shrink-0" />
                +977-9849401009
              </a>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '9849401009'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-ink-secondary hover:text-primary transition-colors"
              >
                <svg className="h-4 w-4 text-primary shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                {t('whatsapp')}
              </a>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-ink-secondary hover:text-primary transition-colors"
              >
                <MapPinIcon className="h-4 w-4 text-primary shrink-0" />
                Kohalpur-12, Banke, Nepal
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-heading text-xs font-700 uppercase tracking-widest text-ink-primary mb-4 pb-2 border-b border-surface-border">
              {t('shop')}
            </h3>
            <ul className="space-y-2">
              {footerLinks.shop.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-ink-muted hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading text-xs font-700 uppercase tracking-widest text-ink-primary mb-4 pb-2 border-b border-surface-border">
              {t('services')}
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-ink-muted hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-heading text-xs font-700 uppercase tracking-widest text-ink-primary mb-4 pb-2 border-b border-surface-border">
              {t('company')}
            </h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.company.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-ink-muted hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Trust indicators */}
            <div className="space-y-1.5">
              {[
                { icon: '⚡', text: t('yearsExp') },
                { icon: '🚚', text: t('freeDelivery') },
                { icon: '📦', text: t('products') },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className="text-primary">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-muted">
            © {currentYear} Panchamul Bijuli Bhandar. {t('rights')}
          </p>
          <p className="text-xs text-ink-muted">
            Kohalpur-12, Banke, Nepal 🇳🇵
          </p>
        </div>
      </div>
    </footer>
  );
}
