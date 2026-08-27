'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const SLIDES = [
  {
    tag: "Nepal's #1 Electrical Store",
    headline: 'Power Your Home\n& Business',
    sub: 'Wires, switches, circuit breakers & more — shipped across Nepal.',
    cta: { label: 'Shop Now', href: '/products' },
    alt: { label: 'View Deals →', href: '/products' },
    accent: '#FF6B00',
    bgGlow: 'rgba(255,107,0,0.12)',
    emoji: '⚡',
  },
  {
    tag: 'New Arrivals',
    headline: 'Latest Products\nJust Landed',
    sub: 'Fresh stock from trusted brands. Quality guaranteed with every purchase.',
    cta: { label: 'New Arrivals', href: '/products' },
    alt: { label: 'See All →', href: '/products' },
    accent: '#3B82F6',
    bgGlow: 'rgba(59,130,246,0.10)',
    emoji: '🔌',
  },
  {
    tag: 'Expert Service',
    headline: 'Need a Certified\nElectrician?',
    sub: 'Certified pros in Kohalpur & surrounding areas. Fast, reliable service.',
    cta: { label: 'Find Electrician', href: '/electricians' },
    alt: { label: 'Call Us →', href: 'tel:+9779849401009' },
    accent: '#10B981',
    bgGlow: 'rgba(16,185,129,0.10)',
    emoji: '👷',
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
    setAnimKey((k) => k + 1);
  }, []);

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  return (
    <section className="relative overflow-hidden bg-[#0D0D0D] h-[300px] sm:h-[360px] lg:h-[400px]">
      {/* Animated background glow */}
      <div
        key={`glow-${animKey}`}
        className="absolute inset-0 transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse 60% 80% at 20% 50%, ${slide.bgGlow} 0%, transparent 70%)`,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,107,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.04) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Right emoji panel */}
      <div className="absolute right-0 top-0 bottom-0 w-[45%] flex items-center justify-center pointer-events-none">
        <span
          key={`emoji-${animKey}`}
          className="text-[140px] sm:text-[180px] lg:text-[200px] opacity-[0.07] select-none animate-fade-in"
          style={{ lineHeight: 1 }}
        >
          {slide.emoji}
        </span>
        {/* Right-side gradient mask */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #0D0D0D 0%, transparent 30%)' }} />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div key={`content-${animKey}`} className="max-w-lg animate-slide-up">
            {/* Tag pill */}
            <span
              className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-3"
              style={{
                color: slide.accent,
                borderColor: `${slide.accent}40`,
                backgroundColor: `${slide.accent}18`,
              }}
            >
              {slide.tag}
            </span>

            {/* Headline */}
            <h1
              className="font-heading font-bold text-white leading-tight text-[clamp(1.6rem,4.5vw,2.6rem)]"
              style={{ whiteSpace: 'pre-line' }}
            >
              {slide.headline}
            </h1>

            {/* Sub */}
            <p className="mt-2.5 text-[13px] text-slate-400 leading-relaxed max-w-sm">
              {slide.sub}
            </p>

            {/* CTAs */}
            <div className="mt-5 flex items-center gap-4">
              <Link href={slide.cta.href}>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                  style={{ backgroundColor: slide.accent, boxShadow: `0 4px 20px ${slide.accent}50` }}
                >
                  {slide.cta.label}
                </button>
              </Link>
              <Link
                href={slide.alt.href}
                className="text-[12px] font-semibold text-slate-400 hover:text-white transition-colors"
              >
                {slide.alt.label}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Left arrow */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {/* Right arrow */}
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              backgroundColor: i === current ? slide.accent : 'rgba(255,255,255,0.25)',
            }}
          />
        ))}
      </div>

      {/* Bottom border accent */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </section>
  );
}
