import { generateAccessToken, generateRefreshToken } from './auth.js';
import dotenv from 'dotenv';

import process from 'process';
dotenv.config();

// Hàm thiết lập cookies cho token (dùng trong Google callback)
export function setTokenCookies(res, user) {
  const { refreshToken, deviceId } = generateRefreshToken(user);
  const accessToken = generateAccessToken(user, deviceId);

  console.log(accessToken);
  console.log(refreshToken);

  console.log(process.env.NODE_ENV);

  res.cookie('device_id', deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000, // 15 ngày + 15 phút
  });

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 phút
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 ngày
  });

  return { accessToken, refreshToken };
}
