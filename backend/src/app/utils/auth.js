import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import process from 'process';
import { randomUUID } from 'crypto';
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
function generateAccessToken(user, deviceId) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      plan_id: user.plan_id,
      type: 'access',
      deviceId: deviceId,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Access token sống 15 phút
  );
}

// Tạo refresh token
function generateRefreshToken(user) {
  const deviceId = randomUUID();
  return {
    refreshToken: jwt.sign(
      { id: user.id, email: user.email, type: 'refresh', deviceId: deviceId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '15d' } // Refresh token sống 15 ngày
    ),
    deviceId: deviceId,
  };
}

export { hashPassword, comparePassword, generateAccessToken, generateRefreshToken };
