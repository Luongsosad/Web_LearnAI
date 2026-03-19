import 'dotenv/config';
import process from 'process';

function buildConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const user = process.env.DTB_USER;
  const password = process.env.DTB_PASSWORD;
  const host = process.env.DTB_HOST;
  const port = process.env.DTB_PORT;
  const database = process.env.DTB_DATABASE;

  if (!user || !password || !host || !port || !database) {
    return undefined;
  }

  return `postgres://${user}:${password}@${host}:${port}/${database}`;
}

export default {
  schema: './src/db/schema.js',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: buildConnectionString(),
    ssl: {
      rejectUnauthorized: false,
    },
  },
};
