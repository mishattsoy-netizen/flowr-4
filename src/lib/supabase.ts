import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && key ? createBrowserClient(url, key) : (null as any);

export const isSupabaseEnabled = !!(url && key);

export const supabaseAdmin = url && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : (null as any);
