const URL = 'https://qmufalwubepttjxehvit.supabase.co/rest/v1/bot_improvement_plans?select=*&limit=1';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtdWZhbHd1YmVwdHRqeGVodml0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjAxOTUzNywiZXhwIjoyMDkxNTk1NTM3fQ.bWimy69Nxs_Ek-jiVyzIVJ88KZ5H20Eczz3FpbiaAkM';

fetch(URL, {
  headers: {
    'apikey': KEY,
    'Authorization': `Bearer ${KEY}`
  }
})
.then(res => res.json())
.then(data => {
  if (data.length > 0) {
    console.log('Columns:', Object.keys(data[0]));
  } else {
    console.log('No data');
  }
})
.catch(err => console.error(err));
