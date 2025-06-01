import express from 'express';
import passport from 'passport';
import { register, login, logout, sendCode, resendCode } from '../controllers/AuthController.js';
import { setTokenCookies } from '../utils/token.js';

import dotenv from 'dotenv';

dotenv.config();

const authRoute = express.Router();

authRoute.post('/register', register);
authRoute.post('/login', login);
authRoute.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRoute.post('/send-code', sendCode);
authRoute.post('/resend-code', resendCode);


authRoute.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        setTokenCookies(res, req.user);
        res.redirect(`${process.env.FRONTEND_URL}`); // Hoặc route bạn muốn sau khi đăng nhập
    }
);

// Route đăng xuất
authRoute.get('/logout', logout);

export { authRoute };
