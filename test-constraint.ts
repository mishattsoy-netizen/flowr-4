import { supabaseAdmin } from './src/lib/supabase';

async function test() {
  const { data, error } = await supabaseAdmin.from('bot_brain_entries').insert({
    category: 'style' as any,
    title: 'test',
    content: 'test',
    source: 'manual'
  });
  console.log("Insert 'style':", error?.code, error?.message);

  const { data: d2, error: e2 } = await supabaseAdmin.from('bot_brain_entries').insert({
    category: 'patterns' as any,
    title: 'test',
    content: 'test',
    source: 'manual'
  });
  console.log("Insert 'patterns':", e2?.code, e2?.message);
}

test();
