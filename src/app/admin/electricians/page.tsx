'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPublicClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import {
  PlusIcon, PencilIcon, XMarkIcon,
  ArrowPathIcon, PhotoIcon
} from '@heroicons/react/24/outline';

type Electrician = {
  id: string;
  name: string;
  phone: string;
  whatsapp: string | null;
  photo_url: string | null;
  specialties: string[] | null;
  experience_years: number | null;
  is_available: boolean | null;
  display_order: number | null;
};

const emptyForm = {
  name: '',
  phone: '',
  whatsapp: '',
  photo_url: '',
  specialties: '',
  experience_years: '',
  is_available: true,
  display_order: 0,
};

// ── Single-photo uploader for electricians ──────────────────────────
function PhotoUploader({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'electricians');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onChange(data.url);
    } catch (e) {
      alert('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: uploading,
  });

  if (value) {
    return (
      <div className="relative h-32 w-32 rounded-2xl overflow-hidden ring-2 ring-slate-200 group">
        <Image src={value} alt="Photo" fill className="object-cover" />
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`h-32 w-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all text-slate-400
        ${isDragActive ? 'border-primary bg-primary/5 text-primary' : 'border-slate-300 hover:border-primary hover:text-primary'}
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />
      {uploading
        ? <ArrowPathIcon className="h-7 w-7 animate-spin text-primary" />
        : <>
            <PhotoIcon className="h-7 w-7 mb-1" />
            <span className="text-xs font-medium">Upload Photo</span>
          </>
      }
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────
export default function AdminElectriciansPage() {
  const [electricians, setElectricians] = useState<Electrician[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const supabase = createPublicClient();

  useEffect(() => { fetchElectricians(); }, []);

  const fetchElectricians = async () => {
    const { data } = await supabase
      .from('electricians')
      .select('*')
      .order('display_order', { ascending: true });
    setElectricians(data || []);
    setLoading(false);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (elec: Electrician) => {
    setForm({
      name: elec.name,
      phone: elec.phone,
      whatsapp: elec.whatsapp || '',
      photo_url: elec.photo_url || '',
      specialties: elec.specialties?.join(', ') || '',
      experience_years: elec.experience_years?.toString() || '',
      is_available: elec.is_available ?? true,
      display_order: elec.display_order ?? 0,
    });
    setEditingId(elec.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      alert('Name and phone are required');
      return;
    }
    setSaving(true);

    const payload = {
      name: form.name,
      phone: form.phone,
      whatsapp: form.whatsapp || null,
      photo_url: form.photo_url || null,
      specialties: form.specialties
        ? form.specialties.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      experience_years: form.experience_years ? Number(form.experience_years) : null,
      is_available: form.is_available,
      display_order: Number(form.display_order) || 0,
    };

    if (editingId) {
      const { error } = await supabase.from('electricians').update(payload).eq('id', editingId);
      if (error) alert('Error: ' + error.message);
    } else {
      const { error } = await supabase.from('electricians').insert(payload);
      if (error) alert('Error: ' + error.message);
    }

    setSaving(false);
    setShowForm(false);
    fetchElectricians();
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from('electricians').update({ is_available: !current }).eq('id', id);
    fetchElectricians();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this electrician?')) return;
    await supabase.from('electricians').delete().eq('id', id);
    fetchElectricians();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Electricians</h1>
          <p className="text-sm text-slate-500 mt-1">{electricians.length} team members</p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" /> Add Electrician
        </Button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Edit Electrician' : 'Add Electrician'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Photo Upload */}
              <div>
                <label className="label mb-2 block">Photo</label>
                <PhotoUploader
                  value={form.photo_url}
                  onChange={(url) => setForm({ ...form, photo_url: url })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Name *</label>
                  <input
                    className="input-field"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">WhatsApp</label>
                  <input
                    className="input-field"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="98XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="label">Experience (years)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.experience_years}
                    onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <label className="label">Specialties (comma separated)</label>
                <input
                  className="input-field"
                  value={form.specialties}
                  onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                  placeholder="House wiring, Solar installation, AC fitting"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Display Order</label>
                  <input
                    type="number"
                    className="input-field"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_available}
                      onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                      className="h-5 w-5 rounded text-primary"
                    />
                    <span className="font-medium text-slate-700">Available</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update' : 'Add Electrician'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Electricians Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">Loading...</div>
      ) : electricians.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👷</p>
          <p className="text-slate-500 font-medium">No electricians yet</p>
          <Button onClick={openAdd} className="mt-4">Add First Electrician</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {electricians.map((elec) => (
            <div key={elec.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {elec.photo_url ? (
                    <Image src={elec.photo_url} alt={elec.name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary text-white text-xl font-bold">
                      {elec.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900">{elec.name}</h3>
                  <p className="text-sm text-slate-500">{elec.phone}</p>
                  {elec.experience_years && (
                    <p className="text-xs text-slate-400">{elec.experience_years} years exp.</p>
                  )}
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${elec.is_available ? 'bg-green-500' : 'bg-red-400'}`} />
                    <span className="text-xs font-medium text-slate-600">
                      {elec.is_available ? 'Available' : 'Busy'}
                    </span>
                  </div>
                </div>
              </div>

              {elec.specialties && elec.specialties.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {elec.specialties.map((s: string) => (
                    <span key={s} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => toggleAvailability(elec.id, elec.is_available ?? true)}
                >
                  Toggle Status
                </Button>
                <Button variant="outline" className="px-3" onClick={() => openEdit(elec)}>
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <button
                  onClick={() => handleDelete(elec.id)}
                  className="px-3 rounded-xl border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
