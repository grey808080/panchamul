'use client';

import { useState, useEffect, useRef } from 'react';
import { createPublicClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';
import { saveSettings, loadSettings } from './actions';
import {
  PhoneIcon,
  MapPinIcon,
  MegaphoneIcon,
  TruckIcon,
  UserCircleIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────────────────────────
type FieldDef =
  | { key: string; label: string; placeholder: string; type: 'text' | 'email' | 'url' | 'number' | 'textarea'; hint?: string; span?: 'full' | 'half' }
  | { key: string; label: string; sublabel: string; type: 'toggle' };

interface Section {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: FieldDef[];
}

// ─── Sections config ──────────────────────────────────────────────────────────
const SECTIONS: Section[] = [
  {
    id: 'contact',
    title: 'Contact',
    description: 'Displayed across the website and used for customer communication',
    icon: PhoneIcon,
    fields: [
      { key: 'phone_number',     label: 'Phone Number',            placeholder: '9849401009',                              type: 'text',   span: 'half' },
      { key: 'whatsapp_number',  label: 'WhatsApp Number',         placeholder: '9779849401009',                           type: 'text',   span: 'half', hint: 'Include country code — e.g. 977XXXXXXXXXX' },
      { key: 'email',            label: 'Email Address',           placeholder: 'panchamulbijuli@gmail.com',               type: 'email',  span: 'half' },
      { key: 'whatsapp_greeting',label: 'WhatsApp Greeting',       placeholder: 'Hello! I am interested in your products.', type: 'text',  span: 'half', hint: 'Pre-filled message when customers tap the WhatsApp bubble' },
    ],
  },
  {
    id: 'store',
    title: 'Store',
    description: 'Physical location and opening hours shown in the footer',
    icon: MapPinIcon,
    fields: [
      { key: 'store_address',  label: 'Store Address',  placeholder: 'Kohalpur, Banke, Nepal',       type: 'textarea', span: 'full' },
      { key: 'business_hours', label: 'Business Hours', placeholder: 'Sun–Fri: 7AM–7PM, Sat: 8AM–4PM', type: 'text', span: 'full' },
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery',
    description: 'Control delivery fees and free delivery eligibility',
    icon: TruckIcon,
    fields: [
      { key: 'delivery_zones',          label: 'Delivery Zones',            placeholder: 'Kohalpur, Banke',  type: 'text',   span: 'full', hint: 'Comma-separated areas shown to customers' },
      { key: 'delivery_charge',         label: 'Delivery Charge (NPR)',      placeholder: '100',              type: 'number', span: 'half', hint: 'Flat fee applied to all orders' },
      { key: 'free_delivery_threshold', label: 'Free Delivery Above (NPR)',  placeholder: '2000',             type: 'number', span: 'half', hint: 'Leave empty to disable free delivery' },
      { key: 'cod_enabled',             label: 'Cash on Delivery',           sublabel: 'Allow customers to pay cash on delivery', type: 'toggle' },
    ],
  },
  {
    id: 'announcement',
    title: 'Banner',
    description: 'A dismissible banner shown at the top of every page',
    icon: MegaphoneIcon,
    fields: [
      { key: 'banner_active',           label: 'Show Banner',               sublabel: 'Display the announcement banner on the website', type: 'toggle' },
      { key: 'announcement_banner',     label: 'Banner Text (English)',      placeholder: 'Free delivery across Kohalpur!',             type: 'text', span: 'half' },
      { key: 'announcement_banner_np',  label: 'Banner Text (Nepali)',       placeholder: 'कोहलपुरमा निःशुल्क डेलिभरी!',               type: 'text', span: 'half' },
    ],
  },
  {
    id: 'social',
    title: 'Social',
    description: 'Links shown in the footer and about page',
    icon: ShareIcon,
    fields: [
      { key: 'facebook_url',  label: 'Facebook',  placeholder: 'https://facebook.com/panchamulbijuli',  type: 'url', span: 'half' },
      { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/panchamulbijuli', type: 'url', span: 'half' },
      { key: 'tiktok_url',    label: 'TikTok',    placeholder: 'https://tiktok.com/@panchamulbijuli',   type: 'url', span: 'half' },
    ],
  },
];

const ALL_NAV = [
  ...SECTIONS.map(s => ({ id: s.id, title: s.title, icon: s.icon })),
  { id: 'account', title: 'Account', icon: UserCircleIcon },
];

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange, label, sublabel }: {
  checked: boolean; onChange: (v: boolean) => void; label: string; sublabel: string;
}) {
  return (
    <div className="col-span-2 flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
          checked ? 'bg-primary' : 'bg-slate-200',
        ].join(' ')}
      >
        <span className={[
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')} />
      </button>
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ section, settings, update }: {
  section: Section;
  settings: Record<string, string>;
  update: (k: string, v: string) => void;
}) {
  const Icon = section.icon;
  return (
    <div id={section.id} className="scroll-mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200 shadow-sm">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">{section.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">{section.description}</p>
        </div>
      </div>

      {/* Fields grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {section.fields.map((field) => {
          if (field.type === 'toggle') {
            return (
              <ToggleSwitch
                key={field.key}
                checked={settings[field.key] === 'true'}
                onChange={(v) => update(field.key, String(v))}
                label={field.label}
                sublabel={field.sublabel}
              />
            );
          }

          const colClass = field.span === 'full' ? 'col-span-2' : 'col-span-2 sm:col-span-1';

          return (
            <div key={field.key} className={colClass}>
              <label className="label">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  value={settings[field.key] || ''}
                  onChange={(e) => update(field.key, e.target.value)}
                  rows={2}
                  placeholder={field.placeholder}
                  className="input-field"
                />
              ) : (
                <input
                  type={field.type}
                  value={settings[field.key] || ''}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="input-field"
                />
              )}
              {field.hint && (
                <p className="text-xs text-slate-400 mt-1">{field.hint}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('contact');
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const supabase = createPublicClient();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSettings().then((data) => { setSettings(data); setLoading(false); });
    supabase.auth.getUser().then(({ data }) => setAdminUser(data.user));
  }, []);

  // Highlight active nav item as user scrolls
  useEffect(() => {
    const sections = document.querySelectorAll('[data-section]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.getAttribute('data-section') ?? '');
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px' }
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await saveSettings(settings);
    if (result.error) toast.error(result.error);
    else toast.success('Settings saved!');
    setSaving(false);
  };

  const update = (key: string, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  if (loading) return (
    <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
      <div className="hidden lg:flex flex-col gap-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSave}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-xs text-slate-400 mt-0.5">Manage your store's contact info, delivery, and appearance</p>
      </div>

      {/* Mobile nav — horizontal scrollable pills */}
      <div className="lg:hidden mb-5 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {ALL_NAV.map(({ id, title, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className={[
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                activeSection === id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              <Icon className="h-3 w-3" />
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="grid gap-8 lg:grid-cols-[200px_1fr] lg:items-start">

        {/* ── Left sidebar nav (desktop only, sticky) ── */}
        <nav className="hidden lg:flex flex-col gap-1 sticky top-4">
          {ALL_NAV.map(({ id, title, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className={[
                'flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-150 text-left w-full',
                activeSection === id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
              ].join(' ')}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {title}
            </button>
          ))}

          {/* Save button in sidebar on desktop */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <Button type="submit" disabled={saving} className="w-full justify-center">
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </nav>

        {/* ── Right content area ── */}
        <div ref={contentRef} className="space-y-5 pb-24 lg:pb-8">
          {SECTIONS.map((section) => (
            <div key={section.id} data-section={section.id}>
              <SectionCard section={section} settings={settings} update={update} />
            </div>
          ))}

          {/* Admin Account card */}
          <div id="account" data-section="account" className="scroll-mt-4 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/60">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white ring-1 ring-slate-200 shadow-sm">
                <UserCircleIcon className="h-4 w-4 text-slate-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Account</h2>
                <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Your admin login session</p>
              </div>
            </div>
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">{adminUser?.email ?? '—'}</p>
                <p className="text-xs text-slate-400 mt-0.5">To change password, use the Supabase dashboard</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="shrink-0 self-start sm:self-auto rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky save bar */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 z-30 px-4 py-3 bg-white/90 backdrop-blur border-t border-slate-200 flex items-center gap-3">
        <p className="text-xs text-slate-400 flex-1">Changes apply after saving.</p>
        <Button type="submit" disabled={saving} size="sm">
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}