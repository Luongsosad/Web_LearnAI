import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  logout,
  refresh,
  sendCode,
  resendCode,
} from '../controllers/AuthController.js';
import { listDevices, logoutDevice, logoutAllDevices } from '../controllers/DeviceController.js';
import { setTokenCookies } from '../utils/token.js';

import process from 'process';
import dotenv from 'dotenv';
import { verifyRefreshToken } from '../models/userModels.js';

dotenv.config();

const authRoute = express.Router();

authRoute.post('/refresh', refresh);
authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRoute.post('/send-code', sendCode);
authRoute.post('/resend-code', resendCode);

// Quản lý thiết bị đăng nhập
authRoute.get('/devices', listDevices); // Lấy danh sách thiết bị
authRoute.post('/devices/logout', logoutDevice); // Đăng xuất thiết bị cụ thể
authRoute.post('/devices/logout-all', logoutAllDevices); // Đăng xuất toàn bộ thiết bị

authRoute.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  async (req, res) => {
    // Lưu device info + refreshToken vào DB
    try {
      const { addDeviceUser, getDeviceUsers } = await import('../models/deviceUsers.js');
      const MAX_DEVICES = 5;
      const deviceInfo = req.headers['user-agent'] + ' | ' + req.ip;
      const devices = await getDeviceUsers(req.user.id);
      if (devices.length < MAX_DEVICES) {
        const { refreshToken } = await setTokenCookies(res, req.user);
        const user = await verifyRefreshToken(refreshToken);
        await addDeviceUser(req.user.id, user.deviceId, deviceInfo, refreshToken);
      }
    } catch (err) {
      console.error('Device save error:', err);
    }
    res.redirect(`${process.env.FRONTEND_URL}`); // Hoặc route bạn muốn sau khi đăng nhập
  }
);

// Route đăng xuất
authRoute.post('/logout', logout);

export { authRoute };
