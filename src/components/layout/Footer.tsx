'use client';

import { BoltIcon } from '@heroicons/react/24/outline';
import { Link } from '@/i18n/navigation';

const footerLinks = {
  shop: [
    { href: '/products', label: 'All Products' },
    { href: '/products?category=wires-cables', label: 'Wires & Cables' },
    { href: '/products?category=lights-fittings', label: 'Lights & Fittings' },
    { href: '/products?category=solar', label: 'Solar Products' },
  ],
  services: [
    { href: '/electricians', label: 'Our Electricians' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Book Service' },
  ],
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/contact', label: 'Contact' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

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
              Powering Kohalpur since 2010. Your trusted electrical store for quality products and professional electrician services.
            </p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-secondary">📞</span>
                <a href="tel:+977XXXXXXXXX" className="hover:text-white transition-colors">+977-XXXXXXXXX</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-secondary">💬</span>
                <a
                  href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '977XXXXXXXXXX'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp Us
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-secondary">📍</span>
                <span>Kohalpur, Banke, Nepal</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">Shop</h3>
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
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">Services</h3>
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
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-4">Company</h3>
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
                <span className="text-secondary">✅</span> 15+ Years Experience
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-secondary">🚚</span> Free Delivery in Banke
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="text-secondary">⭐</span> 500+ Products
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            © {currentYear} Panchamul Bijuli. All rights reserved.
          </p>
          <p className="text-xs text-slate-500">
            Kohalpur, Banke, Nepal 🇳🇵
          </p>
        </div>
      </div>
    </footer>
  );
}
