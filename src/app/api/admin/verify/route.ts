import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey || !anonKey) {
    return NextResponse.json({ isAdmin: false, error: 'Supabase not configured' }, { status: 500 });
  }

  // Extract the user's JWT from the Authorization header
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ isAdmin: false, error: 'No token' }, { status: 401 });
  }

  // Verify the token and get the user
  const anonClient = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data: { user }, error } = await anonClient.auth.getUser(token);
  if (error || !user?.email) {
    return NextResponse.json({ isAdmin: false, error: 'Invalid session' }, { status: 401 });
  }

  // Check against admins table using service_role (bypasses RLS)
  const serviceClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error: adminError } = await serviceClient
    .from('admins')
    .select('email')
    .eq('email', user.email)
    .single();

  if (adminError || !data) {
    return NextResponse.json({ isAdmin: false, error: 'Not an admin' }, { status: 403 });
  }

  return NextResponse.json({ isAdmin: true, email: user.email });
}
