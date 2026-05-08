'use client';

import { useEffect, useState } from 'react';
import { createPublicClient } from '@/lib/supabase/client';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import AuthModal from '@/components/ui/AuthModal';
import type { User } from '@supabase/supabase-js';

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const supabase = createPublicClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-slate-400">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">My Account</h1>

        {user ? (
          <div className="space-y-6">
            {/* Profile */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white text-2xl font-bold">
                  {user.user_metadata?.full_name?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    {user.user_metadata?.full_name || 'My Account'}
                  </p>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Member since {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
              <h2 className="text-base font-semibold text-slate-800 mb-4">Quick Links</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href="/account/orders"
                  className="flex items-center gap-3 rounded-xl p-4 hover:bg-slate-50 ring-1 ring-slate-100 transition-colors">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="font-medium text-slate-800">My Orders</p>
                    <p className="text-sm text-slate-500">Track your orders</p>
                  </div>
                </Link>
                <Link href="/products"
                  className="flex items-center gap-3 rounded-xl p-4 hover:bg-slate-50 ring-1 ring-slate-100 transition-colors">
                  <span className="text-2xl">🛒</span>
                  <div>
                    <p className="font-medium text-slate-800">Shop Now</p>
                    <p className="text-sm text-slate-500">Browse products</p>
                  </div>
                </Link>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full rounded-2xl border-2 border-red-200 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200/60 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-4xl">
              👤
            </div>
            <h2 className="text-xl font-bold text-slate-900">Sign in to your account</h2>
            <p className="mt-2 text-slate-500 text-sm">
              Create an account or sign in to track your orders and manage your profile
            </p>
            <Button onClick={() => setShowAuth(true)} className="mt-6 w-full sm:w-auto px-8">
              Sign In / Register
            </Button>
          </div>
        )}
      </div>

      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => supabase.auth.getUser().then(({ data }) => setUser(data.user))}
      />
    </div>
  );
}                             