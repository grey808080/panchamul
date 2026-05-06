'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*');
    if (data) {
      const formatted = data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
      setSettings(formatted);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from('site_settings').upsert({ key, value });
    }
    
    setSaving(false);
    alert('Settings saved successfully!');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Site Settings</h1>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.phone || ''}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={settings.whatsapp || ''}
                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={settings.email || ''}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Store Address</label>
              <textarea
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={2}
                className="w-full rounded-xl border border-slate-200 px-4 py-2"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Announcement Banner</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  checked={settings.banner_active === 'true'}
                  onChange={(e) => setSettings({ ...settings, banner_active: e.target.checked.toString() })}
                  className="h-5 w-5 rounded text-primary"
                />
                <span className="font-medium text-slate-700">Show Announcement Banner</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Banner Text (English)</label>
              <input
                type="text"
                value={settings.banner_text || ''}
                onChange={(e) => setSettings({ ...settings, banner_text: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Banner Text (Nepali)</label>
              <input
                type="text"
                value={settings.banner_text_np || ''}
                onChange={(e) => setSettings({ ...settings, banner_text_np: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
