const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/)[1].trim();

const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('bot_brain_entries').insert({ category: 'style', title: 'test', content: 'test', source: 'manual' }).select();
  console.log("Insert 'style':", error ? error.code + ' ' + error.message : "SUCCESS (id: " + data[0].id + ")");
  
  if (!error) {
    await supabase.from('bot_brain_entries').delete().eq('id', data[0].id);
  }

  const { data: d2, error: e2 } = await supabase.from('bot_brain_entries').insert({ category: 'patterns', title: 'test', content: 'test', source: 'manual' }).select();
  console.log("Insert 'patterns':", e2 ? e2.code + ' ' + e2.message : "SUCCESS (id: " + d2[0].id + ")");
  
  if (!e2) {
    await supabase.from('bot_brain_entries').delete().eq('id', d2[0].id);
  }
}
run();
