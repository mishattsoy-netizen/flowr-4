import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function verifyAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const anonClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: { user } } = await anonClient.auth.getUser(token);
  if (!user?.email) return false;
  const { data } = await getServiceClient().from('admins').select('email').eq('email', user.email).single();
  return !!data;
}

// GET — return all secrets as { key: value } map (masked values for display)
export async function GET(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { data, error } = await getServiceClient().from('app_secrets').select('key, value');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const secrets: Record<string, string> = {};
  for (const row of data ?? []) secrets[row.key] = row.value;
  return NextResponse.json({ secrets });
}

// POST — upsert a single secret { key, value } or delete if value is empty
export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { key, value } = await req.json();
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });

  const supabase = getServiceClient();
  if (!value || value.trim() === '') {
    await supabase.from('app_secrets').delete().eq('key', key);
  } else {
    await supabase.from('app_secrets').upsert({ key, value: value.trim() });
  }
  return NextResponse.json({ ok: true });
}
