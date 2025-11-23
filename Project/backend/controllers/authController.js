const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const secret = process.env.JWT_SECRET || 'dev-secret';

// Login using users table in Postgres
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  try {
    const q = 'SELECT id, username, email, password_hash, role FROM users WHERE username = $1 OR email = $1 LIMIT 1';
    const r = await db.query(q, [username]);
    if (!r || !r.rows || r.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = r.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role, email: user.email }, secret, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Auth login error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// register a new admin into the users table (protected by middleware)
exports.registerAdmin = async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'username, email and password required' });
  if (!req.user || (req.user.role !== 'superadmin' && req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // check exists
    const exists = await db.query('SELECT id FROM users WHERE username=$1 OR email=$2 LIMIT 1', [username, email]);
    if (exists.rows.length > 0) return res.status(400).json({ error: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const insert = 'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role';
    const r = await db.query(insert, [username, email, hash, role || 'admin']);
    const newUser = r.rows[0];
    res.status(201).json(newUser);
  } catch (err) {
    console.error('Auth register error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = exports;
