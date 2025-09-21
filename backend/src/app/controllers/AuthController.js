import { createUser, findUserByEmail } from '../models/userModels.js';
import { hashPassword, comparePassword, generateRefreshToken } from '../utils/auth.js';
import { setTokenCookies } from '../utils/token.js';
import { sendVerificationEmail } from '../utils/email.js';
import process from 'process';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../utils/auth.js';
import {
  addDeviceUser,
  deleteDeviceUser,
  findDeviceByDeviceId,
  getDeviceUsers,
} from '../models/deviceUsers.js';

import dotenv from 'dotenv';

dotenv.config();

const MAX_DEVICES = 5; // Giới hạn số thiết bị đăng nhập

// Đăng ký user thường
async function register(req, res) {
  const { username, email, password, code } = req.body;
  if (!username || !email || !password || !code) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const storedHashedCode = req.cookies.verify_code;

  if (!storedHashedCode) {
    return res.status(400).json({ message: 'Code expired or not found' });
  }

  const isCodeMatch = await comparePassword(code, storedHashedCode);

  if (!isCodeMatch) {
    return res.status(400).json({ message: 'Incorrect verification code' });
  }

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await createUser(username, email, hashedPassword);

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login error' });
      setTokenCookies(res, user);
      return res.status(201).json({ message: 'Registered successfully' });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// Đăng nhập user thường
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    console.log(email, password);
    const user = await findUserByEmail(email);
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'User or Password wrong' });
    }
    req.login(user, async (err) => {
      if (err) return res.status(500).json({ message: 'Login error' });
      // Tạo accessToken và refreshToken
      const { refreshToken, deviceId } = generateRefreshToken(user);
      const accessToken = generateAccessToken(user, deviceId);
      // Kiểm tra số lượng thiết bị
      const devices = await getDeviceUsers(user.id);
      if (devices.length >= MAX_DEVICES) {
        return res
          .status(403)
          .json({ message: 'Đã đạt giới hạn thiết bị đăng nhập. Vui lòng đăng xuất thiết bị cũ.' });
      }
      // Lưu device info + refreshToken vào DB
      const deviceInfo = req.headers['user-agent'] + ' | ' + req.ip;
      await addDeviceUser(user.id, deviceId, deviceInfo, refreshToken);
      // Set cookies
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
        maxAge: 15 * 60 * 1000,
      });
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({
        message: 'Logged in successfully',
        user: { id: user.id, username: user.username, email: user.email, role: user.role },
      });
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

// Đăng xuất
function logout(req, res) {
  req.logout(async (err) => {
    if (err) return res.status(500).json({ message: 'Logout error' });
    // Xóa device khỏi DB theo refreshToken hiện tại
    try {
      const refreshToken = req.cookies['refresh_token'];
      if (refreshToken) {
        const user = await new Promise((resolve, reject) => {
          jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
            if (err) reject(err);
            else resolve(user);
          });
        });
        console.log('user: ', user);
        const device = await findDeviceByDeviceId(user.id, user.deviceId);
        if (device && device.id) {
          await deleteDeviceUser(device.id, user.id);
        } else {
          console.log('No device found for this refreshToken, nothing to delete.');
        }
      }
    } catch (e) {
      console.error('Device delete error:', e);
    }
    res.clearCookie('device_id');
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    console.log('Logged out successfully');
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
}

// Làm mới access token
async function refresh(req, res) {
  const refreshToken = req.cookies['refresh_token'];
  console.log(req.cookies['refresh_token']);
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    // Xác minh refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    console.log(decoded);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Tìm user dựa trên email hoặc id
    const user = await findUserByEmail(decoded.email);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Tạo access token mới
    const accessToken = generateAccessToken(user);

    // Gửi access token mới trong cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000, // 15 phút
    });

    return res.status(200).json({
      message: 'Access token refreshed successfully',
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
}

async function sendCode(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 số
  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    await sendVerificationEmail(email, code);

    // Hash code rồi lưu vào cookie
    const hashedCode = await hashPassword(code);

    res.cookie('verify_code', hashedCode, {
      httpOnly: true,
      maxAge: 90 * 1000, // 1'30"
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res.status(200).json({ message: 'Verification code sent' });
  } catch {
    return res.status(500).json({ message: 'Failed to send email' });
  }
}

async function resendCode(req, res) {
  return sendCode(req, res); // Gọi lại hàm trên
}

export { register, login, logout, refresh, sendCode, resendCode };
