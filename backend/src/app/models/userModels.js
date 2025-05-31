import pool from '../config/database.js';
import jwt from 'jsonwebtoken';

// Model để tạo user mới (đăng ký thường)
async function createUser(username, email, password) {
    const query = `
        INSERT INTO users (username, email, password, plan_id, created_at)
        VALUES ($1, $2, $3, 1, NOW())
        RETURNING id, username, email, role, created_at
    `;
    const values = [username, email, password];
    try {
        const res = await pool.query(query, values);
        return res.rows[0];
    } catch (err) {
        throw new Error('Error creating user: ' + err.message);
    }
}

// Model để tìm user bằng email (đăng nhập thường)
async function findUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    try {
        const res = await pool.query(query, [email]);
        return res.rows[0];
    } catch (err) {
        throw new Error('Error finding user: ' + err.message);
    }
}

// Model để tìm user bằng id
async function findUserById(id) {
    const query = 'SELECT * FROM users WHERE id = $1';
    try {
        const res = await pool.query(query, [id]);
        return res.rows[0];
    } catch (err) {
        throw new Error('Error finding user: ' + err.message);
    }
}

// Model để tìm hoặc tạo user từ Google
async function findOrCreateGoogleUser(googleId, displayName, email) {
    let user;
    const findQuery = 'SELECT * FROM users WHERE google_id = $1';
    try {
        const res = await pool.query(findQuery, [googleId]);
        user = res.rows[0];
        if (!user) {
            const createQuery = `
                INSERT INTO users (username, email, google_id, plan_id, created_at)
                VALUES ($1, $2, $3, 1, NOW())
                RETURNING id, username, email, google_id, role, created_at
            `;
            const values = [displayName, email, googleId];
            const createRes = await pool.query(createQuery, values);
            user = createRes.rows[0];
        }
        return user;
    } catch (err) {
        throw new Error('Error with Google user: ' + err.message);
    }
}

// Kiểm tra refresh token
async function verifyRefreshToken(refreshToken) {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await findUserById(decoded.id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (err) {
        throw new Error('Invalid refresh token: ' + err.message);
    }
}

export { createUser, findUserByEmail, findUserById, findOrCreateGoogleUser, verifyRefreshToken };