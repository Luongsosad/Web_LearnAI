import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { findOrCreateGoogleUser, findUserById } from '../models/userModels.js';
import { generateAccessToken, generateRefreshToken } from '../utils/auth.js';

dotenv.config();

const url = process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback";

// Cấu hình strategy Google
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${url}`
}, async (accessToken, refreshToken, profile, cb) => {
    try {
        const user = await findOrCreateGoogleUser(
            profile.id,
            profile.displayName,
            profile.emails[0].value
        );
        return cb(null, user);
    } catch (err) {
        return cb(err, null);
    }
}));

// Serialize user vào session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user từ session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await findUserById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

export default passport;