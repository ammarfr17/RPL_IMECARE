-- SQL schema for complaints table (Postgres)

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  jenis TEXT NOT NULL,
  complaint TEXT NOT NULL,
  file_url TEXT,
  status TEXT DEFAULT 'Baru',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Users table for admin accounts
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Optional: store uploaded file metadata (if you want to normalize uploads)
CREATE TABLE IF NOT EXISTS uploads (
  id SERIAL PRIMARY KEY,
  original_name TEXT,
  stored_path TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT,
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example: insert top-tier admin (replace <BCRYPT_HASH> with an actual bcrypt hash)
-- INSERT INTO users (username, email, password_hash, role) VALUES
--   ('ammar','ammarfr1703@gmail.com','<BCRYPT_HASH>', 'superadmin');

-- NOTE: to create a bcrypt hash on your machine with node:
--   node -e "const b=require('bcrypt');console.log(b.hashSync(process.env.PW||'ChangeMe123!',10))"
-- then copy the printed hash into the INSERT above and run it against the database.
