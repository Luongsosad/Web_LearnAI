import { generateAccessToken, generateRefreshToken } from './auth.js';
import dotenv from 'dotenv';

dotenv.config();

export function setTokenCookies(res, user) {
    try {
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            throw new Error('JWT_SECRET is not defined');
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        if (!accessToken || !refreshToken) {
            console.error('Token generation failed:', { user });
            throw new Error('Failed to generate tokens');
        }

        console.log('Generated tokens:', { accessToken, refreshToken });
        console.log('Environment:', process.env.NODE_ENV);

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: isProduction, // Đảm bảo secure: true trong production
            sameSite: isProduction ? 'none' : 'lax', // 'none' yêu cầu secure
            maxAge: 15 * 60 * 1000, // 15 phút
            path: '/' // Đảm bảo cookie áp dụng cho toàn bộ domain
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
            maxAge: 15 * 24 * 60 * 60 * 1000, // 15 ngày
            path: '/'
        });

        console.log('Cookies set successfully');
    } catch (error) {
        console.error('Error in setTokenCookies:', error);
        throw error;
    }
}