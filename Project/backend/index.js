// load .env when present (local dev convenience)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 4000;
const host = process.env.HOST || '0.0.0.0';
const path = require('path');

app.use(cors());
app.use(express.json());

// serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const complaintRoutes = require('./routes/complaintRoutes');
app.use('/api/complaints', complaintRoutes);

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Backend for RPL_19_CARE running' });
});

// DB health check before starting server
const db = require('./db');

(async function start() {
  try {
    console.log('Checking database connection...');
    await db.checkConnection({ retries: 5, delay: 1000 });
    console.log('Database connection OK');
  } catch (err) {
    console.error('Database connection failed after retries:', err && err.message ? err.message : err);
    process.exit(1);
  }

  app.listen(port, host, () => {
    console.log(`Backend listening on http://${host}:${port}`);
  });
})();
