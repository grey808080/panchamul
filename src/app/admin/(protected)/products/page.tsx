'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPublicClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Button } from '@/components/ui/Button';
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import type { Tables } from '@/types';
import toast from 'react-hot-toast';

type ProductWithCategory = Tables<'products'> & {
  categories: Pick<Tables<'categories'>, 'name_en'> | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState('');
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const supabase = createPublicClient();

  // Close filter dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node))
        setShowFilters(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Extract unique categories from loaded products
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    products.forEach(p => {
      const name = p.categories?.name_en;
      if (name && !seen.has(name)) { seen.add(name); result.push(name); }
    });
    return result;
  }, [products]);

  const activeFilterCount = [selectedCategory, selectedStock, selectedStatus].filter(Boolean).length;

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*, categories(name_en)')
      .order('created_at', { ascending: false });
    setProducts((data as ProductWithCategory[]) || []);
    setLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    // First click: show inline confirmation banner
    if (pendingDelete?.id !== id) {
      setPendingDelete({ id, name });
      return;
    }
    // Confirmed: proceed with delete
    setDeleting(id);
    setPendingDelete(null);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete product');
    } else {
      toast.success(`"${name}" deleted`);
      setProducts(prev => prev.filter(p => p.id !== id));
    }
    setDeleting(null);
  };

  const filtered = products.filter(p => {
    const matchesSearch = !search ||
      p.name_en.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || p.categories?.name_en === selectedCategory;
    const stock = p.stock_qty ?? 0;
    const matchesStock =
      !selectedStock ||
      (selectedStock === 'in_stock'    && stock > 10) ||
      (selectedStock === 'low_stock'   && stock > 0 && stock <= 10) ||
      (selectedStock === 'out_stock'   && stock === 0);
    const matchesStatus =
      !selectedStatus ||
      (selectedStatus === 'active'   && p.is_active) ||
      (selectedStatus === 'draft'    && !p.is_active) ||
      (selectedStatus === 'featured' && p.is_featured);
    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

  if (loading) return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-16 rounded-2xl bg-slate-200 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">{products.length} total products</p>
        </div>
        <Link href="/admin/products/new">
          <Button className="flex items-center gap-2 w-full sm:w-auto">
            <PlusIcon className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Delete confirmation banner */}
      {pendingDelete && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-red-50 p-4 ring-1 ring-red-200">
          <div>
            <p className="font-semibold text-red-800">Delete &ldquo;{pendingDelete.name}&rdquo;?</p>
            <p className="text-sm text-red-600">This cannot be undone.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => handleDelete(pendingDelete.id, pendingDelete.name)}
              disabled={!!deleting}
              className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setPendingDelete(null)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search + Filter row */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 pr-8"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
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

              {/* Category */}
              {categories.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs font-semibold text-slate-600">Category</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[{ key: '', label: 'All' }, ...categories.map(c => ({ key: c, label: c }))].map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => setSelectedCategory(opt.key)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                          selectedCategory === opt.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold text-slate-600">Stock</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: '', label: 'All' },
                    { key: 'in_stock', label: 'In Stock' },
                    { key: 'low_stock', label: 'Low (1–10)' },
                    { key: 'out_stock', label: 'Out of Stock' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedStock(opt.key)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedStock === opt.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="mb-2 text-xs font-semibold text-slate-600">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: '', label: 'All' },
                    { key: 'active', label: 'Active' },
                    { key: 'draft', label: 'Draft' },
                    { key: 'featured', label: '⭐ Featured' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setSelectedStatus(opt.key)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedStatus === opt.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => { setSelectedCategory(''); setSelectedStock(''); setSelectedStatus(''); }}
                    className="text-xs font-medium text-red-500 hover:text-red-600"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Price</th>
              <th className="px-6 py-4 font-medium">Stock</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {product.images?.[0] ? (
                        <Image src={product.images[0]} alt={product.name_en} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl">📦</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 line-clamp-1">{product.name_en}</p>
                      {product.brand && <p className="text-xs text-slate-400">{product.brand}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">
                  {product.categories?.name_en || '—'}
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold">{formatPrice(product.price)}</p>
                  {product.compare_price && (
                    <p className="text-xs text-slate-400 line-through">{formatPrice(product.compare_price)}</p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    (product.stock_qty ?? 0) > 10 ? 'bg-green-100 text-green-800' :
                    (product.stock_qty ?? 0) > 0 ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_qty ?? 0} pcs
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      product.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {product.is_active ? 'Active' : 'Draft'}
                    </span>
                    {product.is_featured && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        ⭐ Featured
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name_en)}
                      disabled={deleting === product.id}
                      className="inline-flex items-center justify-center h-9 w-9 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-slate-500 font-medium">
              {search ? 'No products match your search' : 'No products yet'}
            </p>
            {!search && (
              <Link href="/admin/products/new" className="mt-4 inline-block">
                <Button size="sm">Add First Product</Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((product) => (
          <div key={product.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                {product.images?.[0] ? (
                  <Image src={product.images[0]} alt={product.name_en} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl">📦</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 truncate">{product.name_en}</p>
                <p className="text-xs text-slate-400">{product.categories?.name_en || '—'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-slate-900">{formatPrice(product.price)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    product.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {product.is_active ? 'Active' : 'Draft'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    (product.stock_qty ?? 0) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.stock_qty ?? 0} pcs
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Link href={`/admin/products/${product.id}`} className="flex-1">
                <Button variant="outline" className="w-full text-xs flex items-center justify-center gap-1">
                  <PencilIcon className="h-3.5 w-3.5" /> Edit
                </Button>
              </Link>
              <button
                onClick={() => handleDelete(product.id, product.name_en)}
                disabled={deleting === product.id}
                className="px-4 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors disabled:opacity-50 text-xs font-medium"
              >
                {deleting === product.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-slate-500">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}