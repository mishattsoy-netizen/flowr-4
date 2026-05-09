const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Manually parse .env file
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

if (!url || !key) {
  console.error("Missing Supabase configuration");
  process.exit(1);
}

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
    console.error("Decryption failed:", err.message);
    return null;
  }
}

async function test() {
  console.log("Fetching Gemini keys...");
  const { data: accounts, error: accError } = await supabaseAdmin
    .from('vault_accounts')
    .select('id')
    .eq('provider', 'gemini')
    .eq('is_active', true);

  if (accError || !accounts || accounts.length === 0) {
    console.error("No active gemini accounts found", accError);
    return;
  }

  const accountIds = accounts.map(a => a.id);
  const { data, error } = await supabaseAdmin
    .from('vault')
    .select('key_id, encrypted_value')
    .in('account_id', accountIds);

  if (error || !data || data.length === 0) {
    console.error("No keys found in vault", error);
    return;
  }

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
  if (!apiKey) {
    console.error("Failed to decrypt API key");
    return;
  }

  console.log("API Key decrypted successfully.");
  const genAI = new GoogleGenerativeAI(apiKey);

  console.log("Testing generateContent with gemini-3.1-flash-lite-preview and tools [{ googleSearch: {} }] + fallback retry...");
  try {
    let model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite-preview",
      tools: [{ googleSearch: {} }]
    }, { apiVersion: 'v1beta' });

    let useWebSearch = true;
    let response;
    try {
      const result = await model.generateContent("Who is the president of France today?");
      response = result.response;
    } catch (err) {
      const errStr = err.message || '';
      if (useWebSearch && (errStr.includes('quota') || errStr.includes('429') || errStr.includes('details') || errStr.includes('grounding') || errStr.includes('Requests'))) {
        console.warn("Google Search grounding failed with quota error. Retrying plain generation...");
        useWebSearch = false;
        model = genAI.getGenerativeModel({
          model: "gemini-3.1-flash-lite-preview"
        }, { apiVersion: 'v1beta' });
        const result = await model.generateContent("Who is the president of France today?");
        response = result.response;
      } else {
        throw err;
      }
    }

    console.log("Success! Response text:");
    console.log(response.text());
  } catch (err) {
    console.error("FAILED! Error details:");
    console.error(err);
  }
}

test();
