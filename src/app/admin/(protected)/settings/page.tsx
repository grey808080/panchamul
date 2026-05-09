'use client';

import { useState, useEffect } from 'react';
import { createPublicClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';
import { saveSettings, loadSettings } from './actions';
import {
  PhoneIcon,
  MapPinIcon,
  MegaphoneIcon,
  ClockIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const SETTINGS_FIELDS = [
  {
    section: 'Contact Information',
    icon: PhoneIcon,
    fields: [
      { key: 'phone_number', label: 'Phone Number', placeholder: '9779849401009', type: 'text' },
      { key: 'whatsapp_number', label: 'WhatsApp Number', placeholder: '9779849401009', type: 'text', hint: 'Include country code e.g. 977XXXXXXXXXX' },
      { key: 'email', label: 'Email Address', placeholder: 'panchamulbijuli@gmail.com', type: 'email' },
    ],
  },
  {
    section: 'Store Details',
    icon: MapPinIcon,
    fields: [
      { key: 'store_address', label: 'Store Address', placeholder: 'Kohalpur, Banke, Nepal', type: 'textarea' },
      { key: 'business_hours', label: 'Business Hours', placeholder: 'Sun-Fri: 7AM-7PM, Sat: 8AM-4PM', type: 'text' },
    ],
  },
  {
    section: 'Delivery',
    icon: TruckIcon,
    fields: [
      { key: 'delivery_zones', label: 'Delivery Zones', placeholder: 'Kohalpur, Banke', type: 'text', hint: 'Comma separated areas' },
    ],
  },
  {
    section: 'Announcement Banner',
    icon: MegaphoneIcon,
    fields: [
      { key: 'announcement_banner', label: 'Banner Text (English)', placeholder: 'Free delivery across Kohalpur!', type: 'text' },
      { key: 'announcement_banner_np', label: 'Banner Text (Nepali)', placeholder: 'कोहलपुरमा निःशुल्क डेलिभरी!', type: 'text' },
      { key: 'banner_active', label: 'Show Banner', placeholder: '', type: 'checkbox' },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const supabase = createPublicClient();

  useEffect(() => {
    loadSettings().then((data) => { setSettings(data); setLoading(false); });
    supabase.auth.getUser().then(({ data }) => setAdminUser(data.user));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const result = await saveSettings(settings);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Settings saved successfully!');
    }
    setSaving(false);
  };

  const update = (key: string, value: string) =>
    setSettings(prev => ({ ...prev, [key]: value }));

  if (loading) return (
    <div className="space-y-4 max-w-2xl">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-40 rounded-2xl bg-slate-200 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Site Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your store's contact info, delivery zones, and announcements
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        {SETTINGS_FIELDS.map(({ section, icon: Icon, fields }) => (
          <div key={section} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-base font-bold text-slate-800">{section}</h2>
            </div>

            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="label">{field.label}</label>

                  {field.type === 'checkbox' ? (
                    <label className="flex items-center gap-3 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={settings[field.key] === 'true'}
                        onChange={(e) => update(field.key, e.target.checked.toString())}
                        className="h-5 w-5 rounded text-primary focus:ring-primary/30"
                      />
                      <span className="text-sm text-slate-600">
                        Show announcement banner on website
                      </span>
                    </label>
                  ) : field.type === 'textarea' ? (
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
              ))}
            </div>
          </div>
        ))}

        {/* Admin Account */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <ClockIcon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Admin Account</h2>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            <p>Logged in as <span className="font-semibold text-slate-900">{adminUser?.email ?? '—'}</span></p>
            <p className="mt-1 text-slate-400 text-xs">To change password, use Supabase dashboard → Authentication → Users</p>
          </div>
        </div>

        <div className="flex justify-end pb-6">
          <Button type="submit" size="lg" disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}