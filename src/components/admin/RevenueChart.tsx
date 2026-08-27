'use client';

import { useState, useEffect } from 'react';
import { createPublicClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils/formatPrice';

type DayData = {
  day: string;
  revenue: number;
  order_count: number;
};

type Period = '7d' | '30d' | '90d';

const PERIOD_LABELS: Record<Period, string> = {
  '7d':  '7d',
  '30d': '30d',
  '90d': '90d',
};

export default function RevenueChart() {
  const [period, setPeriod] = useState<Period>('30d');
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [delta, setDelta] = useState<number | null>(null);
  const supabase = createPublicClient();

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    const days = parseInt(period);

    const from = new Date();
    from.setDate(from.getDate() - days);

    const prevFrom = new Date();
    prevFrom.setDate(prevFrom.getDate() - days * 2);
    const prevTo = new Date();
    prevTo.setDate(prevTo.getDate() - days);

    const [{ data: current }, { data: previous }] = await Promise.all([
      supabase
        .from('orders')
        .select('created_at, total')
        .eq('status', 'delivered')
        .gte('created_at', from.toISOString()),
      supabase
        .from('orders')
        .select('total')
        .eq('status', 'delivered')
        .gte('created_at', prevFrom.toISOString())
        .lt('created_at', prevTo.toISOString()),
    ]);

    // Fill all days in range with 0
    const grouped: Record<string, { revenue: number; count: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      grouped[d.toISOString().split('T')[0]] = { revenue: 0, count: 0 };
    }

    current?.forEach(order => {
      const key = order.created_at.split('T')[0];
      if (grouped[key]) {
        grouped[key].revenue += Number(order.total);
        grouped[key].count += 1;
      }
    });

    setData(
      Object.entries(grouped).map(([day, v]) => ({
        day,
        revenue: v.revenue,
        order_count: v.count,
      }))
    );

    const currentTotal = current?.reduce((s, o) => s + Number(o.total), 0) || 0;
    const prevTotal    = previous?.reduce((s, o) => s + Number(o.total), 0) || 0;
    setDelta(prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : null);
    setLoading(false);
  };

  const maxRevenue   = Math.max(...data.map(d => d.revenue), 1);
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);

  const formatDay = (day: string) => {
    const d = new Date(day + 'T00:00:00');
    if (period === '7d') return d.toLocaleDateString('en', { weekday: 'short' });
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  };

  // Compact Rs label for y-axis (no space, shorter)
  const shortPrice = (n: number) => {
    if (n >= 100000) return `${(n / 100000).toFixed(1)}L`;
    if (n >= 1000)   return `${(n / 1000).toFixed(0)}k`;
    return String(Math.round(n));
  };

  const labelStep = period === '7d' ? 1 : period === '30d' ? 5 : 10;

  return (
    <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-slate-200/60">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Revenue</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xl sm:text-2xl font-bold text-slate-900">{formatPrice(totalRevenue)}</span>
            {delta !== null && (
              <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                delta >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center gap-0.5 rounded-xl bg-slate-100 p-1 shrink-0">
          {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                period === p
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
      ) : (
        <div className="flex gap-2">
          {/* Y-axis — compact labels */}
          <div className="flex flex-col justify-between text-[10px] text-slate-400 text-right shrink-0 w-8 pb-5 select-none">
            <span>Rs {shortPrice(maxRevenue)}</span>
            <span>Rs {shortPrice(maxRevenue / 2)}</span>
            <span>0</span>
          </div>

          {/* Bar area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-end gap-px h-40 border-b border-slate-100">
              {data.map((d) => {
                const heightPct = (d.revenue / maxRevenue) * 100;
                return (
                  <div
                    key={d.day}
                    className="group relative flex-1 flex flex-col justify-end"
                  >
                    {/* Tooltip — show above on hover */}
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <div className="bg-slate-900 text-white text-[10px] rounded-lg px-2 py-1.5 whitespace-nowrap shadow-xl">
                        <p className="font-bold">{formatPrice(d.revenue)}</p>
                        <p className="text-slate-400">{d.order_count} orders</p>
                      </div>
                      <div className="w-1.5 h-1.5 bg-slate-900 rotate-45 mx-auto -mt-0.5" />
                    </div>

                    {/* Bar */}
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        d.revenue > 0 ? 'bg-primary/70 group-hover:bg-primary' : 'bg-slate-100'
                      }`}
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="flex gap-px mt-1">
              {data.map((d, i) => (
                <div key={d.day} className="flex-1 text-center overflow-hidden">
                  {i % labelStep === 0 && (
                    <span className="text-[9px] text-slate-400 leading-none">
                      {formatDay(d.day)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
