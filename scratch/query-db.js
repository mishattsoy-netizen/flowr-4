
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

try {
  const env = fs.readFileSync('.env', 'utf8');
  const matchUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=["']?(.*?)["']?$/m);
  const matchKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=["']?(.*?)["']?$/m);

  if (!matchUrl || !matchKey) {
    console.error('Environment variables missing from .env');
    process.exit(1);
  }

  const url = matchUrl[1].trim();
  const key = matchKey[1].trim();

  const supabase = createClient(url, key);

  async function run() {
    const { data: chains, error } = await supabase
      .from('router_chains')
      .select('category, model_list')
      .in('category', ['MEDIUM_THINKING', 'CLASSIFIER', 'FAST_SIMPLE']);

    if (error) {
      console.error('Error fetching router_chains:', error);
    } else {
      console.log('--- ROUTER CHAINS ---');
      console.log(JSON.stringify(chains, null, 2));
    }

    const { data: logs, error: logError } = await supabase
      .from('message_logs')
      .select('id, created_at, usage_type, model_chain, status, content')
      .order('created_at', { ascending: false })
      .limit(3);
      
    if (logError) {
      console.error('Error fetching logs:', logError);
    } else {
      console.log('\n--- RECENT MESSAGE LOGS ---');
      logs.forEach(log => {
        console.log(`ID: ${log.id} | Type: ${log.usage_type} | Status: ${log.status}`);
        console.log(`Chain: ${log.model_chain}\n`);
      });
    }
  }

  run();
} catch (err) {
  console.error('Script crashed:', err);
}
