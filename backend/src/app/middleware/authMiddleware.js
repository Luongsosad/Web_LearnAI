// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { verifyRefreshToken } from '../models/userModels.js';
import { generateAccessToken } from '../utils/auth.js';
import process from 'process';

import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = async (req, res, next) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  // console.log('Access token:', accessToken);
  // console.log('Refresh token:', refreshToken);

  // Kiểm tra access token
  if (accessToken) {
    try {
      const user = await new Promise((resolve, reject) => {
        jwt.verify(accessToken, process.env.JWT_SECRET, (err, user) => {
          if (err) reject(err);
          else resolve(user);
        });
      });
      req.user = user;
      return next(); // Access token hợp lệ, cho qua
    } catch (err) {
      // Access token không hợp lệ hoặc hết hạn, tiếp tục kiểm tra refresh token
      console.log('Access token error:', err.name);
    }
  }

  // Kiểm tra refresh token
  if (!refreshToken) {
    return res.status(200).json({ success: false, message: 'No refresh token provided' }); // Bình thường nhưng fail
  }

  // Kiểm tra refresh token
  if (refreshToken) {
    try {
      const userFromRefresh = await verifyRefreshToken(refreshToken); // Kiểm tra refresh token
      const newAccessToken = generateAccessToken(userFromRefresh); // Tạo access token mới
      console.log('Tạo lại access token');
      // Set lại access token mới vào cookie
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 60 * 1000, // 15 phút
      });

      req.user = userFromRefresh;
      return next(); // Refresh token hợp lệ, cho qua
    } catch (refreshErr) {
      console.log('Refresh token error:', refreshErr.message);
    }
  }
};
