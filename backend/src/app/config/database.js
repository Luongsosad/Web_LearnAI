import { Pool } from 'pg';
import dotenv from 'dotenv';

// Khởi tạo biến môi trường
dotenv.config({ path: './src/app/config/.env' });

const pool = new Pool({
    user: process.env.DTB_USER,
    host: process.env.DTB_HOST,
    database: process.env.DTB_DATABASE,
    password: process.env.DTB_PASSWORD,
    port: Number(process.env.DTB_PORT),
    ssl: {
        rejectUnauthorized: false,
    },
});

console.log('Connecting as user:', process.env.DTB_USER);

export default pool;
