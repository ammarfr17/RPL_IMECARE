// PostgreSQL pool helper
// Reads connection details from environment variables:
// PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGSSLMODE (optional: require/disable)
// Falls back to DATABASE_URL if provided.

const { Pool } = require('pg');

function makePoolFromEnv() {
  const connectionString = process.env.DATABASE_URL || null;
  if (connectionString) {
    return new Pool({ connectionString });
  }

  const host = process.env.PGHOST || 'localhost';
  const port = process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432;
  const user = process.env.PGUSER || 'postgres';
  const password = process.env.PGPASSWORD || '';
  const database = process.env.PGDATABASE || 'postgres';

  const sslMode = (process.env.PGSSLMODE || '').toLowerCase();
  const ssl = sslMode === 'require' || sslMode === 'true' ? { rejectUnauthorized: false } : false;

  return new Pool({ host, port, user, password, database, ssl });
}

const pool = makePoolFromEnv();

module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};

/**
 * Verify DB connectivity by running a simple query with retries.
 * options: { retries: number, delay: ms }
 */
module.exports.checkConnection = async function checkConnection(options = {}) {
  const retries = typeof options.retries === 'number' ? options.retries : 5;
  const delay = typeof options.delay === 'number' ? options.delay : 1000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // simple lightweight query
      await pool.query('SELECT 1');
      return true;
    } catch (err) {
      const isLast = attempt === retries;
      console.error(`DB connection attempt ${attempt} failed: ${err.message}${isLast ? '' : ', retrying...'}`);
      if (isLast) throw err;
      // wait
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return false;
};
