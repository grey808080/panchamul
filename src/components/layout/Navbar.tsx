'use client';

import { ShoppingCartIcon, Bars3Icon, XMarkIcon, UserCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuth } from '@/lib/hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import CartDrawer from '../cart/CartDrawer';
import AuthModal from '../ui/AuthModal';

const navLinks = [
  { href: '/',             key: 'home' },
  { href: '/products',     key: 'products' },
  { href: '/electricians', key: 'electricians' },
  { href: '/services',     key: 'services' },
  { href: '/contact',      key: 'contact' },
] as const;

// PB monogram + lightning bolt logo
function PBLogo() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="4" fill="#FF6B00"/>
      {/* P */}
      <text x="3" y="26" fontFamily="Rajdhani, Inter, sans-serif" fontWeight="700" fontSize="18" fill="white">P</text>
      {/* B */}
      <text x="16" y="26" fontFamily="Rajdhani, Inter, sans-serif" fontWeight="700" fontSize="18" fill="white">B</text>
      {/* Lightning bolt accent */}
      <path d="M30 6 L26 16 L29 16 L25 30 L32 17 L28.5 17 L33 6Z" fill="white" opacity="0.9"/>
    </svg>
  );
}

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);
  const displayCount = mounted ? itemCount : 0;

  return (
    <>
      {/* Orange accent line — industrial identity marker */}

      <header className="fixed inset-x-0 top-0 z-40 bg-surface-bg border-b border-surface-border">

        {/* Main nav */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <PBLogo />
              <div className="hidden sm:block">
                <p className="font-heading text-sm font-bold text-ink-primary leading-tight tracking-wide">
                  PANCHAMUL BIJULI
                </p>
                <p className="font-nepali text-[11px] text-primary leading-tight">
                  पञ्चमूल बिजुली भण्डार
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(({ href, key }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={key}
                    href={href}
                    className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'text-primary border-b-2 border-primary'
                        : 'text-ink-secondary hover:text-ink-primary'
                    }`}
                  >
                    {t(key)}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              <LanguageSwitcher />

              {/* Auth */}
              {!loading && (
                user ? (
                  <Link
                    href="/account"
                    className="flex h-8 w-8 items-center justify-center rounded text-ink-secondary hover:bg-surface-elevated hover:text-primary transition-colors"
                  >
                    <UserCircleIcon className="h-5 w-5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="hidden sm:flex items-center gap-1.5 h-8 rounded bg-primary px-3 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-primary-light transition-colors"
                  >
                    Sign In
                  </button>
                )
              )}

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex h-8 w-8 items-center justify-center rounded text-ink-secondary hover:bg-surface-elevated hover:text-primary transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {displayCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {displayCount > 99 ? '99+' : displayCount}
                  </span>
                )}
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-8 w-8 items-center justify-center rounded text-ink-secondary hover:bg-surface-elevated lg:hidden"
              >
                {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="border-t border-surface-border bg-surface-card px-4 pb-4 pt-2 lg:hidden">
            <nav className="flex flex-col gap-0.5">
              {navLinks.map(({ href, key }) => {
                const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                return (
                  <Link
                    key={key}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-2.5 rounded text-sm font-semibold uppercase tracking-wider transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary border-l-2 border-primary'
                        : 'text-ink-secondary hover:bg-surface-elevated hover:text-ink-primary'
                    }`}
                  >
                    {t(key)}
                  </Link>
                );
              })}

              {!loading && (
                user ? (
                  <div className="mt-3 pt-3 border-t border-surface-border flex items-center justify-between px-4">
                    <span className="text-xs text-ink-muted truncate">{user.email}</span>
                    <button onClick={signOut} className="text-xs text-red-400 font-semibold">Sign out</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                    className="mt-3 w-full rounded bg-primary py-2.5 text-sm font-bold uppercase tracking-wider text-white"
                  >
                    Sign In / Register
                  </button>
                )
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer — accent line (2px) + main nav (56px) = 58px on all sizes */}
      <div className="h-[56px]" />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
