'use client';

import { useState, useEffect } from 'react';
import { createPublicClient } from '@/lib/supabase/client';

type PaymentData = {
  method: string;
  count: number;
  revenue: number;
};

const METHOD_LABELS: Record<string, string> = {
  cod:           'Cash on Delivery',
  esewa:         'eSewa',
  khalti:        'Khalti',
  bank_transfer: 'Bank Transfer',
};

const METHOD_COLORS: Record<string, string> = {
  cod:           '#6366f1',
  esewa:         '#10b981',
  khalti:        '#8b5cf6',
  bank_transfer: '#f59e0b',
};

export default function PaymentBreakdown() {
  const [data, setData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createPublicClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('payment_method, total');

    const grouped: Record<string, { count: number; revenue: number }> = {};
    orders?.forEach(o => {
      const m = o.payment_method || 'cod';
      if (!grouped[m]) grouped[m] = { count: 0, revenue: 0 };
      grouped[m].count += 1;
      grouped[m].revenue += Number(o.total);
    });

    const result = Object.entries(grouped)
      .map(([method, v]) => ({ method, ...v }))
      .sort((a, b) => b.count - a.count);

    setData(result);
    setLoading(false);
  };

  const total = data.reduce((s, d) => s + d.count, 0);

  // Build donut segments
  const segments = (() => {
    let offset = 0;
    return data.map(d => {
      const pct = (d.count / Math.max(total, 1)) * 100;
      const seg = { ...d, pct, offset };
      offset += pct;
      return seg;
    });
  })();

  const RADIUS = 36;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60">
      <h2 className="text-lg font-bold text-slate-800 mb-6">Payment Methods</h2>

      {loading ? (
        <div className="h-48 rounded-xl bg-slate-100 animate-pulse" />
      ) : total === 0 ? (
        <p className="text-center text-slate-400 py-12">No orders yet</p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-8">
          {/* Donut chart */}
          <div className="relative shrink-0">
            <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
              {segments.map((seg, i) => (
                <circle
                  key={seg.method}
                  r={RADIUS}
                  cx="60"
                  cy="60"
                  fill="none"
                  stroke={METHOD_COLORS[seg.method] || '#94a3b8'}
                  strokeWidth="22"
                  strokeDasharray={`${(seg.pct / 100) * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={-((seg.offset / 100) * CIRCUMFERENCE)}
                  strokeLinecap="butt"
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-slate-900">{total}</p>
              <p className="text-[10px] text-slate-400">orders</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3 w-full">
            {segments.map(seg => (
              <div key={seg.method} className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: METHOD_COLORS[seg.method] || '#94a3b8' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {METHOD_LABELS[seg.method] || seg.method}
                    </span>
                    <span className="text-xs text-slate-500 shrink-0 ml-2">
                      {seg.count} ({seg.pct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${seg.pct}%`,
                        backgroundColor: METHOD_COLORS[seg.method] || '#94a3b8',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
