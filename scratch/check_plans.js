const URL = 'https://qmufalwubepttjxehvit.supabase.co/rest/v1/bot_improvement_plans?select=topic,title,status&status=eq.accepted';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtdWZhbHd1YmVwdHRqeGVodml0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxOTUzNywiZXhwIjoyMDkxNTk1NTM3fQ.bWimy69Nxs_Ek-jiVyzIVJ88KZ5H20Eczz3FpbiaAkM';

fetch(URL, {
  headers: {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`
  }
})
.then(res => res.json())
.then(data => {
  console.log(JSON.stringify(data, null, 2));
})
.catch(err => console.error(err));
