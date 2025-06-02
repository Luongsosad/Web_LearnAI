import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Hàm hash mật khẩu
async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

// Hàm kiểm tra mật khẩu
async function comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Tạo access token
function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role, plan_id: user.plan_id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Access token sống 15 phút
    );
}

// Tạo refresh token
function generateRefreshToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '15d' } // Refresh token sống 15 ngày
    );
}

export { hashPassword, comparePassword, generateAccessToken, generateRefreshToken };