const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./db');

(async () => {
  try {
    const info = await db.query("SELECT current_database() as current_database, current_schema() as current_schema, current_user as current_user");
    console.log('CONNECTION INFO:', info.rows[0]);

    const tables = await db.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'complaints'");
    console.log('TABLES named complaints visible to this connection:');
    console.table(tables.rows);

    const pgclass = await db.query("SELECT nspname as schema, relname as table_name FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE relname = 'complaints'");
    console.log('pg_class lookup:');
    console.table(pgclass.rows);

    process.exit(0);
  } catch (err) {
    console.error('ERROR running DB check:', err);
    process.exit(1);
  }
})();