import { createPublicClient } from '@/lib/supabase/server';

export const revalidate = 3600;

export default async function ServicesPage() {
  const supabase = createPublicClient();

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Our Services</h1>
      <ul>
        {services?.map((s) => (
          <li key={s.id}>
            <strong>{s.icon} {s.title_en}</strong>
            {s.title_np && <span> / {s.title_np}</span>}
            {s.description_en && <p>{s.description_en}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}