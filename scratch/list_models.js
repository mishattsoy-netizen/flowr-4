const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = value;
    }
  });
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(url, key);

async function list() {
  const { data, error } = await supabaseAdmin
    .from('router_chains')
    .select('*');
  
  if (error) {
    console.error("Error reading router_chains:", error);
    return;
  }
  
  console.log("ROUTER CHAINS:");
  console.log(JSON.stringify(data, null, 2));
}

list();
