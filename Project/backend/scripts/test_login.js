const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fetch = global.fetch || require('node-fetch');

async function main(){
  const base = process.env.BASE_URL || 'http://localhost:4000';
  try{
    console.log('Logging in as ammar (first try uses password from env or ammarfr17)...');
    const firstPassword = process.env.TEST_PASSWORD || 'ammarfr17';
    let res = await fetch(base + '/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ username: 'ammar', password: firstPassword })
    });
    let txt = await res.text();
    let data;
    try{ data = JSON.parse(txt); }catch(e){ data = txt }
    console.log('First login attempt', res.status, data);

    // if first attempt failed, try seeded backend default ADMIN_PASSWORD (ChangeMe123!)
    if(!(res.ok && data && data.token)){
      const fallback = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
      console.log('Retrying with seeded backend password:', fallback === 'ChangeMe123!' ? '(default) ChangeMe123!' : '(from ADMIN_PASSWORD env)');
      res = await fetch(base + '/api/auth/login', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ username: 'ammar', password: fallback })
      });
      txt = await res.text();
      try{ data = JSON.parse(txt); }catch(e){ data = txt }
      console.log('Second login attempt', res.status, data);
    }

    if(res.ok && data && data.token){
      console.log('Token received, fetching protected /api/complaints...');
      const r2 = await fetch(base + '/api/complaints', { headers: { Authorization: 'Bearer ' + data.token } });
      const body = await r2.text();
      try{ console.log('Complaints status', r2.status, JSON.parse(body)); }catch(e){ console.log('Complaints status', r2.status, body); }
    } else {
      console.log('Login failed after both attempts; cannot test protected endpoint');
    }
  }catch(err){
    console.error('Test script error', err);
    process.exit(1);
  }
}

main();
