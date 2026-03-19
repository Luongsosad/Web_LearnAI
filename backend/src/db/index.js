import { drizzle } from 'drizzle-orm/node-postgres';
import pool from '../app/config/database.js';
import * as schema from './schema.js';

const db = drizzle(pool, { schema });

export { db, schema };
