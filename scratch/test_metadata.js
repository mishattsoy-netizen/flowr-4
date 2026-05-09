const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
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

function decrypt(text, ivHex) {
  try {
    const algorithm = 'aes-256-cbc';
    const key = process.env.ENCRYPTION_KEY || '';
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(ivHex, 'hex'));
    let decrypted = decipher.update(Buffer.from(text, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    return null;
  }
}

async function test() {
  const { data: accounts } = await supabaseAdmin
    .from('vault_accounts')
    .select('id')
    .eq('provider', 'gemini')
    .eq('is_active', true);

  const { data } = await supabaseAdmin
    .from('vault')
    .select('key_id, encrypted_value')
    .in('account_id', accounts.map(a => a.id));

  // Try different keys to find one that has grounding quota today or wait
  for (const item of data) {
    let iv = '';
    let encryptedData = '';
    try {
      const parsed = JSON.parse(item.encrypted_value);
      iv = parsed.iv;
      encryptedData = parsed.encryptedData;
    } catch (e) {
      const parts = item.encrypted_value.split(':');
      iv = parts[0];
      encryptedData = parts[1];
    }

    const apiKey = decrypt(encryptedData, iv);
    if (!apiKey) continue;

    const genAI = new GoogleGenerativeAI(apiKey);
    try {
      // Use gemini-1.5-flash or gemini-2.0-flash-exp or pro which might have better grounding quota
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        tools: [{ googleSearch: {} }]
      }, { apiVersion: 'v1beta' });

      console.log(`Trying key with gemini-1.5-flash...`);
      const result = await model.generateContent("What is the latest AI news today?");
      const response = result.response;
      
      console.log("CANDIDATE:");
      console.log(JSON.stringify(response.candidates?.[0], null, 2));
      return;
    } catch (err) {
      console.error("Failed on this key:", err.message);
    }
  }
}

test();
