import { createUser, findUserByEmail } from '../models/userModels.js';
import { hashPassword, comparePassword } from '../utils/auth.js';
import { setTokenCookies } from '../utils/token.js';
import { sendVerificationEmail } from '../utils/email.js';

import dotenv from 'dotenv';

dotenv.config();

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
        const user = await findUserByEmail(email);
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'User or Password wrong' });
        }
        req.login(user, (err) => {
            if (err) return res.status(500).json({ message: 'Login error' });
            setTokenCookies(res, user);
            return res.status(200).json({ message: 'Logged in successfully', user: { id: user.id, username: user.username, email: user.email, role: user.role } });
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

// Đăng xuất
function logout(req, res) {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Logout error' });
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        console.log('Logged out successfully')
        req.session.destroy(() => {
            res.status(200).json({ message: 'Logged out successfully' });
        });
    });
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
    } catch (err) {
        return res.status(500).json({ message: 'Failed to send email' });
    }
}

async function resendCode(req, res) {
    return sendCode(req, res); // Gọi lại hàm trên
}


export { register, login, logout, sendCode, resendCode };