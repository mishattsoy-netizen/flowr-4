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

  const firstKeyItem = data[0];
  let iv = '';
  let encryptedData = '';
  try {
    const parsed = JSON.parse(firstKeyItem.encrypted_value);
    iv = parsed.iv;
    encryptedData = parsed.encryptedData;
  } catch (e) {
    const parts = firstKeyItem.encrypted_value.split(':');
    iv = parts[0];
    encryptedData = parts[1];
  }

  const apiKey = decrypt(encryptedData, iv);
  const genAI = new GoogleGenerativeAI(apiKey);

  console.log("TEST 1: googleSearch: {}");
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      tools: [{ googleSearch: {} }]
    }, { apiVersion: 'v1beta' });
    const result = await model.generateContent("Who is the president of France today?");
    console.log("Success with googleSearch! Response:", result.response.text());
  } catch (err) {
    console.error("Failed with googleSearch:", err.message, err);
  }

  console.log("\nTEST 2: googleSearchRetrieval: {}");
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      tools: [{ googleSearchRetrieval: {} }]
    }, { apiVersion: 'v1beta' });
    const result = await model.generateContent("Who is the president of France today?");
    console.log("Success with googleSearchRetrieval! Response:", result.response.text());
  } catch (err) {
    console.error("Failed with googleSearchRetrieval:", err.message, err);
  }
}

test();
