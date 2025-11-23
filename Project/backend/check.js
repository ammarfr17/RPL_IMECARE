const http = require('http');
http.get('http://localhost:4000/api/complaints', (res) => {
  let d = '';
  res.on('data', c => d += c);
  res.on('end', () => console.log('STATUS', res.statusCode, 'BODY', d));
}).on('error', e => console.error('ERR', e.message));
