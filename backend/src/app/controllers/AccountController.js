import { findUserByEmail } from '../models/userModels.js';

// Đăng nhập user thường
async function GetProfile(req, res) {
    const _user = req.user;

    try {
        const user = await findUserByEmail(_user.email);
        if (!user) {
            return res.status(401).json({ message: 'No User' });
        }

        return res.status(200).json({ message: 'Logged in successfully', user: { id: user.id, username: user.username, email: user.email, role: user.role, plan_id: user.plan_id } });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

export { GetProfile };