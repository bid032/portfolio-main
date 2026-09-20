const https = require('https');

function getCount(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'qbxwddtepdpwcvteqnaf.supabase.co',
      path: path,
      method: 'GET',
      headers: {
        'apikey': 'sb_secret_B1jiXBcwo4BX4Oda-rCGfQ_r-5FjLfD',
        'Authorization': 'Bearer sb_secret_B1jiXBcwo4BX4Oda-rCGfQ_r-5FjLfD',
        'Prefer': 'count=exact',
        'Range-Unit': 'items',
        'Range': '0-1000'
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('CONTENT-RANGE HEADER:', res.headers['content-range']);
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch(e) { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

async function run() {
  console.log('--- FREE DOWNLOADS ---');
  const free = await getCount('/rest/v1/free_downloads?select=*');
  console.log('FREE DOWNLOADS COUNT (Range 0-1000):', free.length);

  console.log('--- ORDERS ---');
  const orders = await getCount('/rest/v1/orders?select=*');
  console.log('ORDERS COUNT (Range 0-1000):', orders.length);
}

run();
