'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import ImageUploader from '@/components/admin/ImageUploader';
import Image from 'next/image';

export default function AdminElectriciansPage() {
  const [electricians, setElectricians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchElectricians();
  }, []);

  const fetchElectricians = async () => {
    const { data } = await supabase.from('electricians').select('*').order('name');
    setElectricians(data || []);
    setLoading(false);
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    await supabase.from('electricians').update({ available: !current }).eq('id', id);
    fetchElectricians();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Electricians</h1>
        <Button>Add Electrician</Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {electricians.map((elec) => (
          <div key={elec.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {elec.photo ? (
                  <Image src={elec.photo} alt={elec.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary text-white font-bold">{elec.name.charAt(0)}</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{elec.name}</h3>
                <p className="text-sm text-slate-500">{elec.phone}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${elec.available ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium text-slate-700">{elec.available ? 'Available' : 'Busy'}</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => toggleAvailability(elec.id, elec.available)}>
                Toggle Status
              </Button>
              <Button variant="outline" className="flex-1">Edit</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
