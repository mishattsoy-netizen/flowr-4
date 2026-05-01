import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET() {
  const res1 = await supabase.from('bot_settings').select('category, content, is_active, updated_at').order('category');
  const res2 = await supabase.from('bot_compiled_prompt').select('content, compiled_at, entry_count').eq('id', 1).single();
  return NextResponse.json({
    settingsError: res1.error,
    compiledError: res2.error
  });
}
