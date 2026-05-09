import { supabaseAdmin } from '../src/lib/supabase'

async function test() {
  console.log('Checking message_logs columns...')
  try {
    const { data, error } = await supabaseAdmin.from('message_logs').select('*').limit(1)
    if (error) {
      console.error('Error selecting row:', error)
    } else {
      console.log('Columns found:', Object.keys(data?.[0] || {}))
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

test()
