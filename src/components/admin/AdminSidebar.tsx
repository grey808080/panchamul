'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  PhotoIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { createPublicClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
  { name: 'Electricians', href: '/admin/electricians', icon: UserGroupIcon },
  { name: 'Gallery', href: '/admin/gallery', icon: PhotoIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createPublicClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-slate-300 shrink-0">
      <div className="flex h-16 items-center justify-center border-b border-slate-800 px-4">
        <Link href="/en" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BoltIcon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Panchamul Bijuli</p>
            <p className="text-[10px] text-slate-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 text-slate-400" />
          Log Out
        </button>
      </div>
    </div>
  );
}



// src/components/admin/AdminSidebar.tsx
// Add this at the bottom of the file — mobile bottom nav

export function AdminBottomNav() {
  const pathname = usePathname();

  const tabs = [
    { name: 'Home', href: '/admin', icon: HomeIcon },
    { name: 'Products', href: '/admin/products', icon: ShoppingBagIcon },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCartIcon },
    { name: 'Team', href: '/admin/electricians', icon: UserGroupIcon },
    { name: 'More', href: '/admin/settings', icon: Cog6ToothIcon },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200 flex lg:hidden">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href ||
          (tab.href !== '/admin' && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <tab.icon className={`h-5 w-5 mb-0.5 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}