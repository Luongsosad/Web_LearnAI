// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { verifyRefreshToken } from '../models/userModels.js';
import { findDeviceByDeviceId } from '../models/deviceUsers.js';
import { generateAccessToken } from '../utils/auth.js';
import process from 'process';

import dotenv from 'dotenv';

dotenv.config();

export const authenticateToken = async (req, res, next) => {
  const accessToken = req.cookies.access_token
    ? req.cookies.access_token
    : req.headers['x-access-token'];
  const refreshToken = req.cookies.refresh_token
    ? req.cookies.refresh_token
    : req.headers['x-refresh-token'];

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
      // Kiểm tra access_token có tồn tại trong DB không
      const device = await findDeviceByDeviceId(user.id, user.deviceId);
      if (!device) {
        // Nếu không tồn tại, xoá cookie và chặn truy cập
        res.clearCookie('device_id');
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res
          .status(200)
          .json({ success: false, message: 'Thiết bị đã đăng xuất hoặc không hợp lệ' });
      }
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

      const device = await findDeviceByDeviceId(userFromRefresh.id, userFromRefresh.deviceId);
      if (!device) {
        console.log('Device not found or refresh token mismatch');
        // Nếu không tồn tại, xoá cookie và chặn truy cập
        res.clearCookie('device_id');
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        return res
          .status(200)
          .json({ success: false, message: 'Thiết bị đã đăng xuất hoặc không hợp lệ' });
      }

      const newAccessToken = generateAccessToken(userFromRefresh, userFromRefresh.deviceId); // Tạo access token mới
      console.log('Tạo lại access token');
      // Set lại access token mới vào cookie
      res.cookie('access_token', newAccessToken, {
        httpOnly: true,
        domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined,
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
