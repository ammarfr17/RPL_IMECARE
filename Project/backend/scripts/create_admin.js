const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const db = require('../db');
const bcrypt = require('bcrypt');

async function upsertAdmin({ username, email, password, role = 'superadmin' }) {
  const hash = await bcrypt.hash(password, 10);
  // check existing
  const existing = await db.query('SELECT id FROM users WHERE username=$1 OR email=$2', [username, email]);
  if (existing.rowCount > 0) {
    const id = existing.rows[0].id;
    await db.query('UPDATE users SET password_hash=$1, role=$2 WHERE id=$3', [hash, role, id]);
    console.log(`Updated existing user id=${id} (${username})`);
    return id;
  } else {
    const r = await db.query('INSERT INTO users (username,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id', [username, email, hash, role]);
    console.log(`Created user id=${r.rows[0].id} (${username})`);
    return r.rows[0].id;
  }
}

// Default values based on conversation
const defaultUser = {
  username: 'ammar',
  email: 'ammarfr1703@gmail.com',
  password: 'ammarfr17',
  role: 'superadmin',
};

(async () => {
  try {
    console.log('Connecting to DB...');
    const id = await upsertAdmin(defaultUser);
    console.log('Done. User id=', id);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create/update admin:', err.message || err);
    process.exit(1);
  }
})();
