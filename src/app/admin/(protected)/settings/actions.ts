'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function saveSettings(settings: Record<string, string>): Promise<{ error?: string }> {
  // Verify the caller is an authenticated admin
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { data: profile } = await userClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return { error: 'Forbidden' };

  // Use service role client for the actual write
  const supabase = createAdminClient();

  const upserts = Object.entries(settings).map(([key, value]) =>
    supabase
      .from('site_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
  );

  const results = await Promise.all(upserts);
  const failed = results.filter((r) => r.error);

  if (failed.length > 0) {
    console.error('[saveSettings] errors:', failed.map((r) => r.error));
    return { error: 'Failed to save some settings' };
  }

  return {};
}

export async function loadSettings(): Promise<Record<string, string>> {
  // Settings are public-readable — anon client is fine for reads
  const userClient = await createClient();
  const { data } = await userClient.from('site_settings').select('*');

  if (!data) return {};
  return data.reduce(
    (acc, row) => ({ ...acc, [row.key]: row.value ?? '' }),
    {} as Record<string, string>
  );
}
