'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { TrashIcon } from '@heroicons/react/24/outline';
import ImageUploader from '@/components/admin/ImageUploader';

export default function AdminGalleryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const handleUpload = async (urls: string[]) => {
    const newItems = urls.map(url => ({ image_url: url, type: 'store' }));
    await supabase.from('gallery').insert(newItems);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    await supabase.from('gallery').delete().eq('id', id);
    fetchItems();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Gallery Management</h1>
      </div>

      <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Upload New Images</h2>
        <ImageUploader images={[]} onChange={handleUpload} maxFiles={10} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
            <Image src={item.image_url} alt="" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <select 
                className="bg-white text-sm rounded px-2 py-1"
                value={item.type}
                onChange={async (e) => {
                  await supabase.from('gallery').update({ type: e.target.value }).eq('id', item.id);
                  fetchItems();
                }}
              >
                <option value="store">Store</option>
                <option value="work">Work</option>
              </select>
              <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600">
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
