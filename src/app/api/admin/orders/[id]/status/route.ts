import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import type { Enums } from '@/types';

const VALID_STATUSES: Enums<'order_status'>[] = [
  'received',
  'processing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await userClient
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status: string };

  if (!VALID_STATUSES.includes(status as Enums<'order_status'>)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('orders')
    .update({ status: status as Enums<'order_status'> })
    .eq('id', id);

  if (error) {
    console.error('Order status update error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
