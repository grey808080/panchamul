'use client';

import { ShoppingCartIcon, Bars3Icon, XMarkIcon, BoltIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useAuth } from '@/lib/hooks/useAuth';
import LanguageSwitcher from './LanguageSwitcher';
import CartDrawer from '../cart/CartDrawer';
import AuthModal from '../ui/AuthModal';

const navLinks = [
  { href: '/products', key: 'products' },
  { href: '/electricians', key: 'electricians' },
  { href: '/services', key: 'services' },
  { href: '/contact', key: 'contact' },
] as const;

export default function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-white/95 shadow-md backdrop-blur-sm' : 'bg-white shadow-sm'
      }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light shadow-lg">
                <BoltIcon className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">Panchamul Bijuli</p>
                <p className="text-[10px] text-slate-400 leading-tight">Kohalpur ko Bijuli Ghar</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ href, key }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link key={key} href={href} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}>
                    {t(key)}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />

              {/* Auth Button */}
              {!loading && (
                user ? (
                  <div className="relative group">
                    <Link href="/account" className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors">
                      <UserCircleIcon className="h-6 w-6" />
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="hidden sm:flex items-center gap-1.5 h-9 rounded-xl bg-primary px-3 text-xs font-semibold text-white hover:bg-primary-dark transition-colors"
                  >
                    Sign In
                  </button>
                )
              )}

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                {mobileOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, key }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link key={key} href={href} onClick={() => setMobileOpen(false)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                    }`}>
                    {t(key)}
                  </Link>
                );
              })}
              {/* Mobile auth */}
              {!loading && (
                user ? (
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between px-4">
                    <span className="text-sm text-slate-500 truncate">{user.email}</span>
                    <button onClick={signOut} className="text-sm text-red-500 font-medium">Sign out</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setMobileOpen(false); setAuthOpen(true); }}
                    className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white"
                  >
                    Sign In / Register
                  </button>
                )
              )}
            </nav>
          </div>
        )}
      </header>

      <div className="h-16" />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
}
