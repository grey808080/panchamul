'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

const STATUS_OPTIONS = [
  { key: '', label: 'All Statuses' },
  { key: 'received', label: 'Received' },
  { key: 'processing', label: 'Processing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'cod', label: 'Cash on Delivery' },
  { key: 'bank_transfer', label: 'Bank Transfer' },
  { key: 'esewa', label: 'eSewa' },
  { key: 'khalti', label: 'Khalti' },
];

interface Props { status: string; payment: string; q: string; }

export default function OrdersFilters({ status, payment, q }: Props) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(q);
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  // Debounce search → push URL
  useEffect(() => {
    if (!isMounted.current) { isMounted.current = true; return; }
    const timer = setTimeout(() => {
      const sp = new URLSearchParams();
      if (searchValue.trim()) sp.set('q', searchValue.trim());
      if (status) sp.set('status', status);
      if (payment) sp.set('payment', payment);
      const qs = sp.toString();
      router.push(`/admin/orders${qs ? `?${qs}` : ''}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchValue]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilters(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function buildUrl(overrides: Record<string, string | null>) {
    const sp = new URLSearchParams();
    const merged = { q: searchValue.trim(), status, payment, ...overrides };
    if (merged.q) sp.set('q', merged.q);
    if (merged.status) sp.set('status', merged.status);
    if (merged.payment) sp.set('payment', merged.payment);
    const qs = sp.toString();
    return `/admin/orders${qs ? `?${qs}` : ''}`;
  }

  const activeFilterCount = [status, payment].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2 mb-6">
      {/* Search — primary */}
      <div className="relative flex-1">
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder="Search by name, phone, or order #…"
          className="input-field pl-9 pr-8"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter icon */}
      <div className="relative" ref={filterRef}>
        <button
          onClick={() => setShowFilters(v => !v)}
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
            activeFilterCount > 0 || showFilters
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="absolute right-0 top-12 z-30 w-72 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200/80">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Filters</p>

            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-slate-600">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUS_OPTIONS.map(opt => (
                  <Link
                    key={opt.key}
                    href={buildUrl({ status: opt.key || null })}
                    onClick={() => setShowFilters(false)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      status === opt.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-600">Payment</p>
              <div className="flex flex-wrap gap-1.5">
                {PAYMENT_OPTIONS.map(opt => (
                  <Link
                    key={opt.key}
                    href={buildUrl({ payment: opt.key || null })}
                    onClick={() => setShowFilters(false)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      payment === opt.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <Link
                  href={buildUrl({ status: null, payment: null })}
                  onClick={() => setShowFilters(false)}
                  className="text-xs font-medium text-red-500 hover:text-red-600"
                >
                  Clear all filters
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
