const URL = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';
const TOKEN = 'hf_DImXvGisCjscZzYwzZzYwzZzYwzZzYwzZzYw'; // I'll get the real token from the vault first

// Wait, I can't easily get the real token because it's encrypted.
// I'll write a script that uses the existing vault decryption logic.

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());
import { getProviderKeys } from '../src/lib/vault';

async function test() {
  const keys = await getProviderKeys('HUGGINGFACE');
  console.log('Found keys:', keys.length);
  if (keys.length === 0) return;
  
  const token = keys[0];
  console.log('Testing with token:', token.slice(0, 4) + '...');
  
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: 'a beautiful cat' })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    const text = await response.text();
    console.log('Response:', text.slice(0, 500));
  } catch (e) {
    console.error('Fetch error:', e);
  }
}

test();
