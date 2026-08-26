'use client';

import { useEffect, useState } from 'react';
import { createPublicClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { BellIcon } from '@heroicons/react/24/outline';

/**
 * Subscribes to new orders via Supabase Realtime.
 * Shows a pulsing badge with the count of new orders since the page loaded,
 * and a toast notification for each new order.
 *
 * Requires the `orders` table to have Realtime enabled in Supabase dashboard:
 * Database → Replication → supabase_realtime → orders (INSERT)
 */
export default function NewOrdersBadge() {
  const [newCount, setNewCount] = useState(0);
  const supabase = createPublicClient();

  useEffect(() => {
    const channel = supabase
      .channel('admin-new-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const order = payload.new as { order_number?: string; customer_name?: string };
          setNewCount((c) => c + 1);
          toast(
            (t) => (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <BellIcon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">New Order!</p>
                  <p className="text-xs text-slate-500">
                    {order.customer_name ?? 'A customer'} — {order.order_number ?? ''}
                  </p>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="ml-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
            ),
            { duration: 8000 }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (newCount === 0) return null;

  return (
    <span className="relative flex h-5 w-5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
        {newCount > 9 ? '9+' : newCount}
      </span>
    </span>
  );
}
