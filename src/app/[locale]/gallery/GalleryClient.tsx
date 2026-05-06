'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { GalleryItem } from '@/types/database';

interface GalleryClientProps {
  items: GalleryItem[];
}

export default function GalleryClient({ items }: GalleryClientProps) {
  const t = useTranslations('gallery');
  const [filter, setFilter] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const filtered = filter ? items.filter((i) => i.type === filter) : items;

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <span className="text-5xl mb-4 block">📸</span>
        <h2 className="text-xl font-semibold text-slate-700">{t('noItems')}</h2>
      </div>
    );
  }

  return (
    <>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8">
        {[null, 'store', 'work'].map((type) => (
          <button
            key={type || 'all'}
            onClick={() => setFilter(type)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              filter === type ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {type ? t(`type_${type}`) : t('all')}
          </button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="mb-4 break-inside-avoid cursor-pointer group"
            onClick={() => setLightbox(item)}
          >
            <div className="relative overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/60 transition-all duration-300 group-hover:shadow-xl group-hover:ring-primary/30">
              <Image
                src={item.image_url}
                alt={item.caption || 'Gallery image'}
                width={400}
                height={300}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {item.caption && (
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="p-4 text-sm font-medium text-white">{item.caption}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors" onClick={() => setLightbox(null)}>
            <XMarkIcon className="h-6 w-6" />
          </button>
          <Image
            src={lightbox.image_url}
            alt={lightbox.caption || 'Gallery image'}
            width={1200}
            height={800}
            className="max-h-[85vh] w-auto rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {lightbox.caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-6 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {lightbox.caption}
            </p>
          )}
        </div>
      )}
    </>
  );
}
