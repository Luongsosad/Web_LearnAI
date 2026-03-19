import { Pool } from 'pg';
import process from 'process';
import dotenv from 'dotenv';

// Khởi tạo biến môi trường
dotenv.config({ path: './src/app/config/.env' });

let pool;

// Prefer a single DATABASE_URL if provided, otherwise fall back to individual vars
if (process.env.DATABASE_URL) {
  console.log('Using DATABASE_URL for Postgres connection');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  console.log(
    'Using individual DTB_ env vars for Postgres connection, user:',
    process.env.DTB_USER
  );
  pool = new Pool({
    user: process.env.DTB_USER,
    host: process.env.DTB_HOST,
    database: process.env.DTB_DATABASE,
    password: process.env.DTB_PASSWORD,
    port: Number(process.env.DTB_PORT),
    ssl: {
      rejectUnauthorized: false,
    },
  });
}

export default pool;
