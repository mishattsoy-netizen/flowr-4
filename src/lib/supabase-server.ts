import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getSecret(name: string): Promise<string | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('app_secrets')
    .select('value')
    .eq('key', name)
    .single();
  if (error || !data) return null;
  return data.value as string;
}

// Returns first non-empty key from a pool (prefix_0 … prefix_4), round-robins via slot index
export async function getKeyFromPool(prefix: string): Promise<string | null> {
  const supabase = getServiceClient();
  if (!supabase) return null;
  const keys = Array.from({ length: 5 }, (_, i) => `${prefix}_${i}`);
  const { data } = await supabase.from('app_secrets').select('key, value').in('key', keys);
  if (!data?.length) return null;
  for (const k of keys) {
    const row = data.find(r => r.key === k);
    if (row?.value?.trim()) return row.value.trim();
  }
  return null;
}

export const getGeminiKey = () => getKeyFromPool('gemini_api_key');
export const getGroqKey = () => getKeyFromPool('groq_api_key');
export const getOpenRouterKey = () => getKeyFromPool('openrouter_api_key');
